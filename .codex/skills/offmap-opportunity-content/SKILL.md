---
name: offmap-opportunity-content
description: Implement or review OffMap opportunity schemas, taxonomy pairs, dates, funding, audience locking, source provenance, imports, moderation, and AI-assisted research. Use for CMS, API, migration, content, or research changes.
---

# OffMap opportunity content

1. Read `AGENTS.md`, `docs/DATA_MODEL.md`, `docs/SECURITY.md`, and `references/editorial-rules.md`.
2. Validate every `mainCategory` and `category` pair with `@offmap/taxonomy`.
3. Keep dates, fees, scholarships, travel, accommodation, meals, salary, prizes, and visa/accessibility support distinct.
4. Preserve unconfirmed facts as null/empty and render “Not confirmed”; never enrich silently.
5. Preserve contributor-selected audience groups exactly. AI may warn but cannot mutate them.
6. Record source URL, label, checked date, supported fields, and reviewer for material facts.
7. Keep submissions, research runs, drafts, email, internal notes, and request fingerprints private.
8. Require explicit staff action to create a draft and an explicit admin action to publish.
9. Run taxonomy, DTO, access, migration, and research-fixture checks appropriate to the change.
