'use server';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/auth';
import { newPasswordSchema, passwordSetupError } from '@/lib/password-validation';

export async function createPassword(input:{password:string;confirmPassword:string}) {
  const values=newPasswordSchema.safeParse(input);
  if(!values.success)return {error:values.error.issues[0].message};
  const auth=getAuth();
  if(!auth)return {error:'Sign-in is temporarily unavailable.'};
  try {
    const requestHeaders=await headers();
    const session=await auth.api.getSession({headers:requestHeaders});
    const error=passwordSetupError(session);
    if(error)return {error};
    await auth.api.setPassword({body:{newPassword:values.data.password},headers:requestHeaders});
    return {success:true};
  } catch {return {error:'Unable to create a password. Sign in again and try once more.'};}
}
