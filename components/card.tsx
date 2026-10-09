import Link from 'next/link';
import { ArrowUpRight, FileText, Repeat2 } from 'lucide-react';
import type { Definition } from '@/lib/content';
import { Badge } from './ui/badge';
export function Card({item}:{item:Definition}){return <Link href={`/${item.kind}s/${item.slug}`} className="card">
  <div className="card-top"><span className="glyph">{item.kind==='skill'?<FileText size={18}/>:<Repeat2 size={18}/>}</span><Badge>{item.category}</Badge></div>
  <h3>{item.name}<ArrowUpRight size={16}/></h3><p>{item.description}</p>
  <div className="card-bottom"><span><i/> {item.evaluationCount ? `${item.evaluationCount} evaluation records` : 'Not evaluated'}</span><span>v{item.version}</span></div>
</Link>;}
