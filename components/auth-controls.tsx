'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { track, resetAnalytics } from '@/lib/analytics';

export function GoogleSignIn({enabled}:{enabled:boolean}) {
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const [googleUrl,setGoogleUrl]=useState('');
  return <><button type="button" className="button google-sign-in" disabled={!enabled||pending} onClick={async()=>{
    setPending(true);setError('');setGoogleUrl('');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),15000);
    try {
      track('auth_started',{method:'google',mode:'sign-in'});
      const result=await authClient.signIn.social(
        {provider:'google',callbackURL:'/',errorCallbackURL:'/sign-in?error=oauth',disableRedirect:true},
        {signal:controller.signal,timeout:15000},
      );
      if(result.error||!result.data?.url)throw new Error('SIGN_IN_FAILED');
      const destination=new URL(result.data.url);
      if(destination.protocol!=='https:'||destination.hostname!=='accounts.google.com')throw new Error('INVALID_GOOGLE_URL');
      setGoogleUrl(destination.href);
      window.location.assign(destination.href);
    }catch{
      setError(controller.signal.aborted?'Google sign-in timed out. Please try again.':'Unable to start Google sign-in. Please try again.');
    }finally{clearTimeout(timer);setPending(false);}
  }}><span aria-hidden="true">G</span>{pending?'Connecting…':'Continue with Google'}</button>
  {googleUrl&&<a className="auth-switch" href={googleUrl}>Open Google sign-in</a>}
  <p role="status" aria-live="polite">{error}</p></>;
}
export function SignOut() {
  const router=useRouter();const [pending,setPending]=useState(false);const [error,setError]=useState('');
  return <><button className="button secondary" disabled={pending} onClick={async()=>{
    setPending(true);setError('');
    try {const result=await authClient.signOut();if(result.error)throw new Error();track('signed_out');resetAnalytics();router.replace('/sign-in');router.refresh();}
    catch{setError('Unable to sign out. Please try again.');setPending(false);}
  }}>{pending?'Signing out…':'Sign out'}</button><p role="status" aria-live="polite">{error}</p></>;
}
