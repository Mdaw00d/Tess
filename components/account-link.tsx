'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useEffect, useRef, useState } from 'react';
import { UserRound, Settings, Shield, ChevronDown } from 'lucide-react';
import { SignOut } from './auth-controls';

export function AccountLink(){
  const {data}=authClient.useSession();
  const [adminUserId,setAdminUserId]=useState<string|null>(null);
  const [open,setOpen]=useState(false);
  const container=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const path=usePathname();
  const userId=data?.user.id;
  useEffect(()=>{setOpen(false)},[path,userId]);
  useEffect(()=>{
    if(!userId){setAdminUserId(null);return;}
    const controller=new AbortController();setAdminUserId(null);
    fetch('/api/admin/access',{cache:'no-store',credentials:'same-origin',signal:controller.signal}).then(async response=>{if(response.ok&&(await response.json()).isAdmin&&!controller.signal.aborted)setAdminUserId(userId);}).catch(()=>{});
    return ()=>controller.abort();
  },[userId,data?.user.emailVerified]);
  useEffect(()=>{
    if(!open)return;
    const dismiss=(event:PointerEvent)=>{if(!container.current?.contains(event.target as Node))setOpen(false)};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus()}};
    document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape)};
  },[open]);
  if(!data)return <Link className="auth-link" href="/sign-in">Sign in</Link>;
  const isAdmin=Boolean(userId&&adminUserId===userId);
  return <div className="profile-menu" ref={container} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false)}}>
    <button ref={trigger} className="profile-trigger" aria-label="Open profile menu" aria-expanded={open} aria-controls="profile-navigation" onClick={()=>setOpen(!open)}><span className="profile-avatar" aria-hidden="true"><UserRound size={17}/></span><ChevronDown size={12} aria-hidden="true"/></button>
    {open&&<div className="profile-dropdown" id="profile-navigation"><div className="profile-menu-identity"><strong>{data.user.name}</strong><span>{data.user.email}</span></div><nav aria-label="Your account">
      <Link href="/account" onClick={()=>setOpen(false)}><UserRound size={16}/>Profile</Link>
      <Link href="/account/settings" onClick={()=>setOpen(false)}><Settings size={16}/>Settings</Link>
      {isAdmin&&<Link href="/admin" onClick={()=>setOpen(false)}><Shield size={16}/>Admin panel</Link>}
    </nav><div className="profile-menu-signout"><SignOut/></div></div>}
  </div>;
}
