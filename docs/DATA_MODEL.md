# OffMap data model

## Collections

### Users

Private Payload auth records with `admin` or `editor` role. Admins manage users, delete, approve, and publish. Editors create and review submissions and drafts but cannot publish, delete, or manage users.

### Opportunities

Versioned documents with Payload draft status. Core fields cover identity, category pair, dates/timezone/rolling state, location/format, eligibility, academic targeting, funding, application links, program content, contributor-locked audience groups, field-level sources, verification, and legacy/publication provenance.

Availability is computed from facts: `upcoming`, `open`, `closing-soon`, `rolling`, `expired`, or `needs-verification`. It is not an editorial claim.

### Submissions

Private guest records with source URL, title, broad category or “not sure”, note, optional contact email, consent timestamp, workflow status, request fingerprint, and retention fields. Status transitions are `received → researching → draft-ready → in-review → approved/rejected`.

### Research runs

Append-only evidence records: submission/opportunity relation, model alias/snapshot, prompt version, structured proposal, citations, warnings, usage, error, actor, and timestamps. A run is never itself publishable content.

### Site settings

Global editorial configuration for featured opportunities, announcement, closing-soon threshold, and public contact links.

## Public DTOs

The public facade returns compact card DTOs, full detail DTOs, pagination, and non-empty facets. Private IDs, internal notes, emails, moderation fields, draft status, user records, and research material are excluded by construction and validated with shared Zod schemas.

## Honest uncertainty

Unconfirmed dates, funding, eligibility, prestige, and support stay null/empty and render as “Not confirmed”. Imports and AI are prohibited from filling gaps without evidence.
