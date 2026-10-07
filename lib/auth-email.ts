import { createHash } from 'node:crypto';
import { z } from 'zod';
export type AuthEmail={kind:'verification'|'reset';email:string;url:string};
export type AuthMailHooks={sendVerificationEmail:(data:AuthEmail)=>Promise<void>;sendResetPassword:(data:AuthEmail)=>Promise<void>};
export function emailConfig(env:Record<string,string|undefined>){
  const apiKey=env.RESEND_API_KEY?.trim();const from=env.RESEND_FROM_EMAIL?.trim();
  const address=from?.includes('<')?from.match(/^[^<>\r\n]+<([^<>]+)>$/)?.[1].trim():from;
  return apiKey&&from&&address&&z.email().safeParse(address).success?{apiKey,from}:null;
}
const escape=(text:string)=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
export async function deliverAuthEmail(env:Record<string,string|undefined>,data:AuthEmail,transport:typeof fetch=fetch){
  const config=emailConfig(env);if(!config)throw new Error('AUTH_EMAIL_NOT_CONFIGURED');
  const link=new URL(data.url);const base=new URL(env.BETTER_AUTH_URL??'https://tess-ruddy.vercel.app');
  if(link.origin!==base.origin||!link.pathname.startsWith(data.kind==='reset'?'/api/auth/reset-password/':'/api/auth/verify-email')||!z.email().safeParse(data.email).success)throw new Error('INVALID_AUTH_EMAIL');
  const verification=data.kind==='verification';const title=verification?'Verify your TESS email':'Reset your TESS password';
  const detail=verification?'Confirm your email address to finish setting up your TESS account.':'Use this link to choose a new TESS password. Your existing sessions will be signed out.';
  const action=verification?'Verify email':'Reset password';
  const response=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json','Idempotency-Key':createHash('sha256').update(`${data.kind}:${data.email}:${data.url}`).digest('hex')},body:JSON.stringify({from:config.from,to:[data.email],subject:title,text:`${detail}\n\n${data.url}\n\nThis link expires in one hour. If you did not request this, ignore this email.`,html:`<div style="font-family:Arial,sans-serif;max-width:540px;margin:40px auto;color:#20201e"><h1>tess ✳</h1><h2>${title}</h2><p>${detail}</p><p><a href="${escape(data.url)}" style="display:inline-block;padding:14px 20px;background:#20201e;color:white;text-decoration:none;border-radius:4px">${action}</a></p><p>This link expires in one hour.</p><p>If you did not request this, ignore this email.</p></div>`}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('AUTH_EMAIL_DELIVERY_FAILED');
}
