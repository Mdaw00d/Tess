import nextEnv from '@next/env';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { eq, sql } from 'drizzle-orm';
import { createDatabase } from './client';
import { seedLibrary } from './seed-library';
import { entries } from './schema';

nextEnv.loadEnvConfig(process.cwd());
const value = process.env.SUPABASE_DATABASE_URL;
let connection: ReturnType<typeof createDatabase> | undefined;
try {
  if (!value) throw new Error('MISSING_SUPABASE_DATABASE_URL');
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('INVALID_SUPABASE_DATABASE_URL'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('INVALID_SUPABASE_DATABASE_URL');
  if (!url.password || /YOUR.PASSWORD|\[|\]/i.test(url.password)) throw new Error('PASSWORD_PLACEHOLDER');
  console.log('Database connection string format validated.');
  connection = createDatabase(value);
  await migrate(connection.db, { migrationsFolder: './db/migrations' });
  console.log('Database migrations completed.');
  await connection.db.transaction(seedLibrary);
  console.log('Library seed completed; existing content preserved.');
  const sources = await connection.db.select({slug:entries.slug}).from(entries)
    .where(sql`to_tsvector('english', ${entries.name} || ' ' || ${entries.description}) @@ websearch_to_tsquery('english', 'sources')`);
  const extraction = await connection.db.select({slug:entries.slug}).from(entries).where(eq(entries.slug,'document-extraction'));
  if (!sources.some(row => row.slug === 'source-research') || !extraction.length) throw new Error('DATABASE_VERIFICATION_FAILED');
  console.log('Live database read and full-text search verified.');
} catch (error) {
  // Never print errors or connection strings: drivers may attach secret-bearing inputs.
  const failure = error as {message?:string;code?:string;cause?:{code?:string}};
  const known = ['MISSING_SUPABASE_DATABASE_URL','INVALID_SUPABASE_DATABASE_URL','PASSWORD_PLACEHOLDER','DATABASE_VERIFICATION_FAILED'];
  const code = failure.cause?.code ?? failure.code;
  const safeReason = known.includes(failure.message ?? '') ? failure.message
    : code && /^[A-Z0-9_]{1,40}$/.test(code) ? code : 'DATABASE_OPERATION_FAILED';
  console.error('Database activation failed:', safeReason, '(credential details suppressed).');
  process.exitCode = 1;
} finally {
  if (connection) await connection.client.end();
}


