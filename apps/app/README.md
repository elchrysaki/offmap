# OffMap universal app

Expo Router application for responsive web, iOS, and Android. Students can discover, locally save, share, and contribute public opportunity sources without an account.

From the repository root:

```sh
pnpm dev:app
pnpm --filter @offmap/app doctor
pnpm --filter @offmap/app build:web
pnpm --filter @offmap/app test:e2e
```

Set `EXPO_PUBLIC_API_URL` to the Payload service origin, without `/api/v1`. Saved IDs and the last successful public responses are device-local. Contributions require a live connection.

EAS build profiles live in `eas.json`. Store identifiers and credentials must be reviewed before the first signed build.
