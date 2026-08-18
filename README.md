# OffMap

OffMap is a student-powered directory for opportunities that are easy to miss and worth knowing about. The MVP centers on three actions: **discover, save, contribute**.

The repository is being migrated from a GitHub/Markdown proof of concept to a universal Expo application backed by Payload CMS and PostgreSQL. Legacy Python workflows and source records remain as migration inputs until parity and production smoke checks pass.

## Workspace

| Path                 | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `apps/app`           | Expo Router app for web, iOS, and Android         |
| `apps/cms`           | Next.js + Payload admin, API, jobs, and migration |
| `packages/contracts` | Shared runtime API schemas and DTOs               |
| `packages/taxonomy`  | Canonical categories and validation               |
| `packages/design`    | OffMap colors, type, spacing, and shape tokens    |

## Start locally

```sh
mise install
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm --filter @offmap/cms admin:seed
pnpm dev
```

The app defaults to `http://localhost:8081`; Payload and the public facade API default to `http://localhost:3001`. Docker exposes the development database on host port `5433` to avoid colliding with a locally installed PostgreSQL server.

## Quality gates

```sh
pnpm verify
pnpm --filter @offmap/app exec expo-doctor
pnpm --filter @offmap/app build:web
pnpm --filter @offmap/cms build
```

See [PRODUCT.md](docs/PRODUCT.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md), [SECURITY.md](docs/SECURITY.md), and [RELEASE.md](docs/RELEASE.md) for the canonical product and delivery rules.
