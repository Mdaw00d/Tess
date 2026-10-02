import assert from 'node:assert/strict';
const origin = process.env.TEST_URL ?? 'http://127.0.0.1:3001';
async function request(path) { return fetch(new URL(path, origin), { signal: AbortSignal.timeout(20000) }); }
for (const route of ['/', '/skills', '/loops', '/skills/source-research', '/loops/attempt-inspect-retry', '/about']) {
  const response = await request(route);
  assert.equal(response.status, 200, route);
  assert.match(await response.text(), /tess/);
}
const searched = await (await request('/api/library?kind=skill&q=research')).json();
assert.ok(searched.items.some(item => item.slug === 'source-research'));
const categorized = await (await request('/api/library?kind=skill&category=Data')).json();
assert.ok(categorized.items.length > 0);
assert.ok(categorized.items.every(item => item.category === 'Data' && item.kind === 'skill'));
assert.equal((await request('/api/library?kind=invalid')).status, 400);
assert.equal((await request('/api/library?kind=skill&q=' + 'x'.repeat(201))).status, 400);
assert.equal((await request('/skills/does-not-exist')).status, 404);
assert.equal((await request('/skills/attempt-inspect-retry')).status, 404);
console.log('Smoke checks passed: pages, search, categories, parameter validation, and missing/wrong-kind routes.');
