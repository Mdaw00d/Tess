import { notFound } from 'next/navigation';
import { getDefinition } from '@/lib/repository';
import { Detail } from '@/components/detail';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const item=await getDefinition((await params).slug);return {title:item?`${item.name} — tess`:'Not found — tess'}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const item=await getDefinition((await params).slug);if(!item||item.kind!=='skill')notFound();return <Detail item={item}/>}

