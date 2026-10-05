import nextEnv from '@next/env';
import { createDatabase } from './client';
import { seedLibrary } from './seed-library';
import { definitions } from '../lib/content';

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.SUPABASE_DATABASE_URL) throw new Error('Set SUPABASE_DATABASE_URL in .env.local before seeding.');
const {client,db} = createDatabase(process.env.SUPABASE_DATABASE_URL);
try {
  await db.transaction(seedLibrary);
  console.log(`Seed complete: ${definitions.length} example definitions. Existing entries were preserved.`);
} finally { await client.end(); }


