import Link from 'next/link';
import { EmailRecovery } from '@/components/email-recovery';
import { emailConfig } from '@/lib/auth-email';
export const dynamic='force-dynamic';
export const metadata={title:'Verify email — tess',referrer:'no-referrer'};
export default async function VerifyEmail({searchParams}:{searchParams:Promise<{error?:string}>}){const {error}=await searchParams;return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Check your inbox.</h1><div className="auth-panel"><EmailRecovery mode="verify" enabled={Boolean(emailConfig(process.env))} error={error}/></div><Link className="back" href="/sign-in">← Back to sign in</Link></section>;}
