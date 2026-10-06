import 'server-only';
import { betterAuth } from 'better-auth/minimal';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { createDatabase } from '@/db/client';
import * as schema from '@/db/auth-schema';
import { authOptions } from './auth-options';

let instance:ReturnType<typeof betterAuth>|undefined;
export function getAuth() {
  const options=authOptions(process.env);
  const url=process.env.SUPABASE_DATABASE_URL;
  if (!options || !url) return null;
  if(!instance){const config:BetterAuthOptions={...options,database:drizzleAdapter(createDatabase(url).db,{provider:'pg',schema})};instance=betterAuth(config);}
  return instance;
}
