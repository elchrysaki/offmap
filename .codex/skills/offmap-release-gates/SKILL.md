---
name: offmap-release-gates
description: Plan, run, or audit OffMap local, CI, browser, simulator, physical-device, internal distribution, store, migration, privacy, backup, and production release verification. Use for testing, release readiness, deployment, or evidence claims.
---

# OffMap release gates

1. Read `AGENTS.md`, `docs/RELEASE.md`, `docs/SECURITY.md`, and `references/evidence-matrix.md`.
2. Select the smallest relevant automated gates, then run them with exact commands and preserve failure evidence.
3. Verify public draft exclusion and editor/admin publication boundaries for backend changes.
4. Verify web keyboard behavior and native accessibility/device behavior separately.
5. Require 23 published plus 2 archived imports and representative parity before legacy retirement.
6. Never label browser, build, simulator, fixture, or static review evidence as physical-device, distribution, store, backup-restore, or production proof.
7. Report passed, failed, skipped, and externally blocked gates distinctly.
