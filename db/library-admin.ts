import { and, desc, eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { adminActivity, categories, drafts, entries, versions } from './schema';
import type * as schema from './schema';
import { editableDefinitionSchema, nextVersion, type EditableDefinition } from '../lib/admin-validation';

export class LibraryEditError extends Error {}
type Db<T extends PgQueryResultHKT>=Pick<PgDatabase<T,typeof schema>,'select'|'transaction'>;
export async function readEditor<T extends PgQueryResultHKT>(db:Db<T>,id:string){
  const [entry]=await db.select().from(entries).where(eq(entries.id,id));if(!entry)return null;
  const [draft]=await db.select().from(drafts).where(eq(drafts.entryId,id));
  const history=await db.select().from(versions).where(eq(versions.entryId,id)).orderBy(desc(versions.createdAt));
  const current=history.find(row=>row.version===entry.currentVersion);
  const base=draft?.definition??current?.definition;
  if(!base)return null;
  const definition=editableDefinitionSchema.parse(base);
  if(!draft)definition.version=nextVersion(history[0]?.version??entry.currentVersion);
  return {entry,definition,revision:entry.editRevision,history};
}
export async function saveDraft<T extends PgQueryResultHKT>(db:Db<T>,actorId:string,input:unknown,id?:string,revision=0){
  const definition=editableDefinitionSchema.parse(input);
  return db.transaction(async tx=>{
    let entryId=id;
    if(entryId){
      const [entry]=await tx.select().from(entries).where(eq(entries.id,entryId)).for('update');
      if(!entry)throw new LibraryEditError('This item no longer exists.');
      if(entry.slug!==definition.slug||entry.kind!==definition.kind)throw new LibraryEditError('The slug and type cannot change after creation.');
      if(entry.editRevision!==revision)throw new LibraryEditError('Another edit was saved. Reload before saving again.');
    }else{
      const [duplicate]=await tx.select({id:entries.id}).from(entries).where(eq(entries.slug,definition.slug));
      if(duplicate)throw new LibraryEditError('This slug already exists. Open its editor to upload a new version.');
      const [entry]=await tx.insert(entries).values({slug:definition.slug,name:definition.name,kind:definition.kind,description:definition.description,publicationStatus:'draft',currentVersion:definition.version}).returning();entryId=entry.id;
    }
    await tx.insert(drafts).values({entryId,definition,revision:revision+1}).onConflictDoUpdate({target:drafts.entryId,set:{definition,revision:revision+1,updatedAt:new Date()}});
    await tx.update(entries).set({editRevision:revision+1,updatedAt:new Date()}).where(eq(entries.id,entryId));
    await tx.insert(adminActivity).values({entryId,actorId,action:'Saved draft'});
    return {id:entryId,revision:revision+1};
  });
}
export async function publishDraft<T extends PgQueryResultHKT>(db:Db<T>,actorId:string,id:string,revision:number){
  return db.transaction(async tx=>{
    const [entry]=await tx.select().from(entries).where(eq(entries.id,id)).for('update');
    const [draft]=await tx.select().from(drafts).where(eq(drafts.entryId,id));
    if(!entry||!draft||draft.revision!==revision||entry.editRevision!==revision)throw new LibraryEditError('Save your draft first, or reload to review the latest edit.');
    const definition=editableDefinitionSchema.parse(draft.definition);
    const [existing]=await tx.select({id:versions.id}).from(versions).where(and(eq(versions.entryId,id),eq(versions.version,definition.version)));
    if(existing)throw new LibraryEditError('That version has already been published. Choose a new version number.');
    const categorySlug=definition.category.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'general';
    await tx.insert(categories).values({name:definition.category,slug:categorySlug}).onConflictDoNothing();
    const [category]=await tx.select().from(categories).where(eq(categories.slug,categorySlug));
    await tx.insert(versions).values({entryId:id,version:definition.version,definition});
    await tx.update(entries).set({name:definition.name,description:definition.description,categoryId:category.id,currentVersion:definition.version,publicationStatus:'published',testingStatus:'not_evaluated',editRevision:revision+1,updatedAt:new Date()}).where(eq(entries.id,id));
    await tx.delete(drafts).where(eq(drafts.entryId,id));
    await tx.insert(adminActivity).values({entryId:id,actorId,action:`Published v${definition.version}`});
  });
}
export async function changePublication<T extends PgQueryResultHKT>(db:Db<T>,actorId:string,id:string,status:'draft'|'archived'|'published'){
  await db.transaction(async tx=>{
    const [entry]=await tx.select().from(entries).where(eq(entries.id,id)).for('update');
    if(!entry)throw new LibraryEditError('This item no longer exists.');
    if(status==='published'){
      const [version]=await tx.select({id:versions.id}).from(versions).where(and(eq(versions.entryId,id),eq(versions.version,entry.currentVersion)));
      if(!version)throw new LibraryEditError('Publish a saved draft before making this item public.');
    }
    await tx.update(entries).set({publicationStatus:status,editRevision:entry.editRevision+1,updatedAt:new Date()}).where(eq(entries.id,id));
    await tx.insert(adminActivity).values({entryId:id,actorId,action:status==='draft'?'Unpublished':status==='archived'?'Archived':'Republished current version'});
  });
}
export async function restoreVersion<T extends PgQueryResultHKT>(db:Db<T>,actorId:string,id:string,versionId:string,revision:number){
  const [previous]=await db.select().from(versions).where(and(eq(versions.id,versionId),eq(versions.entryId,id)));
  const editor=await readEditor(db,id);
  if(!previous||!editor)throw new LibraryEditError('Version not found.');
  const definition=editableDefinitionSchema.parse(previous.definition);
  definition.version=nextVersion(editor.history[0]?.version??definition.version);
  return saveDraft(db,actorId,definition,id,revision);
}
