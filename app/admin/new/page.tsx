import { requireAdmin } from '@/lib/admin';
import { emptyDefinition } from '@/lib/admin-validation';
import { AdminEditor } from '@/components/admin-editor';
export const dynamic='force-dynamic';
export const metadata={title:'Add a definition — tess'};
export default async function NewDefinition(){await requireAdmin();return <AdminEditor initial={emptyDefinition} revision={0} history={[]}/>;}
