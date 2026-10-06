import type { BetterAuthOptions } from 'better-auth';

export function authOptions(env: Record<string,string|undefined>): BetterAuthOptions | null {
  const {BETTER_AUTH_SECRET:secret, GOOGLE_CLIENT_ID:clientId, GOOGLE_CLIENT_SECRET:clientSecret} = env;
  const baseURL = env.BETTER_AUTH_URL ?? (env.VERCEL_ENV === 'production' ? 'https://tess-ruddy.vercel.app' : env.VERCEL ? undefined : 'http://127.0.0.1:3000');
  if (!secret || secret.length < 32 || !clientId || !clientSecret || !baseURL) return null;
  let url:URL;
  try {url=new URL(baseURL);} catch {return null;}
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) return null;
  return {
    appName:'Tess', secret, baseURL:url.origin, trustedOrigins:[url.origin],
    socialProviders:{google:{clientId,clientSecret,prompt:'select_account',accessType:'online'}},
    session:{expiresIn:60*60*24*7,updateAge:60*60*24,cookieCache:{enabled:false}},
    account:{accountLinking:{enabled:false}},
    advanced:{cookiePrefix:'tess'},
    // Driver errors can contain private inputs; return safe route errors instead.
    logger:{disabled:true},
  };
}
