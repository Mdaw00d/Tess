'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun, Menu, X, ArrowUpRight } from 'lucide-react';
import { AccountLink } from './account-link';
import { Logo } from './logo';
export function Header(){
 const path=usePathname();const [dark,setDark]=useState(false);const [open,setOpen]=useState(false);
 useEffect(()=>{try{const saved=localStorage.getItem('tess-theme');const next=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;setDark(next);document.documentElement.classList.toggle('dark',next)}catch{}},[]);
 useEffect(()=>{setOpen(false)},[path]);
 return <header className="site-header"><div className="header-inner">
 <Link className="wordmark" href="/" aria-label="TESS home"><Logo/></Link>
 <nav id="main-navigation" className="header-main-nav" data-open={open} aria-label="Main navigation" onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}>
 {[['/','Overview'],['/skills','Skills'],['/loops','Loops'],['/about','Philosophy']].map(([href,label])=><Link aria-current={(href==='/'?path===href:path.startsWith(href))?'page':undefined} key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
 </nav><div className="header-actions">
 <button className="icon-button theme" aria-label={dark?'Switch to light theme':'Switch to dark theme'} onClick={()=>{const next=!dark;document.documentElement.classList.toggle('dark',next);try{localStorage.setItem('tess-theme',next?'dark':'light')}catch{}setDark(next)}}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
 <AccountLink/><Link className="small-button" href="/skills">Explore library <ArrowUpRight size={14}/></Link>
 <button className="icon-button mobile-menu" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button>
 </div></div></header>;
}
