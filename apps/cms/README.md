# OffMap CMS and API

Payload CMS inside Next.js supplies editor authentication, drafts and versions, PostgreSQL persistence, public DTO routes, moderation records, and queued research/lifecycle jobs.

From the repository root:

```sh
docker compose up -d postgres
PORT=3001 pnpm dev:cms
pnpm --filter @offmap/cms admin:seed
pnpm --filter @offmap/cms migration:report
pnpm --filter @offmap/cms migration:import
```

Public routes are under `/api/v1`; Payload collection responses are not the app contract. AI writes immutable `research-runs` only. An admin must separately materialize a draft and later publish it.

Build the production service from the repository root with `docker build -f Dockerfile.cms .`. Runtime secrets and the managed PostgreSQL URL are injected by the deployment platform.
