'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { track } from '@/lib/analytics';
export function Copy({text,kind,slug,version}:{text:string;kind:'skill'|'loop';slug:string;version:string}){const [status,setStatus]=useState('Copy definition');return <Button onClick={async()=>{try{await navigator.clipboard.writeText(text);track('definition_copied',{kind,slug,version});setStatus('Copied')}catch{setStatus('Copy unavailable — use the text below')}}}><span aria-live="polite">{status}</span></Button>}
