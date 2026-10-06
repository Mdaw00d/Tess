import { getAuth } from '@/lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handle(request:Request) {
  const auth=getAuth();
  if (!auth) {
    if(request.method==='GET' && new URL(request.url).pathname==='/api/auth/get-session')
      return Response.json(null,{headers:{'Cache-Control':'no-store'}});
    return Response.json({error:'Google sign-in is not available yet.'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
  try {return await auth.handler(request);} catch {
    return Response.json({error:'Sign-in is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
export const GET=handle;
export const POST=handle;
