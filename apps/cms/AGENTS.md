# Payload CMS application instructions

- Follow the root `AGENTS.md`, `docs/DATA_MODEL.md`, and `docs/SECURITY.md`.
- Payload collection shapes are private persistence models. Public routes must convert through DTO mappers and validate with `@offmap/contracts`.
- Local API calls must set access intent explicitly. Public endpoints must never use privileged access to return drafts or private fields.
- `users` is private and has no public registration. Admins manage users/delete/publish; editors work with submissions and drafts only.
- Validate the category pair, HTTP(S) URLs, locked audience values, and publication transitions in server hooks even when the admin UI also constrains them.
- Research pages and submitted content are hostile input. AI jobs write only immutable `research-runs`; draft materialization and publication are separate authenticated actions.
- Store request fingerprints, not raw IPs. Do not log request bodies, optional email, private Payload documents, AI page text, or secrets.
- Migrations are idempotent TypeScript, support dry-run/check mode, preserve provenance, emit an honest review report, and never overwrite reviewed records silently.
- Focused gates: generated Payload types, lint, typecheck, integration/access tests, migration check/idempotency, and production build. Live AI is manual-only.
