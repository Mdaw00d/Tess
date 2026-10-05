import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import postgres from 'postgres';
import nextEnv from '@next/env';
import { verifyEvidence } from './verify.mjs';

nextEnv.loadEnvConfig(process.cwd());
const [capturePath, reportPath, reviewer] = process.argv.slice(2);
let client;
try {
  if (!capturePath || !reportPath || !reviewer?.trim()) throw new Error('MISSING_ARGUMENTS');
  const url = process.env.SUPABASE_DATABASE_URL;
  if (!url) throw new Error('MISSING_SUPABASE_DATABASE_URL');
  const [captureRaw, reportRaw, fixturesRaw] = await Promise.all([
    readFile(capturePath, 'utf8'), readFile(reportPath, 'utf8'),
    readFile(new URL('./document-extraction.fixtures.json', import.meta.url), 'utf8'),
  ]);
  let report;
  try { report = verifyEvidence(captureRaw, JSON.parse(reportRaw.replace(/^\uFEFF/, '')), fixturesRaw); }
  catch { throw new Error('EVIDENCE_VALIDATION_FAILED'); }
  client = postgres(url, {prepare:false, max:1, connect_timeout:10});
  const inserted = await client.begin(async tx => {
    const versions = await tx`select v.id from versions v join entries e on e.id=v.entry_id where e.slug=${report.skillSlug} and v.version=${report.definitionVersion}`;
    if (versions.length !== 1) throw new Error('DEFINITION_VERSION_NOT_FOUND');
    // Stable identity makes retrying an import safe, including concurrent retries.
    const hash = createHash('sha256').update(`${versions[0].id}:${report.captureSha256}:${report.fixturesSha256}`).digest('hex');
    const id = `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
    const results = {...report, reviewer:reviewer.trim(), recordedAt:new Date().toISOString()};
    const rows = await tx`insert into evaluations (id,version_id,method,results,limitations,evaluated_at)
      values (${id},${versions[0].id},${report.method},${tx.json(results)},${report.limitations.join('\n')},${report.executedAt})
      on conflict (id) do nothing returning id`;
    return rows.length;
  });
  console.log(inserted ? 'Evaluation evidence recorded for the exact tested version (including failed checks).' : 'This capture is already recorded; no duplicate created.');
} catch (error) {
  const known = ['MISSING_ARGUMENTS','MISSING_SUPABASE_DATABASE_URL','EVIDENCE_VALIDATION_FAILED','DEFINITION_VERSION_NOT_FOUND'];
  const code = error?.code;
  const reason = known.includes(error?.message) ? error.message : /^[A-Z0-9_]{1,40}$/.test(code ?? '') ? code : 'EVALUATION_IMPORT_FAILED';
  console.error(`Evaluation import failed: ${reason}. Credential and input details suppressed.`);
  if (reason === 'MISSING_ARGUMENTS') console.error('Usage: npm run eval:record -- capture.json report.json reviewer-name');
  process.exitCode = 1;
} finally { if (client) await client.end(); }
