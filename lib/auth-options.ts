import type { BetterAuthOptions } from 'better-auth';
import { emailConfig, type AuthMailHooks } from './auth-email';

export function authOptions(env: Record<string,string|undefined>,mail?:AuthMailHooks): BetterAuthOptions | null {
  const {BETTER_AUTH_SECRET:secret, GOOGLE_CLIENT_ID:clientId, GOOGLE_CLIENT_SECRET:clientSecret} = env;
  const baseURL = env.BETTER_AUTH_URL ?? (env.VERCEL_ENV === 'production' ? 'https://tess-ruddy.vercel.app' : env.VERCEL ? undefined : 'http://127.0.0.1:3000');
  if (!secret || secret.length < 32 || !baseURL) return null;
  let url:URL;
  try {url=new URL(baseURL);} catch {return null;}
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) return null;
  const emailEnabled=Boolean(mail&&emailConfig(env));
  return {
    appName:'Tess', secret, baseURL:url.origin, trustedOrigins:[url.origin],
    socialProviders:clientId && clientSecret ? {google:{clientId,clientSecret,prompt:'select_account',accessType:'online'}} : {},
    emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128,requireEmailVerification:emailEnabled,resetPasswordTokenExpiresIn:3600,revokeSessionsOnPasswordReset:true,...(emailEnabled?{sendResetPassword:async({user,url})=>mail!.sendResetPassword({kind:'reset',email:user.email,url})}:{})},
    ...(emailEnabled?{emailVerification:{sendOnSignUp:true,sendOnSignIn:true,autoSignInAfterVerification:false,expiresIn:3600,sendVerificationEmail:async({user,url}: {user:{email:string};url:string})=>mail!.sendVerificationEmail({kind:'verification',email:user.email,url})}}:{}),
    rateLimit:{enabled:true,window:60,max:100,customRules:{'/request-password-reset':{window:60,max:3},'/send-verification-email':{window:60,max:3},'/sign-up/email':{window:60,max:5},'/sign-in/email':{window:60,max:10}}},
    session:{expiresIn:60*60*24*7,updateAge:60*60*24,freshAge:600,cookieCache:{enabled:false}},
    account:{accountLinking:{enabled:false}},
    advanced:{cookiePrefix:'tess'},
    // Driver errors can contain private inputs; return safe route errors instead.
    logger:{disabled:true},
  };
}
