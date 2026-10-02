# Website verification — 2026-10-01

Passed:
- Production build and TypeScript validation.
- Browser navigation from skills library to skill detail and related loop.
- Live search, category filtering, zero-result state, and clear filters.
- Copy definition: clipboard JSON matched the selected skill.
- Theme toggle and persistence after reload.
- Desktop homepage inspection at 1280 pixels.
- Narrow homepage inspection at 320 pixels; fixed header overflow and verified page width did not exceed viewport.
- Local API search and category responses; invalid kind returned HTTP 400.
- Local production homepage, skill/loop lists, and detail routes returned HTTP 200.

Not yet verified:
- Actual Supabase migration, seed idempotence against a live database, and PostgreSQL full-text search execution.
- Agent capability evaluations (see evaluation-plan.md).

The website checks above are not evidence of agent reliability.

Production follow-up: updated Vercel deployment reached READY. The smoke suite passed against https://tess-ruddy.vercel.app, including search, category filtering, invalid parameters, and missing/wrong-kind routes. The 320-pixel production homepage had no horizontal overflow.

Run the repeatable smoke suite with npm run test:smoke (defaults to http://127.0.0.1:3001). Set TEST_URL to test another origin. These checks assume the example definitions are present.

2026-10-02: Docker-free in-memory PostgreSQL suite passed (PGlite): migrations run twice, seed run twice without duplicates, existing curated metadata and version content preserved, English FTS stemming, GIN index existence, and RLS enabled on all four tables. All seven evaluation-grader tests passed. Hosted Supabase connectivity and real agent executions remain unverified. Docker is not needed by any project test command.
