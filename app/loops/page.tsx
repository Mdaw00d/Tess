import { Library } from '@/components/library';
import { listDefinitions, databaseEnabled } from '@/lib/repository';
export const dynamic='force-dynamic';
export default async function Page(){return <Library kind='loop' initialItems={await listDefinitions('loop')} databaseMode={databaseEnabled()}/>}

