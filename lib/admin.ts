import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from './auth';
import { createDatabase } from '@/db/client';
import { isAdminIdentity } from './admin-validation';

let connection:ReturnType<typeof createDatabase>|undefined;
export async function adminSession(){const auth=getAuth();const session=auth?await auth.api.getSession({headers:await headers()}):null;return isAdminIdentity(session?.user??null,process.env.TESS_ADMIN_EMAILS)?session:null;}
export async function requireAdmin(){const session=await adminSession();if(!session)redirect('/account?notice=admin-access');return session;}
export function adminDatabase(){if(!process.env.SUPABASE_DATABASE_URL)throw new Error('Database is not configured.');connection??=createDatabase(process.env.SUPABASE_DATABASE_URL);return connection.db;}
