import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export function createDatabase(url: string) {
  // Supabase transaction pooling does not support prepared statements.
  const client = postgres(url, { prepare: false, max: 3, connect_timeout: 10 });
  return { client, db: drizzle(client, { schema }) };
}
