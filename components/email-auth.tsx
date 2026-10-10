'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { authClient } from '@/lib/auth-client';
import { newPasswordSchema } from '@/lib/password-validation';
import { GoogleSignIn } from '@/components/auth-controls';
import Link from 'next/link';
import { track } from '@/lib/analytics';

export function EmailAuth({enabled,googleEnabled,emailEnabled=false}:{enabled:boolean;googleEnabled:boolean;emailEnabled?:boolean}) {
  const router=useRouter();
  const [mode,setMode]=useState<'sign-in'|'sign-up'>('sign-in');
  const [pending,setPending]=useState(false);const [error,setError]=useState('');const [showPassword,setShowPassword]=useState(false);
  return <div className="email-auth"><h2>{mode==='sign-in'?'Sign in with email':'Create your account'}</h2>
    <form key={mode} onSubmit={async event=>{
      event.preventDefault();setError('');
      const form=new FormData(event.currentTarget);
      const email=z.email().safeParse(String(form.get('email')??'').trim());
      const password=String(form.get('password')??'');
      if(!email.success){setError('Enter a valid email address.');return;}
      if(mode==='sign-up'){
        const valid=newPasswordSchema.safeParse({password,confirmPassword:String(form.get('confirmPassword')??'')});
        if(!valid.success){setError(valid.error.issues[0].message);return;}
      }else if(!password || password.length>128){setError('Enter your TESS password.');return;}
      setPending(true);
      try {
        track('auth_started',{method:'email',mode});
        const result=mode==='sign-in'?await authClient.signIn.email({email:email.data,password,callbackURL:'/'}):await authClient.signUp.email({name:String(form.get('name')??'').trim(),email:email.data,password,callbackURL:emailEnabled?'/sign-in?notice=verified':'/'});
        if(result.error?.code==='EMAIL_NOT_VERIFIED'){router.push('/verify-email');setPending(false);return;}
        if(result.error){setError(mode==='sign-in'?'Email or password is incorrect. If you joined with Google, sign in with Google and create a TESS password in Settings.':'Unable to create this account. If you already joined, sign in with email or Google.');setPending(false);return;}
        if(mode==='sign-up')track('account_created',{method:'email',verification_required:emailEnabled});
        router.replace(mode==='sign-up'&&emailEnabled?'/verify-email':'/');router.refresh();
      }catch{setError('Unable to connect. Please try again.');setPending(false);}
    }}><fieldset disabled={!enabled||pending}>
      {mode==='sign-up'&&<label>Name<input name="name" autoComplete="name" maxLength={100} required/></label>}
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>
      <label>Password<div className="password-input"><input name="password" type={showPassword?'text':'password'} autoComplete={mode==='sign-in'?'current-password':'new-password'} minLength={mode==='sign-up'?12:undefined} maxLength={128} required/><button type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?'Hide':'Show'}</button></div></label>
      {mode==='sign-up'&&<><p className="password-hint">Use 12–128 characters.</p><label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" maxLength={128} required/></label></>}
      <button className="button" type="submit">{pending?'Please wait…':mode==='sign-in'?'Sign in with email':'Create account'}</button>
      <GoogleSignIn enabled={googleEnabled}/>
    </fieldset></form><p role="status" aria-live="polite">{error}</p>
    <button className="auth-switch" disabled={pending} onClick={()=>{setMode(mode==='sign-in'?'sign-up':'sign-in');setError('');setShowPassword(false);}}>{mode==='sign-in'?'New to tess? Create an account':'Already have an account? Sign in'}</button>
    {mode==='sign-in'&&emailEnabled&&<p><Link className="auth-switch" href="/forgot-password">Forgot password?</Link> · <Link className="auth-switch" href="/verify-email">Verify email</Link></p>}
  </div>;
}
