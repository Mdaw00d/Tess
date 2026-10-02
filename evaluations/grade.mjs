import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export function gradeCase(fixture, output) {
  const checks = [];
  const record = (name, passed) => checks.push({name,passed:Boolean(passed)});
  const fields = output?.fields;
  const evidence = output?.evidence;
  record('fields match the requested schema', fields && typeof fields === 'object' && !Array.isArray(fields) && Object.keys(fields).sort().join('|') === Object.keys(fixture.expected).sort().join('|'));
  for (const [field, expected] of Object.entries(fixture.expected)) {
    record(`${field}: expected value or explicit abstention`, fields?.[field] === expected);
    if (expected !== null) {
      const excerpt = evidence?.[field];
      record(`${field}: supporting excerpt exists in source`, typeof excerpt === 'string' && excerpt.trim().length > 0 && fixture.input.includes(excerpt));
    } else {
      record(`${field}: no invented evidence for absent/ambiguous value`, evidence?.[field] == null);
    }
  }
  record('issues are explicitly listed', Array.isArray(output?.issues) && output.issues.every(issue => typeof issue === 'string'));
  if (fixture.requiredIssue) record('required uncertainty is disclosed', Array.isArray(output?.issues) && output.issues.some(issue => typeof issue === 'string' && issue.toLowerCase().includes(fixture.requiredIssue)));
  return {fixtureId:fixture.id,passed:checks.every(check => check.passed),checks};
}

export async function evaluateFile(inputPath, reportPath) {
  const raw = await readFile(inputPath, 'utf8');
  const captured = JSON.parse(raw.replace(/^\uFEFF/, ''));
  for (const key of ['provider','model','method','executedAt']) {
    if (typeof captured[key] !== 'string' || !captured[key].trim()) throw new Error(`Capture requires ${key}.`);
  }
  if (!Number.isFinite(Date.parse(captured.executedAt))) throw new Error('executedAt must be an ISO date.');
  if (captured.definitionVersion !== '0.1.0') throw new Error('Fixture suite applies only to definition version 0.1.0.');
  if (!Array.isArray(captured.outputs)) throw new Error('Capture requires outputs array.');
  const fixturesRaw = await readFile(new URL('./document-extraction.fixtures.json', import.meta.url), 'utf8');
  const fixtures = JSON.parse(fixturesRaw.replace(/^\uFEFF/, ''));
  const ids = captured.outputs.map(output => output.fixtureId);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate fixture outputs.');
  if (ids.length !== fixtures.length || fixtures.some(fixture => !ids.includes(fixture.id))) throw new Error('Capture must contain exactly one output per fixture.');
  const cases = fixtures.map(fixture => ({...gradeCase(fixture,captured.outputs.find(output => output.fixtureId === fixture.id)),input:fixture.input,output:captured.outputs.find(output => output.fixtureId === fixture.id)}));
  const report = {skillSlug:'document-extraction',definitionVersion:captured.definitionVersion,provider:captured.provider,model:captured.model,method:captured.method,configuration:captured.configuration ?? {},executedAt:captured.executedAt,reviewedAt:new Date().toISOString(),captureSha256:createHash('sha256').update(raw).digest('hex'),fixturesSha256:createHash('sha256').update(fixturesRaw).digest('hex'),passed:cases.every(item => item.passed),cases,limitations:['Four controlled fixtures only; not evidence of general reliability.','Scorer checks known values and source excerpt presence, not general semantic entailment.','One capture per fixture; repeated provider runs and independent review remain necessary.']};
  await writeFile(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [inputPath,reportPath] = process.argv.slice(2);
  if (!inputPath || !reportPath) throw new Error('Usage: npm run eval:grade -- capture.json new-report.json');
  const report = await evaluateFile(inputPath,reportPath);
  console.log(`${report.cases.filter(item=>item.passed).length}/${report.cases.length} cases passed. Evidence saved to ${reportPath}. Skill status was not changed.`);
  if (!report.passed) process.exitCode=1;
}

