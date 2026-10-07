import { adminSession } from '@/lib/admin';
export const dynamic='force-dynamic';
export async function GET(){
  const headers={'Cache-Control':'private, no-store',Vary:'Cookie'};
  try{return Response.json({isAdmin:Boolean(await adminSession())},{headers});}
  catch{return Response.json({isAdmin:false},{status:503,headers});}
}
