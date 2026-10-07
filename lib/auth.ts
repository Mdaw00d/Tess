import 'server-only';
import { betterAuth } from 'better-auth/minimal';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { createDatabase } from '@/db/client';
import * as schema from '@/db/auth-schema';
import { authOptions } from './auth-options';
import { after } from 'next/server';
import { deliverAuthEmail, type AuthEmail } from './auth-email';

let instance:ReturnType<typeof betterAuth>|undefined;
export function getAuth() {
  const scheduleEmail=async(data:AuthEmail)=>{after(async()=>{try{await deliverAuthEmail(process.env,data);}catch{console.error('TESS auth email delivery failed. Check Resend configuration and delivery logs.');}});};
  const options=authOptions(process.env,{sendVerificationEmail:scheduleEmail,sendResetPassword:scheduleEmail});
  const url=process.env.SUPABASE_DATABASE_URL;
  if (!options || !url) return null;
  if(!instance){const config:BetterAuthOptions={...options,database:drizzleAdapter(createDatabase(url).db,{provider:'pg',schema})};instance=betterAuth(config);}
  return instance;
}
