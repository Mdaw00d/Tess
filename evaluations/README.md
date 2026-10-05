# Capturing a real document-extraction run

These four fictional fixtures are an offline evaluation suite, not an agent runtime in the website.

For each fixture in document-extraction.fixtures.json:
1. Give the agent the document-extraction v0.1.0 definition from lib/content.ts and the fixture input. Do not expose expected values to the executing agent.
2. Request fields name, role, company, location, salary. Missing or ambiguous values must be null. Return JSON with fields, evidence (verbatim source excerpts for non-null fields), and issues (strings describing uncertainty).
3. Capture the actual output unchanged. Repeat across providers/configurations as needed.

Capture envelope:

```json
{
  "provider": "actual provider",
  "model": "actual model identifier",
  "method": "describe how the definition was executed",
  "definitionVersion": "0.1.0",
  "executedAt": "actual ISO timestamp",
  "configuration": {},
  "outputs": [
    {"fixtureId":"complete-profile","fields":{},"evidence":{},"issues":[]}
  ]
}
```

Include exactly one output for each of the four fixture IDs. The incomplete envelope above is a format example, not execution evidence. Never include credentials.

Run npm run eval:grade -- path/to/capture.json path/to/new-report.json. The grader retains actual inputs and outputs, per-check results, execution metadata, content hashes, and limitations. It refuses to overwrite an existing report and never updates skill status automatically.

npm run test:eval tests the grader itself with intentional good/bad outputs. Passing those tests is not an agent capability evaluation. No real provider outputs have been captured yet.

## Save reviewed evidence to the library

After reviewing the actual captured outputs and grader report, run:

```sh
npm run eval:record -- path/to/capture.json path/to/report.json reviewer-name
```

This command requires the server-only SUPABASE_DATABASE_URL. It verifies capture and fixture hashes, recomputes every check, validates metadata and limitations, and saves the report against the exact document-extraction version. It preserves failed results. Repeating the same import does not create duplicate records. Current-version records appear in the library; old-version records appear only in version history.

Hashes establish file integrity, not proof of provider execution. The reviewer must verify how outputs were obtained. Never label synthetic grader tests as real runs. This importer currently supports the document-extraction v0.1.0 suite only; the other skills and loops still require their own fixtures and execution evidence.
