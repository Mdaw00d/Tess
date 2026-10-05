# tess

Next.js 16 + TypeScript product library with Tailwind, Radix/shadcn-style primitives, Zod, and Drizzle/PostgreSQL.

## Run

Use Node.js 20.9 or newer. Install with npm install, run npm run dev, and open http://127.0.0.1:3000.

npm run build validates the production application and TypeScript. npm run typecheck checks types separately.

## Content and storage

Without SUPABASE_DATABASE_URL the application reads seven example drafts from lib/content.ts. With SUPABASE_DATABASE_URL it reads current versions from PostgreSQL and searches using indexed Postgres full-text search. It does not silently fall back if a configured database fails.

See docs/supabase-setup.md for connection, migrations, seeding, and production activation. Commands: npm run db:generate, npm run db:migrate, npm run db:seed. Production migrations, seeding, reads, and full-text search have been verified against Supabase.

See docs/evaluation-plan.md for the next capability-evaluation work. Website tests do not establish agent reliability. All current definitions remain unevaluated.

## Deployment

Production: https://tess-ruddy.vercel.app. Deploy via npx vercel@latest deploy --prod. Set SUPABASE_DATABASE_URL only after migrations and seeding succeed.

Auth, analytics, email, payments, and agent execution remain deferred until their product workflows exist.

## Docker-free checks

Run npm run test:db for disposable in-memory PostgreSQL checks using the development-only PGlite dependency. It runs the actual migrations and shared seed function. No Docker, database service, port, credentials, or persisted database files are required. Production continues to use Supabase/PostgreSQL through postgres-js.

Run npm run test:eval to test the offline evaluation grader. See evaluations/README.md for capturing actual agent outputs. Grader tests do not establish skill reliability.


Evaluation history is read from PostgreSQL and attached to the exact tested version. Current-version record counts do not imply passing results; previous-version records do not establish current-version reliability.
