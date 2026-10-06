import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { SignOut } from '@/components/auth-controls';
import { PasswordSettings } from '@/components/password-settings';
export const metadata={title:'Your account — tess'};
export const dynamic='force-dynamic';
export default async function Account(){
  const auth=getAuth();
  const session=auth?await auth.api.getSession({headers:await headers()}):null;
  if(!session)redirect('/sign-in');
  const accounts=await auth!.api.listUserAccounts({headers:await headers()});
  return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Hello, {session.user.name}.</h1><p className="intro">You’re signed in to tess.</p><div className="auth-panel"><dl><dt>Name</dt><dd>{session.user.name}</dd><dt>Email</dt><dd className="account-email">{session.user.email}</dd></dl><SignOut/><PasswordSettings hasPassword={accounts.some(account=>account.providerId==='credential')}/></div><Link className="back" href="/skills">Explore the library →</Link></section>;
}
