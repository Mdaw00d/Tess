import { eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { categories, entries, versions } from './schema';
import { definitions } from '../lib/content';

export async function seedLibrary<T extends PgQueryResultHKT>(tx: Pick<PgDatabase<T>, 'select' | 'insert'>) {
  for (const item of definitions) {
    const categorySlug = item.category.toLowerCase();
    await tx.insert(categories).values({name:item.category,slug:categorySlug}).onConflictDoNothing();
    const [category] = await tx.select().from(categories).where(eq(categories.slug,categorySlug));
    await tx.insert(entries).values({slug:item.slug,name:item.name,kind:item.kind,description:item.description,categoryId:category.id,currentVersion:item.version}).onConflictDoNothing();
    const [entry] = await tx.select().from(entries).where(eq(entries.slug,item.slug));
    // Existing metadata and immutable versions survive reruns.
    await tx.insert(versions).values({entryId:entry.id,version:item.version,definition:item}).onConflictDoNothing();
  }
}


