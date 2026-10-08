# PostHog analytics
TESS uses the official posthog-js SDK initialized through Next.js instrumentation-client.ts.
Tracking stays disabled when either public configuration value is absent or the ingestion host is not HTTPS.

## Activation
1. Create a PostHog project at https://app.posthog.com/signup.
2. Open the project's Next.js setup guide. Copy its project token and ingestion host.
3. Add NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN and NEXT_PUBLIC_POSTHOG_HOST to Vercel's Production environment. Use the project token, not a personal API key.
4. Redeploy TESS: these public values are embedded at build time.
5. Visit the live website, open a skill, use a category filter, search, and copy a definition. In PostHog's activity view confirm the events arrive. Ad blockers and Do Not Track can suppress events.

## Events
- $pageview: initial load and completed pathname changes, including skill/loop detail views.
- library_searched: debounced nonempty searches, query length, kind, category-filter status, and result count. Search text is excluded.
- library_category_selected: kind and whether a category filter is active.
- definition_copied: public kind, slug, version, after successful clipboard copy.
- auth_started: Google or email, sign-in or sign-up.
- account_created: successful email signup and whether verification is required.
- signed_out: after a successful sign-out.
Known sessions are identified by internal user ID only. No email or name is sent. Identity resets on account changes and sign-out.
A sign-in funnel can use auth_started followed by an identified /account pageview. Browsing funnels can use library pageviews, detail pageviews, then definition_copied.

## Collection controls
Automatic click capture, session recording, surveys, exceptions, heatmaps, performance capture, and feature flag fetching are disabled. Respect Do Not Track.
Manual event properties use an allowlist. URL query strings, fragments, referrers, and nested initial URL properties are removed before dispatch.
Admin pages are grouped as /admin without draft IDs; unknown paths as /other. No file names, draft contents, credentials, OAuth codes, or reset tokens are tracked.
The SDK uses its standard browser persistence for anonymous identity. There is no consent banner in this integration.
Browser events are usage signals, not authoritative security/audit records.
SDK failures do not block the product.

## Validation
Run npm run test:analytics, npm run typecheck, and npm run build.
The analytics check uses a mock transport and never sends live events. Actual project ingestion must be verified after configuration.
Reference: https://posthog.com/docs/libraries/next-js

