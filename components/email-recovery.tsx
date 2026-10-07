'use client';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { newPasswordSchema } from '@/lib/password-validation';

export function EmailRecovery({mode,enabled,token,error}:{mode:'forgot'|'verify'|'reset';enabled:boolean;token?:string;error?:string}){
  const [pending,setPending]=useState(false);const [message,setMessage]=useState('');const [done,setDone]=useState(false);
  const invalid=mode==='reset'&&(!token||Boolean(error));
  if(invalid)return <><p role="alert">This reset link is missing, invalid, or expired. Request a new link.</p><Link className="button" href="/forgot-password">Request another link</Link></>;
  if(!enabled)return <p role="status">Email delivery is being set up. You can continue signing in with Google or your existing TESS password.</p>;
  return <><p>{mode==='forgot'?'Enter your account email to request a password reset link.':mode==='verify'?'Enter your email to request a verification link. Check your inbox and spam folder.':'Choose a new password. Other sessions will be signed out.'}</p>{error&&mode==='verify'&&<p role="alert">That verification link is invalid or expired. Request a new one below.</p>}
    {!done&&<form onSubmit={async event=>{
      event.preventDefault();setMessage('');const form=new FormData(event.currentTarget);setPending(true);
      try{
        if(mode==='reset'){
          const parsed=newPasswordSchema.safeParse({password:String(form.get('password')??''),confirmPassword:String(form.get('confirmPassword')??'')});if(!parsed.success){setMessage(parsed.error.issues[0].message);return;}
          const result=await authClient.resetPassword({newPassword:parsed.data.password,token:token!});if(result.error){setMessage('This link is invalid or expired. Request a new reset link.');return;}setDone(true);setMessage('Password reset. Sign in with your new TESS password.');
        }else{
          const email=z.email().safeParse(String(form.get('email')??'').trim());if(!email.success){setMessage('Enter a valid email address.');return;}
          const result=mode==='forgot'?await authClient.requestPasswordReset({email:email.data,redirectTo:'/reset-password'}):await authClient.sendVerificationEmail({email:email.data,callbackURL:'/sign-in?notice=verified'});
          if(result.error){setMessage(result.error.status===429?'Too many requests. Wait a minute and try again.':'Unable to request an email right now. Please try again.');return;}
          setMessage(mode==='forgot'?'If an account exists for that email, a reset link will arrive shortly.':'If that email belongs to an unverified account, a verification link will arrive shortly.');
        }
      }catch{setMessage('Unable to connect. Please try again.');}finally{setPending(false);}
    }}><fieldset disabled={pending}>{mode==='reset'?<><label>New password<input type="password" name="password" autoComplete="new-password" required minLength={12} maxLength={128}/></label><p className="password-hint">Use 12–128 characters.</p><label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" required maxLength={128}/></label></>:<label>Email<input type="email" name="email" autoComplete="email" required maxLength={254}/></label>}<button className="button" type="submit">{pending?'Please wait…':mode==='reset'?'Reset password':mode==='verify'?'Send verification link':'Send reset link'}</button></fieldset></form>}
    <p role="status" aria-live="polite">{message}</p>{mode==='reset'&&message&&!done&&<Link className="auth-switch" href="/forgot-password">Request another link</Link>}{done&&<Link className="button" href="/sign-in">Sign in</Link>}
  </>;
}
