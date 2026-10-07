import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { adminDatabase, requireAdmin } from '@/lib/admin';
import { adminActivity, drafts, entries } from '@/db/schema';
export const dynamic='force-dynamic';
export const metadata={title:'Admin — tess'};
export default async function Admin({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
  await requireAdmin();const db=adminDatabase();const {q='',status='all'}=await searchParams;
  const rows=await db.select({entry:entries,draft: drafts.definition}).from(entries).leftJoin(drafts,eq(drafts.entryId,entries.id)).orderBy(desc(entries.updatedAt));
  const activity=await db.select({action:adminActivity.action,createdAt:adminActivity.createdAt,name:entries.name}).from(adminActivity).innerJoin(entries,eq(entries.id,adminActivity.entryId)).orderBy(desc(adminActivity.createdAt)).limit(12);
  const visible=rows.filter(row=>(status==='all'||row.entry.publicationStatus===status||(status==='editing'&&row.draft))&&`${row.entry.name} ${row.entry.slug}`.toLowerCase().includes(q.toLowerCase()));
  return <section className="page-shell admin-page"><div className="eyebrow">TESS / ADMIN</div><div className="admin-title"><div><h1>Your library.</h1><p className="intro">Upload, edit, and publish the pieces that fit together.</p></div><Link className="button" href="/admin/new">Add skill or loop ↗</Link></div>
    <div className="admin-stats">{[['Published',rows.filter(r=>r.entry.publicationStatus==='published').length],['With drafts',rows.filter(r=>r.draft).length],['Archived',rows.filter(r=>r.entry.publicationStatus==='archived').length]].map(([label,count])=><div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
    <form className="admin-filters"><label>Search<input name="q" defaultValue={q} placeholder="Name or slug"/></label><label>Visibility<select name="status" defaultValue={status}><option value="all">All items</option><option value="published">Published</option><option value="draft">Unpublished</option><option value="editing">With drafts</option><option value="archived">Archived</option></select></label><button className="button secondary">Filter</button></form>
    <div className="admin-list">{visible.map(({entry,draft})=><Link className="admin-row" key={entry.id} href={`/admin/${entry.id}`}><div><strong>{entry.name}</strong><small>{entry.kind} · /{entry.slug}</small></div><span>{entry.publicationStatus}{draft?' · Draft saved':''}</span><span>v{entry.currentVersion} →</span></Link>)}{!visible.length&&<p className="empty">No items here yet. Add a skill or loop to get started.</p>}</div>
    <section className="admin-activity"><h2>Recent activity</h2>{activity.length?activity.map((item,index)=><p key={index}>{item.action} · {item.name} <time dateTime={item.createdAt.toISOString()}>{item.createdAt.toISOString().slice(0,16).replace('T',' ')} UTC</time></p>):<p>Your edits and publishing activity will appear here.</p>}</section>
  </section>;
}
