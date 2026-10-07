# Admin library

Open /admin or choose Manage your library on /account. Every page and mutation checks a database-backed session and the server-only TESS_ADMIN_EMAILS allowlist. The email must be verified by Google (or a future email verification flow). Unverified email registrations and ordinary signed-in users cannot administer the library. No public endpoint can grant admin access. An empty allowlist disables access.

Set TESS_ADMIN_EMAILS to your Google sign-in email in Vercel Production and your local .env.local. Comma-separated addresses are supported if another editor is explicitly authorized. Redeploy after changing it. Never use NEXT_PUBLIC_ for this setting.

## Upload and edit

- Upload .md / SKILL.md or .txt content into the Instructions field, then fill in the metadata, inputs, outputs, process, and known limitations. Markdown stays plain text: scripts and HTML are never executed.
- Upload .json for a complete structured definition. Download the JSON template from the editor. The parser strips supplied evaluation counts and testing claims.
- Both skills and loops support Markdown and JSON. For loops, also fill Conditions and Termination criteria.
- Slug and type are fixed after creation, preserving links. Other fields remain editable.
- Uploads are limited to 200 KB. No binary assets or executable files are accepted.

Save draft keeps changes private. Preview shows the current form without publishing. Save & publish saves and validates all fields, creates a new immutable version, and makes it public. Existing published content stays visible while you edit its next draft. Each publication needs an unused version number (for example 0.1.1).

Unpublish hides an item; archive hides it while retaining all records. Republish current version restores the last published version, without publishing a pending draft. Restore as draft copies older content into a new editable draft; it never overwrites history. Unsaved form changes are replaced when restoring a version. Evaluation evidence remains attached to the version originally tested, and is never copied to a new version.

Concurrent stale saves are rejected. Publishing and visibility changes are transactional. Activity records are stored with the acting account ID. Draft and audit tables have RLS enabled with no anonymous policies.

Apply migrations with npm run db:migrate before deploying this version. npm run test:admin exercises the upload validators, access allowlist, draft/publication boundaries, version immutability, stale edits, archives, restores, and evaluation preservation using disposable PostgreSQL without Docker.
