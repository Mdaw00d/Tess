import { z } from 'zod';
import { listDefinitions } from '@/lib/repository';
const searchSchema = z.object({kind:z.enum(['skill','loop']),q:z.string().max(200).default(''),category:z.string().max(80).default('All')});
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = searchSchema.safeParse(params);
  if (!result.success) return Response.json({error:'Invalid search parameters'}, {status:400});
  try {
    const {kind,q,category} = result.data;
    return Response.json({items:await listDefinitions(kind,q,category)});
  } catch {
    return Response.json({error:'The library is temporarily unavailable. Please retry.'}, {status:503});
  }
}
