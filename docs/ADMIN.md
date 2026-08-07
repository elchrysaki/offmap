# Editorial administration

## First administrator

Set `OFFMAP_ADMIN_EMAIL`, `OFFMAP_ADMIN_PASSWORD`, `PAYLOAD_SECRET`, and `DATABASE_URL`, then run `pnpm --filter @offmap/cms admin:seed`. The command refuses weak or missing credentials and is safe to rerun for the configured email.

## Submission to publication

1. Open **Submissions** and inspect the source, note, possible duplicates, consent timestamp, and moderation state.
2. An admin may queue cited research with `POST /api/v1/admin/research` using an authenticated Payload session and `{ "submissionId": "..." }`.
3. Inspect the immutable **Research runs** record: proposal, citations, warnings, prompt version, model, usage, and any failure. Audience groups are never inferred.
4. An admin may explicitly materialize a draft with `POST /api/v1/admin/research-runs/:id/materialize` and `{ "confirm": true }`.
5. An editor reviews the new draft and its sources. Editors cannot publish or delete opportunities.
6. An admin performs the distinct publish action. Payload records the version and actor.

AI output is untrusted drafting evidence. It never changes a submission into public content, never publishes, and must leave unsupported facts unconfirmed.

## Routine queues

The same service runs the persistent Payload job queue. The lifecycle task flags expired/stale records and deletes retained contact email after its deadline. It may never invent content or publish. If the job volume grows, run `pnpm --filter @offmap/cms jobs:run` in a separately scaled worker using the same database and secrets.
