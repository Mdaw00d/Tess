import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { PasswordSettings } from '@/components/password-settings';
import { emailConfig } from '@/lib/auth-email';
export const metadata={title:'Account settings — tess'};
export const dynamic='force-dynamic';
export default async function Settings(){
  const auth=getAuth();
  const requestHeaders=await headers();
  const session=auth?await auth.api.getSession({headers:requestHeaders}):null;
  if(!session)redirect('/sign-in');
  const accounts=await auth!.api.listUserAccounts({headers:requestHeaders});
  const emailEnabled=Boolean(emailConfig(process.env));
  return <section className="page-shell account-page settings-page"><Link className="back" href="/account">← Your profile</Link><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Settings.</h1><p className="intro">Manage how you sign in to TESS.</p><div className="auth-panel settings-panel"><PasswordSettings hasPassword={accounts.some(account=>account.providerId==='credential')}/>{emailEnabled&&<p><Link className="auth-switch" href="/forgot-password">Forgot your current password? Reset it by email</Link></p>}</div><div className="auth-panel settings-panel"><h2>Email address</h2><p className="settings-email">{session.user.email}</p><p>{session.user.emailVerified?'Your email address is verified.':'Your email address is not yet verified.'}</p>{!session.user.emailVerified&&emailEnabled&&<Link className="auth-switch" href="/verify-email">Verify your email</Link>}</div></section>;
}
