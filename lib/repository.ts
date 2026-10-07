import 'server-only';
import { cache } from 'react';
import { and, eq, sql } from 'drizzle-orm';
import { createDatabase } from '@/db/client';
import { entries, versions } from '@/db/schema';
import { definitions, definitionSchema, type Definition } from './content';
import { readEvaluations } from '@/db/read-evaluations';
import { evaluations } from '@/db/schema';

const recordedCount = sql<number>`(select count(*)::int from ${evaluations} where ${evaluations.versionId} = ${versions.id})`;

let connection: ReturnType<typeof createDatabase> | undefined;
function database() {
  const url = process.env.SUPABASE_DATABASE_URL;
  if (!url) return null;
  connection ??= createDatabase(url);
  return connection.db;
}
export function databaseEnabled() { return Boolean(process.env.SUPABASE_DATABASE_URL); }

export async function listDefinitions(kind?: Definition['kind'], query = '', category = 'All') {
  const db = database();
  if (!db) return definitions.filter(item =>
    (!kind || item.kind === kind) &&
    (category === 'All' || item.category === category) &&
    `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase()));

  const conditions = [eq(versions.version, entries.currentVersion),eq(entries.publicationStatus,'published')];
  if (kind) conditions.push(eq(entries.kind, kind));
  if (category !== 'All') conditions.push(sql`${versions.definition}->>'category' = ${category}`);
  if (query.trim()) conditions.push(sql`to_tsvector('english', ${entries.name} || ' ' || ${entries.description}) @@ websearch_to_tsquery('english', ${query})`);
  const rows = await db.select({ definition: versions.definition, evaluationCount: recordedCount })
    .from(entries).innerJoin(versions, eq(versions.entryId, entries.id))
    .where(and(...conditions)).orderBy(entries.name);
  // Fail visibly on bad database content rather than silently substituting examples.
  return rows.map(row => ({ ...definitionSchema.parse(row.definition), evaluationCount: row.evaluationCount }));
}

export const getDefinition = cache(async (slug: string) => {
  const db = database();
  if (!db) return definitions.find(item => item.slug === slug);
  const rows = await db.select({ definition: versions.definition, evaluationCount: recordedCount }).from(entries)
    .innerJoin(versions, eq(versions.entryId, entries.id))
    .where(and(eq(entries.slug, slug),eq(entries.publicationStatus,'published'), eq(versions.version, entries.currentVersion))).limit(1);
  return rows[0] ? { ...definitionSchema.parse(rows[0].definition), evaluationCount: rows[0].evaluationCount } : undefined;
});

export const getEvaluations = cache(async (slug: string) => {
  const db = database();
  return db ? readEvaluations(db, slug) : [];
});

