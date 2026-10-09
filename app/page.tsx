import Link from 'next/link';
import { ArrowRight, ArrowUpRight, FileText, Repeat2, Layers3, ChevronRight } from 'lucide-react';
import { Card } from '@/components/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductPreview } from '@/components/product-preview';
import { listDefinitions } from '@/lib/repository';
export const dynamic='force-dynamic';
export default async function Home(){
 const definitions=await listDefinitions();
 return <><section className="hero"><Link className="announcement" href="/about"><Badge>Introducing tess</Badge><span>A foundation for useful agents</span><ChevronRight size={14}/></Link>
 <h1>Small pieces.<br/><span>Larger possibilities.</span></h1><p>Reusable skills and thoughtful loops for agents that do useful work.<br className="desktop-break"/> Discover the building blocks. Understand them. Make them your own.</p>
 <div className="hero-buttons"><Button asChild><Link href="/skills">Explore skills <ArrowRight size={16}/></Link></Button><Button asChild variant="outline"><Link href="/loops">Discover loops <ArrowUpRight size={16}/></Link></Button></div>
 <div className="hero-note"><span className="live-dot"/> Documented by design. Transparent about testing.</div></section>
 <div className="home-container"><ProductPreview items={definitions}/><section className="principles" aria-label="The TESS approach">{[
 {icon:FileText,title:'One useful capability',description:'Skills define the inputs, outputs, and process for a focused piece of work.'},
 {icon:Repeat2,title:'A pattern for progress',description:'Loops bring structure to refinement, with clear criteria and a stopping point.'},
 {icon:Layers3,title:'Designed for composition',description:'Start with a small piece. Combine it with others to build a complete workflow.'}
 ].map(({icon:Icon,title,description})=><div key={title}><span className="principle-icon"><Icon size={18}/></span><h3>{title}</h3><p>{description}</p></div>)}</section>
 <section className="library-section"><div className="section-heading"><div><div className="eyebrow">START WITH A SKILL</div><h2>Your next building block.</h2><p>A few pieces from the tess library.</p></div><Link className="button secondary" href="/skills">Browse all skills <ArrowRight size={15}/></Link></div><div className="grid">{definitions.filter(x=>x.kind==='skill').slice(0,3).map(item=><Card key={item.slug} item={item}/>)}</div></section>
 <section className="future"><div><Badge>THE LARGER PICTURE</Badge><h2>Good pieces become<br/>thoughtful products.</h2><p>A job-hunting agent is the first planned product powered by tess.<br/>The foundation is reusable. The possibilities keep growing.</p><Link className="button secondary" href="/about">Meet the philosophy <ArrowUpRight size={15}/></Link></div><div className="tessellation" aria-hidden="true">{['✳','↗','↻','◇'].map((mark,i)=><span key={i}>{mark}</span>)}</div></section></div></>;
}
