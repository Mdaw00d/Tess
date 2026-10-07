import Link from 'next/link';
import { EmailRecovery } from '@/components/email-recovery';
import { emailConfig } from '@/lib/auth-email';
export const dynamic='force-dynamic';
export const metadata={title:'Forgot password — tess',referrer:'no-referrer'};
export default function ForgotPassword(){return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>Forgot your password?</h1><div className="auth-panel"><EmailRecovery mode="forgot" enabled={Boolean(emailConfig(process.env))}/></div><Link className="back" href="/sign-in">← Back to sign in</Link></section>;}
