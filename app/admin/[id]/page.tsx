import { notFound } from 'next/navigation';
import { z } from 'zod';
import { adminDatabase, requireAdmin } from '@/lib/admin';
import { readEditor } from '@/db/library-admin';
import { AdminEditor } from '@/components/admin-editor';
export const dynamic='force-dynamic';
export const metadata={title:'Edit definition — tess'};
export default async function EditDefinition({params}:{params:Promise<{id:string}>}){
  await requireAdmin();const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
  const editor=await readEditor(adminDatabase(),id);if(!editor)notFound();
  return <AdminEditor key={`${id}:${editor.revision}:${editor.entry.publicationStatus}:${editor.entry.currentVersion}`} initial={editor.definition} id={id} revision={editor.revision} status={editor.entry.publicationStatus} history={editor.history.map(row=>({id:row.id,version:row.version,createdAt:row.createdAt.toISOString()}))}/>;
}
