'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function GoogleSignIn({enabled}:{enabled:boolean}) {
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  return <><button type="button" className="button google-sign-in" disabled={!enabled||pending} onClick={async()=>{
    setPending(true);setError('');
    try {
      const result=await authClient.signIn.social({provider:'google',callbackURL:'/account',errorCallbackURL:'/sign-in?error=oauth'});
      if(result.error){setError('Unable to start Google sign-in. Please try again.');setPending(false);}
    }catch{setError('Unable to connect. Please try again.');setPending(false);}
  }}><span aria-hidden="true">G</span>{pending?'Connecting…':'Continue with Google'}</button><p role="status" aria-live="polite">{error}</p></>;
}
export function SignOut() {
  const router=useRouter();const [pending,setPending]=useState(false);const [error,setError]=useState('');
  return <><button className="button secondary" disabled={pending} onClick={async()=>{
    setPending(true);setError('');
    try {const result=await authClient.signOut();if(result.error)throw new Error();router.replace('/sign-in');router.refresh();}
    catch{setError('Unable to sign out. Please try again.');setPending(false);}
  }}>{pending?'Signing out…':'Sign out'}</button><p role="status" aria-live="polite">{error}</p></>;
}
