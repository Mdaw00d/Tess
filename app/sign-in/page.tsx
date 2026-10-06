import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { EmailAuth } from '@/components/email-auth';
export const metadata={title:'Sign in — tess'};
export const dynamic='force-dynamic';
export default async function SignIn({searchParams}:{searchParams:Promise<{error?:string}>}){
  const auth=getAuth();
  if(auth && await auth.api.getSession({headers:await headers()}))redirect('/account');
  const {error}=await searchParams;
  const googleEnabled=Boolean(auth && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Welcome to tess.</h1><p className="intro">Sign in with email and password, or continue with Google.</p><div className="auth-panel"><EmailAuth enabled={Boolean(auth)} googleEnabled={googleEnabled}/>{!auth&&<p>Sign-in is being set up. You can explore the library while we finish.</p>}{error&&<p role="alert">Google sign-in did not finish. Try again when you’re ready.</p>}<p>We use your name and email to create your account. Google sign-in also provides your profile image.</p></div><Link className="back" href="/skills">Explore the library →</Link></section>;
}
