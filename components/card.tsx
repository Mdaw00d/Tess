import Link from 'next/link';
import { ArrowUpRight, FileText, Repeat2 } from 'lucide-react';
import { Definition } from '@/lib/content';
export function Card({item}:{item:Definition}){return <Link href={`/${item.kind==='skill'?'skills':'loops'}/${item.slug}`} className="card"><div className="card-top"><span className="glyph">{item.kind==='skill'?<FileText size={20}/>:<Repeat2 size={20}/>}</span><ArrowUpRight size={18}/></div><div className="card-category">{item.category} / {item.kind}</div><h3>{item.name}</h3><p>{item.description}</p><div className="card-bottom"><span><i/> Not evaluated</span><span>v{item.version}</span></div></Link>}
