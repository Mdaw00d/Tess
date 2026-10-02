'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Moon, Sun, ArrowUpRight } from 'lucide-react';
export function Header(){const path=usePathname(); const [dark,setDark]=useState(false);useEffect(()=>{const d=localStorage.getItem('tess-theme')==='dark';setDark(d);document.documentElement.classList.toggle('dark',d)},[]);return <header><Link className="wordmark" href="/">tess<span>✳</span></Link><nav aria-label="Main navigation">{[['/skills','Skills'],['/loops','Loops'],['/about','Philosophy']].map(([href,label])=><Link aria-current={path.startsWith(href)?'page':undefined} key={href} href={href}>{label}</Link>)}</nav><div className="header-actions"><button className="theme" aria-label="Toggle color theme" onClick={()=>{document.documentElement.classList.toggle('dark',!dark);localStorage.setItem('tess-theme',dark?'light':'dark');setDark(!dark)}}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button><Link className="small-button" href="/skills">Explore the library <ArrowUpRight size={14}/></Link></div></header>}
