import Link from 'next/link';
import type { Definition } from '@/lib/content';
import { getDefinition, getEvaluations } from '@/lib/repository';
import { Copy } from './copy';

export async function Detail({item}:{item:Definition}) {
  const [related, records] = await Promise.all([getDefinition(item.related), getEvaluations(item.slug)]);
  const currentRecords = records.filter(record => record.version === item.version);
  const status = currentRecords.length ? `${currentRecords.length} evaluation records` : 'Not evaluated';
  const text = JSON.stringify({...item, testingStatus:currentRecords.length ? 'evaluation_recorded' : 'not_evaluated'},null,2);
  return <section className="page-shell detail">
    <Link className="back" href={`/${item.kind}s`}>← All {item.kind}s</Link>
    <div className="eyebrow">{item.category.toUpperCase()} / {item.kind.toUpperCase()} / V{item.version}</div>
    <h1>{item.name}</h1><p className="intro">{item.description}</p>
    <div className="notice">Draft · {status} · Example definition</div>
    <div className="detail-layout"><article>
      <h2>When to use it</h2><p>Use this {item.kind} when you need to {item.description.charAt(0).toLowerCase()+item.description.slice(1)}</p>
      <div className="io"><div><h2>Inputs</h2><ul>{item.inputs.map(s=><li key={s}>{s}</li>)}</ul></div><div><h2>Outputs</h2><ul>{item.outputs.map(s=><li key={s}>{s}</li>)}</ul></div></div>
      <h2>{item.kind==='loop'?'Stages & termination':'Process'}</h2><ol className="process">{item.stages.map(s=><li key={s}>{s}</li>)}</ol>
      <h2>Evaluation & known limitations</h2><p>{item.limitations}</p>
      <p>{currentRecords.length ? 'Evaluation records exist for this version. Review their results and limitations before drawing conclusions about reliability.' : `No evaluation records for v${item.version}. This definition describes intended behavior; it does not establish reliability.`}</p>
      <h3>Evaluation history</h3>
      {!records.length && <p>No execution evidence has been recorded.</p>}
      {records.map(record=><section key={record.id} aria-label={`Evaluation of v${record.version}`}>
        <h3>v{record.version} · {record.version===item.version ? 'Current version' : 'Previous version'}</h3>
        <p><time dateTime={record.evaluatedAt.toISOString()}>{record.evaluatedAt.toISOString().slice(0,10)}</time> · {record.method}</p>
        <p>{record.limitations}</p>
        <details><summary>View recorded results</summary><pre>{JSON.stringify(record.results,null,2)}</pre></details>
      </section>)}
      <h2>Example composition</h2><p>{item.kind==='skill'?'Provide the listed inputs, run the process, and review the outputs within the related loop.':'Apply this pattern to the related skill, evaluate each result, and stop at the documented limit.'}</p>
      {related&&<Link className="related" href={`/${related.kind}s/${related.slug}`}>{related.name} ↗</Link>}
      <h2>Reuse this definition</h2><Copy text={text}/><pre>{text}</pre>
    </article><aside><span>DEFINITION AT A GLANCE</span><dl><dt>Type</dt><dd>{item.kind}</dd><dt>Version</dt><dd>{item.version}</dd><dt>Evaluation</dt><dd>{status}</dd><dt>Requirements</dt><dd>{item.slug==='source-research'?'Source search and retrieval':'Text input and structured output'}</dd></dl><p>Inspect and adapt this draft before using it in a production workflow.</p></aside></div>
  </section>;
}
