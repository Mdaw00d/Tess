import { desc, eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { entries, evaluations, versions } from './schema';

// Read across versions, while preserving the exact version each run tested.
export async function readEvaluations<T extends PgQueryResultHKT>(db: Pick<PgDatabase<T>, 'select'>, slug: string) {
  return db.select({
    id: evaluations.id, version: versions.version, method: evaluations.method,
    results: evaluations.results, limitations: evaluations.limitations,
    evaluatedAt: evaluations.evaluatedAt,
  }).from(evaluations)
    .innerJoin(versions, eq(evaluations.versionId, versions.id))
    .innerJoin(entries, eq(versions.entryId, entries.id))
    .where(eq(entries.slug, slug)).orderBy(desc(evaluations.evaluatedAt));
}

