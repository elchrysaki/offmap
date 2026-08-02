# OffMap security and privacy

## Trust boundaries

All guest text, URLs, imported Markdown, remote pages, AI output, and request metadata are untrusted. Only validated DTOs cross the public API. Payload access control is enforced for every collection and separate route handlers perform explicit role checks.

## Publication boundary

- Anonymous users can read published opportunities and create bounded submissions only.
- Editors can manage submissions and drafts but cannot publish, delete, or manage users.
- Admins explicitly publish after review.
- AI output is stored only in immutable research runs; it cannot publish or silently change contributor-locked audience groups.

## Submission controls

The submission endpoint enforces a small JSON body limit, Zod validation, HTTP(S) URLs, consent, a hidden honeypot, normalized text lengths, and database-backed throttling using a secret-keyed request fingerprint. Raw IP addresses are not stored. Honeypot submissions receive a generic accepted response and are not researched.

Optional email is private, not copied into opportunity records, and deleted by the retention job. Logs must exclude request bodies, raw IPs, emails, secrets, tokens, private documents, and AI page content.

## AI research

Prompts identify remote text as untrusted evidence, reject page instructions, prioritize official sources, require citations, preserve uncertainty, and prohibit autonomous CMS actions. Runs record model, prompt version, citations, warnings, usage, and failures. Fixtures cover prompt injection and unsupported claims; CI makes no live AI calls.

## Operations

Use separate development, staging, and production databases and credentials. Configure managed backups and periodically test restoration. Rotate Payload, database, hashing, OpenAI, Expo, and hosting secrets on staff changes or exposure. First-admin recovery requires direct production operator access and is logged.

Vulnerabilities must be reported privately through the repository’s GitHub security advisory flow, never through opportunity submissions.
