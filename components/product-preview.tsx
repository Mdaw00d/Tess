'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Layers3, FileText, Repeat2, Braces, ArrowRight, CircleDashed } from 'lucide-react';
import type { Definition } from '@/lib/content';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
export function ProductPreview({items}:{items:Definition[]}){
 const [kind,setKind]=useState<'skill'|'loop'>('skill');const [selected,setSelected]=useState<string|undefined>(items.find(x=>x.kind==='skill')?.slug??items[0]?.slug);const [code,setCode]=useState(false);
 const entries=items.filter(x=>x.kind===kind);const item=entries.find(x=>x.slug===selected)??entries[0];
 return <section className="product-preview" aria-label="Explore the TESS library"><div className="preview-topbar"><span><Layers3 size={15}/> The tess library</span><Badge>Library preview</Badge><Link href={`/${kind}s`}>Open library <ArrowUpRight size={14}/></Link></div>
 <div className="preview-layout"><aside className="preview-sidebar"><span className="sidebar-label">BUILDING BLOCKS</span>
 {(['skill','loop'] as const).map(type=><button key={type} aria-pressed={kind===type} onClick={()=>{setKind(type);setSelected(items.find(x=>x.kind===type)?.slug);setCode(false)}}>{type==='skill'?<FileText size={16}/>:<Repeat2 size={16}/>}<span>{type==='skill'?'Skills':'Loops'}</span><span className="sidebar-count">{items.filter(x=>x.kind===type).length}</span></button>)}
 <div className="sidebar-note"><span className="brand-mark">✳</span><strong>Made to fit together.</strong><p>Clear inputs. Useful outputs. Explicit limits.</p><Link href="/about">Our philosophy <ArrowRight size={13}/></Link></div></aside>
 <div className="preview-content"><div className="preview-heading"><div><h2>{kind==='skill'?'Reusable skills':'Thoughtful loops'}</h2><p>{kind==='skill'?'A small capability. A clear place to start.':'Give repeated work a deliberate structure.'}</p></div><Badge>{entries.length} {kind}s</Badge></div>
 <div className="preview-workspace"><div className="preview-items">{entries.map(entry=><button className="preview-item" aria-pressed={item?.slug===entry.slug} key={entry.slug} onClick={()=>setSelected(entry.slug)}><span className="glyph">{kind==='skill'?<FileText size={16}/>:<Repeat2 size={16}/>}</span><span><strong>{entry.name}</strong><small>{entry.category} · v{entry.version}</small></span><ArrowRight size={14}/></button>)}</div>
 {item?<Card className="preview-inspector"><div className="inspector-tabs"><button aria-pressed={!code} onClick={()=>setCode(false)}><Layers3 size={14}/> Overview</button><button aria-pressed={code} onClick={()=>setCode(true)}><Braces size={14}/> Definition</button></div>
 <div className="inspector-body">{code?<pre>{JSON.stringify({name:item.name,kind:item.kind,version:item.version,inputs:item.inputs,outputs:item.outputs},null,2)}</pre>:<><div className="inspector-meta"><Badge>{item.kind}</Badge><span>v{item.version}</span></div><h3>{item.name}</h3><p>{item.description}</p><div className="inspector-io"><div><span>INPUTS</span>{item.inputs.map(input=><p key={input}>{input}</p>)}</div><div><span>OUTPUTS</span>{item.outputs.map(output=><p key={output}>{output}</p>)}</div></div><div className="inspector-status"><CircleDashed size={14}/>{item.evaluationCount?`${item.evaluationCount} evaluation records`:'Not evaluated'}<span>Version-specific evidence</span></div></>}</div>
 <div className="inspector-footer"><span>Documented by design.</span><Link href={`/${item.kind}s/${item.slug}`}>View definition <ArrowUpRight size={14}/></Link></div></Card>:<div className="empty">The library is waiting for its first definition.</div>}
 </div></div></div></section>;
}
