# Google authentication

Tess uses Better Auth with its Drizzle/PostgreSQL adapter, Google OAuth, and database-backed sessions. Public library routes stay available; /account requires a valid server-checked session. Email/password signup and login are also supported. Automatic account linking remains disabled. Auth tables have RLS enabled without anonymous policies. Default Google scopes are identity/profile/email only.

## Google Cloud setup

1. Open https://console.cloud.google.com/ and select or create a project.
2. Configure Google Auth Platform branding, audience, and contact email. Use External if people outside your organization should sign in. While the app is in Testing, add your Google account as a test user.
3. Create an OAuth client of type Web application.
4. Register these exact authorized redirect URIs:
   - https://tess-ruddy.vercel.app/api/auth/callback/google
   - http://127.0.0.1:3000/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google if using localhost instead of 127.0.0.1.
5. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in local .env.local and Vercel Production. Never commit credentials.
6. Set BETTER_AUTH_SECRET to a cryptographically random value of at least 32 characters. Keep it stable across deployments; changing it invalidates sessions and encrypted data.
7. Set BETTER_AUTH_URL to https://tess-ruddy.vercel.app in Production and http://127.0.0.1:3000 locally. The value must match the host you actually open in the browser.
8. Apply migrations with npm run db:migrate, then redeploy/restart.

For Preview Google login, use an explicit stable Preview hostname, register its exact callback in Google, and configure all auth variables plus BETTER_AUTH_URL for that Preview environment. Arbitrary Preview hostnames are not automatically trusted. Never point Preview authentication at the production base URL.

## Verification

npm run test:auth runs the real Better Auth handlers and Drizzle adapter against disposable PGlite. It checks email signup/login, password hashing and changes, Google-account password creation, OAuth redirect/PKCE, external callback rejection, cookie validation, expiration, logout revocation, origin enforcement, and auth-table RLS. These checks use synthetic records and do not sign in to Google. The user has confirmed real Google sign-in succeeds on Vercel. To finish the manual session check, open /account, sign out, and confirm /account redirects to /sign-in.

Missing or invalid auth configuration disables Google sign-in with a clear setup message while library browsing stays available. Server secrets are never passed to client components.

References: https://better-auth.com/docs/authentication/google and https://better-auth.com/docs/integrations/next

## Email and password

Users can create an account or sign in with email and their TESS password from /sign-in. Passwords require 12–128 characters and are hashed by Better Auth. Google users can create a separate TESS password from /account after signing in within the last ten minutes. Existing passwords require the current password to change; other sessions are revoked after a change. Duplicate email registrations never overwrite Google or password accounts.

Email verification and password recovery are implemented with Resend. Configure RESEND_API_KEY and RESEND_FROM_EMAIL to activate delivery and required email verification; see email-setup.md. Without these settings, existing login stays available and recovery links remain hidden. New email registrations retain emailVerified=false until verified.
