import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { gradeCase, evaluationLimitations } from './grade.mjs';

const digest = text => createHash('sha256').update(text).digest('hex');

// Integrity checks tie a report to its unchanged capture and fixture suite.
// They cannot independently prove that the named provider executed the capture.
export function verifyEvidence(captureRaw, report, fixturesRaw) {
  const capture = JSON.parse(captureRaw.replace(/^\uFEFF/, ''));
  const fixtures = JSON.parse(fixturesRaw.replace(/^\uFEFF/, ''));
  if (report.skillSlug !== 'document-extraction' || report.definitionVersion !== '0.1.0' || capture.definitionVersion !== report.definitionVersion)
    throw new Error('Unsupported definition version.');
  if (report.captureSha256 !== digest(captureRaw) || report.fixturesSha256 !== digest(fixturesRaw))
    throw new Error('Evidence hashes do not match.');
  for (const key of ['provider', 'model', 'method', 'executedAt']) {
    if (typeof capture[key] !== 'string' || !capture[key].trim() || report[key] !== capture[key])
      throw new Error('Execution metadata does not match.');
  }
  if (!Number.isFinite(Date.parse(report.executedAt)) || !Number.isFinite(Date.parse(report.reviewedAt)))
    throw new Error('Invalid evidence date.');
  if (!isDeepStrictEqual(report.configuration, capture.configuration ?? {})) throw new Error('Configuration does not match.');
  if (!Array.isArray(capture.outputs) || capture.outputs.length !== fixtures.length || new Set(capture.outputs.map(item => item.fixtureId)).size !== fixtures.length)
    throw new Error('Capture requires exactly one output per fixture.');
  const cases = fixtures.map(fixture => {
    const output = capture.outputs.find(item => item.fixtureId === fixture.id);
    if (!output) throw new Error('Missing fixture output.');
    return {...gradeCase(fixture, output), input: fixture.input, output};
  });
  if (!isDeepStrictEqual(report.cases, cases) || report.passed !== cases.every(item => item.passed))
    throw new Error('Recorded results differ from recomputed checks.');
  if (!isDeepStrictEqual(report.limitations, evaluationLimitations))
    throw new Error('Evaluation limitations are required.');
  return report;
}
