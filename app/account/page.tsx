import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRound, Settings, ArrowUpRight } from 'lucide-react';
import { getAuth } from '@/lib/auth';
import { isAdminIdentity } from '@/lib/admin-validation';
export const metadata={title:'Your profile — tess'};
export const dynamic='force-dynamic';
export default async function Account({searchParams}:{searchParams:Promise<{notice?:string}>}){
  const auth=getAuth();
  const session=auth?await auth.api.getSession({headers:await headers()}):null;
  if(!session)redirect('/sign-in');
  const {notice}=await searchParams;
  const isAdmin=isAdminIdentity(session.user,process.env.TESS_ADMIN_EMAILS);
  return <section className="page-shell account-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Your profile.</h1><p className="intro">A little about you. A place for your account.</p>
    {notice==='admin-access'&&!isAdmin&&<p className="notice" role="alert">This account does not have admin access. Sign in with the account assigned by the site owner.</p>}
    <div className="profile-card"><div className="profile-heading"><span className="profile-avatar profile-avatar-large" aria-hidden="true"><UserRound size={28}/></span><div><h2>{session.user.name}</h2><p>{session.user.email}</p></div></div><dl className="profile-details"><div><dt>Email status</dt><dd>{session.user.emailVerified?'Verified':'Not yet verified'}</dd></div><div><dt>Account</dt><dd>{isAdmin?'Administrator':'Member'}</dd></div></dl></div>
    <div className="account-shortcuts"><Link href="/account/settings"><Settings size={20}/><div><h2>Account settings</h2><p>Manage your password and sign-in options.</p></div><ArrowUpRight size={17}/></Link><Link href={isAdmin?'/admin':'/skills'}><ArrowUpRight size={20}/><div><h2>{isAdmin?'Admin panel':'Explore the library'}</h2><p>{isAdmin?'Manage your skills and loops.':'Find skills and loops for your next project.'}</p></div><ArrowUpRight size={17}/></Link></div>
  </section>;
}
