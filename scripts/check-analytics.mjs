import assert from 'node:assert/strict';
import { build } from 'esbuild';
globalThis.window = { location: { origin: 'https://tess.example', pathname: '/reset-password' } };
const events = [];
let config;
const calls = [];
globalThis.analyticsMock = {
  init(token, options) { config = options; calls.push(['init', token]); },
  capture(event, properties) { events.push(config.before_send({event,properties:{...properties,$current_url:'https://tess.example/reset-password?token=secret',$referrer:'https://accounts.google.com/?code=secret',$set:{$initial_current_url:'https://tess.example/?secret=yes'}}})); },
  identify(id) { calls.push(['identify', id]); },
  reset() { calls.push(['reset']); }
};
async function load(token) {
  const result = await build({entryPoints:['lib/analytics.ts'],bundle:true,write:false,platform:'browser',format:'esm',define:{
    'process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN':JSON.stringify(token),
    'process.env.NEXT_PUBLIC_POSTHOG_HOST':JSON.stringify('https://us.i.posthog.com')
  },plugins:[{name:'posthog-test',setup(build){
    build.onResolve({filter:/^posthog-js$/},()=>({path:'posthog',namespace:'test'}));
    build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export default globalThis.analyticsMock;',loader:'js'}));
  }}]});
  return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const disabled = await load('');
disabled.initializeAnalytics();disabled.trackPage('/');
assert.equal(calls.length,0);assert.equal(events.length,0);
const analytics = await load('phc_synthetic');
analytics.initializeAnalytics();analytics.initializeAnalytics();
assert.equal(calls.filter(c=>c[0]==='init').length,1);
assert.equal(config.autocapture,false);assert.equal(config.disable_session_recording,true);
assert.equal(config.capture_pageview,false);assert.equal(config.respect_dnt,true);
analytics.trackPage('/reset-password?token=secret');
analytics.track('library_searched',{kind:'skill',query_length:8,result_count:2,email:'private@example.com',query:'private search',password:'secret'});
const serialized=JSON.stringify(events);
assert.ok(!serialized.includes('secret'));assert.ok(!serialized.includes('private'));
assert.equal(events[0].properties.$current_url,'https://tess.example/reset-password');
assert.equal(events[1].properties.query_length,8);
window.location.pathname='/admin/private-draft-id';
analytics.trackPage('/admin/private-draft-id');
assert.equal(events.at(-1).properties.$pathname,'/admin');
assert.equal(events.at(-1).properties.route,'/admin');
analytics.identifyAnalytics('user-a');analytics.identifyAnalytics('user-a');analytics.identifyAnalytics('user-b');analytics.identifyAnalytics(null);
assert.deepEqual(calls.slice(1),[['identify','user-a'],['reset'],['identify','user-b'],['reset']]);
analytics.resetAnalytics();
console.log('Analytics checks passed: disabled configuration, SDK options, URL/token and nested identity-property scrubbing, event allowlist, private routes, and identity reset. No live events sent.');

