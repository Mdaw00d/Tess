import { z } from 'zod';
export const passwordSchema=z.string().min(12,'Use at least 12 characters.').max(128,'Use no more than 128 characters.');
export const newPasswordSchema=z.object({password:passwordSchema,confirmPassword:z.string()}).refine(value=>value.password===value.confirmPassword,{message:'Passwords must match.',path:['confirmPassword']});

export function passwordSetupError(session:{user:{emailVerified:boolean};session:{createdAt:Date|string}}|null,now=Date.now()){
  if(!session || !session.user.emailVerified)return 'Sign in with Google before creating a TESS password.';
  const createdAt=new Date(session.session.createdAt).getTime();
  if(!Number.isFinite(createdAt) || now-createdAt>=600000)return 'Sign out and sign in again before creating a password.';
  return null;
}
