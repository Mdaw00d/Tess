'use client';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
export function AccountLink(){
  const {data}=authClient.useSession();const [adminUserId,setAdminUserId]=useState<string|null>(null);
  const userId=data?.user.id;
  useEffect(()=>{
    if(!userId){setAdminUserId(null);return;}
    const controller=new AbortController();setAdminUserId(null);
    fetch('/api/admin/access',{cache:'no-store',credentials:'same-origin',signal:controller.signal}).then(async response=>{if(response.ok&&(await response.json()).isAdmin&&!controller.signal.aborted)setAdminUserId(userId);}).catch(()=>{});
    return ()=>controller.abort();
  },[userId,data?.user.emailVerified]);
  const isAdmin=Boolean(userId&&adminUserId===userId);
  return <Link className="auth-link" href={isAdmin?'/admin':data?'/account':'/sign-in'}>{isAdmin?'Admin':data?'Account':'Sign in'}</Link>;
}
