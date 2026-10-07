# Verification and password recovery

TESS sends verification and password-reset links through the Resend HTTPS API. No secrets are sent to browser components. The integration activates when both RESEND_API_KEY and RESEND_FROM_EMAIL are valid and configured; while these are absent, existing email/password and Google login remain available and recovery links are hidden.

## Activate delivery

1. Create or open your account at https://resend.com.
2. In Domains, add a domain you own and copy the required DNS records to your DNS provider. Wait for Resend to mark the domain verified. A Vercel subdomain does not give you DNS ownership.
3. In API Keys, create a key with sending permission for that domain.
4. In Vercel → TESS → Settings → Environment Variables → Production, add RESEND_API_KEY and RESEND_FROM_EMAIL (for example TESS <accounts@your-domain.com>). Do not use NEXT_PUBLIC_ names. Never paste the key in chat or commit it.
5. Redeploy. Existing unverified email/password users will then need to verify their address before their next email sign-in. Google accounts are already verified; their login remains available.
6. Create an email/password account you control, check the verification email, follow its link, and sign in. Then request a password-reset email and complete the flow. Check Resend delivery logs if the email does not arrive.

Verification and reset links expire after one hour. Verification does not automatically sign the user in. Reset tokens are single-use; successful reset revokes all sessions. Requests use generic responses so unknown email addresses are not disclosed. Email routes have request limits. These Better Auth limits currently use per-instance memory storage, not a distributed rate-limit service.

Next.js after() retains email work after the HTTP response. Delivery errors log only a generic message; credentials, addresses, and token URLs are not logged. Resend idempotency keys prevent duplicate delivery of the same token. No persistent email queue or automatic retry worker is claimed. Users can request another link if delivery fails.

npm run test:email exercises the actual Better Auth handlers with disposable PostgreSQL and captures email payloads in memory. It checks verification, expiry, reset reuse, revocation, origin protections, rate limits, and Resend payload validation without sending actual emails. Live delivery requires the owner-controlled domain and API key above.
