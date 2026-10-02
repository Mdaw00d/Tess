'use client';
import { useState } from 'react';
import { Button } from './ui/button';
export function Copy({text}:{text:string}){const [status,setStatus]=useState('Copy definition');return <Button onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('Copied')}catch{setStatus('Copy unavailable — use the text below')}}}><span aria-live="polite">{status}</span></Button>}
