import assert from 'node:assert/strict';
const origin=process.env.TEST_URL??'http://127.0.0.1:3001';
const request=(path,init={})=>fetch(new URL(path,origin),{...init,redirect:'manual',signal:AbortSignal.timeout(20000)});
const login=await request('/sign-in');assert.equal(login.status,200);assert.match(await login.text(),/Continue with Google/);
const account=await request('/account');assert.equal(account.status,307);assert.equal(new URL(account.headers.get('location'),origin).pathname,'/sign-in');
const session=await request('/api/auth/get-session',{headers:{cookie:'tess.session_token=forged'}});
assert.equal(session.status,200);assert.equal(await session.json(),null);assert.match(session.headers.get('cache-control'),/no-store/);
const signIn=await request('/api/auth/sign-in/social',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({provider:'google',callbackURL:'/account'})});
assert.ok([200,503].includes(signIn.status));
const result=await signIn.json();
if(signIn.status===200){assert.equal(new URL(result.url).hostname,'accounts.google.com');}
else if(signIn.status===503){assert.equal(result.error,'Google sign-in is not available yet.');}
console.log('Auth route checks passed: sign-in page, protected account redirect, forged session, no-store response, and provider availability.');
