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
