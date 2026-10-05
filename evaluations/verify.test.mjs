import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evaluateFile } from './grade.mjs';
import { verifyEvidence } from './verify.mjs';

test('imports unchanged failed evidence and rejects altered results, provenance, versions, and limitations', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'tess-evidence-test-'));
  try {
    const fixturesRaw = await readFile(new URL('./document-extraction.fixtures.json', import.meta.url), 'utf8');
    const captureRaw = JSON.stringify({provider:'synthetic-test',model:'no-model-executed',method:'Verifier test only',executedAt:'2025-01-01T00:00:00Z',definitionVersion:'0.1.0',outputs:JSON.parse(fixturesRaw).map(fixture => ({fixtureId:fixture.id,fields:{},evidence:{},issues:[]}))});
    const capturePath = join(folder,'capture.json');
    await writeFile(capturePath,captureRaw);
    const report = await evaluateFile(capturePath, join(folder,'report.json'));
    assert.equal(report.passed,false);
    assert.deepEqual(verifyEvidence(captureRaw,report,fixturesRaw),report);
    for (const alter of [
      value => {value.passed=true;},
      value => {value.cases[0].checks[0].passed=true;},
      value => {value.provider='fabricated-provider';},
      value => {value.definitionVersion='0.2.0';},
      value => {value.limitations=['No limitations'];},
      value => {value.captureSha256='0'.repeat(64);},
    ]) {
      const modified=structuredClone(report); alter(modified);
      assert.throws(()=>verifyEvidence(captureRaw,modified,fixturesRaw));
    }
    assert.throws(()=>verifyEvidence(captureRaw+' ',report,fixturesRaw));
    assert.throws(()=>verifyEvidence(captureRaw,report,fixturesRaw+' '));
  } finally {await rm(folder,{recursive:true,force:true});}
});
