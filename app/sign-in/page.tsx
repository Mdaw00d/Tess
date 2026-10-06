import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { GoogleSignIn } from '@/components/auth-controls';
export const metadata={title:'Sign in — tess'};
export const dynamic='force-dynamic';
export default async function SignIn({searchParams}:{searchParams:Promise<{error?:string}>}){
  const auth=getAuth();
  if(auth && await auth.api.getSession({headers:await headers()}))redirect('/account');
  const {error}=await searchParams;
  return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Welcome to tess.</h1><p className="intro">Sign in with your Google account.</p><div className="auth-panel"><GoogleSignIn enabled={Boolean(auth)}/>{!auth&&<p>Google sign-in is being set up. You can explore the library while we finish.</p>}{error&&<p role="alert">Google sign-in did not finish. Try again when you’re ready.</p>}<p>We use your name, email, and profile image to create your account.</p></div><Link className="back" href="/skills">Explore the library →</Link></section>;
}
