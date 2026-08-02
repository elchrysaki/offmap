# ADR 0002: Payload CMS inside Next.js

Status: accepted

Use Payload 3 in Next.js with PostgreSQL for authentication, access control, drafts, versions, admin UI, and persistent jobs. The student app consumes a stable `/api/v1` facade, not Payload collection responses, so content storage can evolve without coupling clients.
