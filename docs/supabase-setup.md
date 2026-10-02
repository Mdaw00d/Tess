# Supabase activation

1. Create a Supabase project and obtain its PostgreSQL transaction-pooler connection string from Connect.
2. Set DATABASE_URL in .env.local. Use the pooler URL supplied by Supabase; keep it private and include the supplied TLS parameters.
3. Run npm run db:migrate, then npm run db:seed. Run these from a trusted local shell, not as part of the Vercel build.
4. Set DATABASE_URL in the Vercel tess project's Production environment and redeploy.
5. Verify library browsing, detail pages, search, and related links against the seeded database.

The application automatically selects database reads when DATABASE_URL exists. If that database fails, the UI reports failure instead of silently displaying local examples. The public API only supports read operations, validates query parameters, and returns generic errors without connection details. Credentials never enter client components.

The migration enables RLS on all four tables without browser-access policies. Use the server-side PostgreSQL role from the Supabase connection string. No anonymous client accesses these tables.

The seed runs in a transaction and uses conflict-safe inserts. Reruns preserve existing entry metadata and immutable versions. It adds seven example drafts, not evaluation evidence. New versions must be inserted and entries.current_version advanced together in a transaction.

Migrations, seed reruns, preservation of curated entries/versions, full-text search stemming, index creation, and RLS settings have passed an in-memory PostgreSQL test using PGlite. No Docker or database server is needed: run npm run test:db. This tests the schema and seed logic; Supabase network connectivity, pooler behavior, and hosted permissions still require a real Supabase connection. DATABASE_URL is not configured in this checkout.

