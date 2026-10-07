import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { SignOut } from '@/components/auth-controls';
import { PasswordSettings } from '@/components/password-settings';
import { isAdminIdentity } from '@/lib/admin-validation';
import { emailConfig } from '@/lib/auth-email';
export const metadata={title:'Your account — tess'};
export const dynamic='force-dynamic';
export default async function Account({searchParams}:{searchParams:Promise<{notice?:string}>}){
  const auth=getAuth();
  const session=auth?await auth.api.getSession({headers:await headers()}):null;
  if(!session)redirect('/sign-in');
  const accounts=await auth!.api.listUserAccounts({headers:await headers()});
  const {notice}=await searchParams;
  const isAdmin=isAdminIdentity(session.user,process.env.TESS_ADMIN_EMAILS);
  return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Hello, {session.user.name}.</h1><p className="intro">You’re signed in to tess.</p>{notice==='admin-access'&&!isAdmin&&<p className="notice" role="alert">This account does not have admin access. Sign in with Google using the account assigned by the site owner. Your current email is shown below.</p>}{isAdmin&&<Link className="button" href="/admin">Open admin panel ↗</Link>}<div className="auth-panel"><dl><dt>Name</dt><dd>{session.user.name}</dd><dt>Email</dt><dd className="account-email">{session.user.email}</dd></dl><p>{session.user.emailVerified?'Email verified.':'Email not yet verified.'}</p>{!session.user.emailVerified&&emailConfig(process.env)&&<p><Link className="auth-switch" href="/verify-email">Verify your email</Link></p>}{emailConfig(process.env)&&<p><Link className="auth-switch" href="/forgot-password">Reset your password by email</Link></p>}<SignOut/><PasswordSettings hasPassword={accounts.some(account=>account.providerId==='credential')}/></div><Link className="back" href={isAdmin?'/admin':'/skills'}>{isAdmin?'Manage skills and loops →':'Explore the library →'}</Link></section>;
}
