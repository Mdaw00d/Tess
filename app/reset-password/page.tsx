import Link from 'next/link';
import { EmailRecovery } from '@/components/email-recovery';
import { emailConfig } from '@/lib/auth-email';
export const dynamic='force-dynamic';
export const metadata={title:'Reset password — tess',referrer:'no-referrer',robots:{index:false,follow:false}};
export default async function ResetPassword({searchParams}:{searchParams:Promise<{token?:string;error?:string}>}){const {token,error}=await searchParams;return <section className="page-shell auth-page"><div className="eyebrow">YOUR TESS ACCOUNT</div><h1>A new password.</h1><div className="auth-panel"><EmailRecovery mode="reset" enabled={Boolean(emailConfig(process.env))} token={token?.length&&token.length<512?token:undefined} error={error}/></div><Link className="back" href="/sign-in">← Back to sign in</Link></section>;}
