# OffMap repository instructions

## Purpose and product boundary

OffMap is a student-first, worldwide directory for discovering, saving, and contributing opportunities. The canonical brand is **OffMap** and the approved visual reference is `hero_section_gm.png`. “Enchanted Map”, unicorn, quest, and game concepts are legacy material and must not ship.

The MVP is guest-first. Students can browse, locally save, share, open official links, and submit an opportunity without an account. Do not add student accounts, profiles, application tracking, uploaded documents, comments, ratings, communities, a literal map, push notifications, or cross-device tracking without an approved product change.

Only authenticated CMS users may moderate content. Editors prepare and review drafts; only admins publish or delete. AI may propose research into an immutable research run, but it must never alter contributor-selected audience values, create a draft without a second explicit human action, or publish.

## Workspace map

- `apps/app`: Expo Router universal student app for web, iOS, and Android.
- `apps/cms`: Payload CMS in Next.js, admin UI, public facade API, migrations, and jobs.
- `packages/contracts`: shared Zod API DTOs.
- `packages/taxonomy`: canonical categories and content validation.
- `packages/design`: shared visual tokens and portable assets.
- `docs`: canonical product, brand, architecture, data, security, release, and ADRs.
- `.codex/skills` and `.codex/agents`: project-specific AI guidance.
- `data`, `opportunities`, `scripts/*.py`, and legacy workflows: migration inputs only until the parity and production smoke gates pass.

## Toolchain and commands

- Use Node 22.13.x and pnpm. Run `mise install` when the pinned tools are missing.
- Install Expo-managed native dependencies with `pnpm --filter @offmap/app exec expo install ...`.
- New runtime, migration, job, and automation code must be TypeScript/JavaScript. Do not add Python.
- Copy `.env.example` to `.env` locally; never commit secrets or real contributor data.
- Common gates: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:legacy`, and `pnpm verify`.

## Editorial invariants

- Missing facts are represented as `null`, an empty list, or “Not confirmed”; never infer them for presentation.
- `mainCategory` and `category` must be a valid pair from `@offmap/taxonomy`.
- Audience groups come only from the contributor’s explicit dropdown selection. AI can warn about a mismatch but cannot add or remove a group.
- Preserve source URLs, checked dates, supported fields, reviewer, verification date, and legacy provenance.
- Public APIs expose only published opportunities. Submissions, user data, research runs, internal notes, IP hashes, and drafts are private.
- Official/apply URLs must be HTTP(S), visibly leave OffMap, and never execute supplied markup or scripts.

## Security and privacy boundaries

- Treat submission text, URLs, scraped pages, AI output, and imported content as untrusted.
- Validate at every public boundary, cap request size, rate-limit submissions in the database, and keep honeypot failures indistinguishable from accepted spam.
- Never log raw IP addresses, secrets, optional contact emails, or private Payload documents.
- Contact email is optional, private, and removed by the retention job.
- Do not expose PostgreSQL through MCP or create an OffMap production-data MCP server.

## Evidence rules

- Keep automated, browser, simulator, physical-device, TestFlight/Play internal, store, and production evidence separate.
- A build or simulator pass does not prove accessibility on hardware, physical-device behavior, store acceptance, backups, or production readiness.
- Do not retire legacy automation until import counts are 23 published and 2 archived, representative parity is reviewed, and production smoke tests pass.
- Preserve unrelated worktree changes and keep changes scoped. Update canonical docs and tests with behavior changes.
