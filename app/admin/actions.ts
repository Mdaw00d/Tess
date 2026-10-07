'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDatabase, adminSession } from '@/lib/admin';
import { changePublication, LibraryEditError, publishDraft, restoreVersion, saveDraft } from '@/db/library-admin';
import { editableDefinitionSchema } from '@/lib/admin-validation';

const idSchema=z.uuid();const revisionSchema=z.number().int().nonnegative();
function refreshLibrary(){revalidatePath('/','layout');}
function safeError(error:unknown){return error instanceof LibraryEditError?error.message:error instanceof z.ZodError?error.issues.map(issue=>`${issue.path.join('.')}: ${issue.message}`).join('; '):'Unable to save this change. Try again; the existing published version is preserved.';}
export async function saveDefinition(input:unknown,id:string|undefined,revision:number,publish=false):Promise<{id?:string;revision?:number;success?:string;error?:string}>{
  const session=await adminSession();if(!session)return {error:'Admin access is required.'};
  let saved:{id:string;revision:number}|undefined;
  try{
    if(id)idSchema.parse(id);revisionSchema.parse(revision);z.boolean().parse(publish);
    const definition=editableDefinitionSchema.parse(input);
    saved=await saveDraft(adminDatabase(),session.user.id,definition,id,revision);
    if(publish)await publishDraft(adminDatabase(),session.user.id,saved.id,saved.revision);
    refreshLibrary();return {...saved,revision:publish?saved.revision+1:saved.revision,success:publish?'Published.':'Draft saved.'};
  }catch(error){refreshLibrary();return {...saved,error:safeError(error)};}
}
export async function setPublication(id:string,status:'draft'|'archived'|'published'){
  const session=await adminSession();if(!session)return {error:'Admin access is required.'};
  try{idSchema.parse(id);z.enum(['draft','archived','published']).parse(status);await changePublication(adminDatabase(),session.user.id,id,status);refreshLibrary();return {success:'Visibility updated.'};}catch(error){return {error:safeError(error)};}
}
export async function restoreDefinition(id:string,versionId:string,revision:number){
  const session=await adminSession();if(!session)return {error:'Admin access is required.'};
  try{idSchema.parse(id);idSchema.parse(versionId);revisionSchema.parse(revision);await restoreVersion(adminDatabase(),session.user.id,id,versionId,revision);refreshLibrary();return {success:'Previous content restored as a draft. Review it before publishing.'};}catch(error){return {error:safeError(error)};}
}
