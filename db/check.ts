import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq, sql } from 'drizzle-orm';
import * as schema from './schema';
import { seedLibrary } from './seed-library';
import { entries, versions } from './schema';

const client = await PGlite.create();
const db = drizzle(client,{schema});
try {
  await migrate(db,{migrationsFolder:'./db/migrations'});
  await migrate(db,{migrationsFolder:'./db/migrations'});
  await db.transaction(seedLibrary);
  await db.transaction(seedLibrary);
  assert.equal((await db.select().from(entries)).length,7,'seed reruns must not duplicate entries');
  assert.equal((await db.select().from(versions)).length,7,'seed reruns must not duplicate versions');
  await db.transaction(async tx => {
    const [entry] = await tx.select().from(entries).where(eq(entries.slug,'document-extraction'));
    const [version] = await tx.select().from(versions).where(eq(versions.entryId,entry.id));
    await tx.update(entries).set({name:'Curated name',currentVersion:'9.9.9'}).where(eq(entries.id,entry.id));
    const curated = {...(version.definition as object),name:'Curated version'};
    await tx.update(versions).set({definition:curated}).where(eq(versions.id,version.id));
    await seedLibrary(tx);
    const [preserved] = await tx.select().from(entries).where(eq(entries.id,entry.id));
    const [preservedVersion] = await tx.select().from(versions).where(eq(versions.id,version.id));
    assert.equal(preserved.name,'Curated name');
    assert.equal(preserved.currentVersion,'9.9.9');
    assert.deepEqual(preservedVersion.definition,curated);
    await tx.update(entries).set({name:entry.name,currentVersion:entry.currentVersion}).where(eq(entries.id,entry.id));
    await tx.update(versions).set({definition:version.definition}).where(eq(versions.id,version.id));
  });
  const rows = await db.select({slug:entries.slug}).from(entries).where(sql`to_tsvector('english', ${entries.name} || ' ' || ${entries.description}) @@ websearch_to_tsquery('english', 'sources')`);
  assert.ok(rows.some(row=>row.slug==='source-research'),'English stemming must match source research');
  const {rows:policies} = await client.query<{relname:string;relrowsecurity:boolean}>("select relname,relrowsecurity from pg_class where relname in ('entries','versions','evaluations','categories') and relnamespace='public'::regnamespace");
  assert.equal(policies.length,4);
  assert.ok(policies.every(row=>row.relrowsecurity),'all library tables must enable RLS');
  const {rows:indexes} = await client.query("select indexname from pg_indexes where tablename='entries' and indexname='entries_search_idx'");
  assert.equal(indexes.length,1,'FTS index is present');
  console.log('PostgreSQL checks passed: migration, idempotent seed, curated-content preservation, FTS stemming, index, and RLS.');
} finally {await client.close();}


