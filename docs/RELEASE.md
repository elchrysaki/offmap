# OffMap release gates

## Automated baseline

Run clean-install, formatting, lint, TypeScript, unit/integration/contract tests, Payload type generation, Expo Doctor, Expo web export, CMS production build, migration status, and Playwright web E2E. CI uses isolated fixture data and recorded AI outputs only.

```sh
pnpm install --frozen-lockfile
pnpm --filter @offmap/cms generate:types
pnpm verify
pnpm --filter @offmap/app doctor
pnpm build
pnpm playwright:install
pnpm test:e2e
```

The CMS container is built from the repository root with `docker build -f Dockerfile.cms .`. EAS profiles are development, preview, and production; credentials and production environment values are configured in EAS rather than committed.

## Evidence levels

| Level                 | Proves                                                                  | Does not prove                                                  |
| --------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| Unit/integration      | deterministic logic and boundaries                                      | rendered UX or deployed infrastructure                          |
| Browser E2E           | responsive web flows and keyboard behavior                              | native behavior or store readiness                              |
| Simulator/emulator    | native build and scripted interaction                                   | physical sensors, hardware performance, or release distribution |
| Physical device       | manual screen reader, dynamic type, links, persistence, and device feel | store acceptance or production services                         |
| Internal distribution | signed TestFlight/Play internal install and upgrade                     | public rollout safety                                           |
| Production smoke      | real environment wiring and public flows                                | long-term reliability                                           |

## Beta checklist

- Staging web and isolated CMS/database are healthy; drafts and submissions cannot be fetched publicly.
- iOS TestFlight and Android internal builds pass physical-device review.
- Keyboard, screen reader, dynamic type, reduced motion, focus, target sizes, and contrast are checked.
- Official external links are visibly external and restricted to HTTP(S).
- Backups, restore rehearsal, rollback, environment separation, secret rotation, privacy wording, data retention, first-admin recovery, and on-call ownership are documented.
- Import parity is exactly 23 published and 2 archived records and representative fields are reviewed.

Legacy Python/workflow automation is disabled only after the production smoke gate succeeds. Git history remains the archive.
