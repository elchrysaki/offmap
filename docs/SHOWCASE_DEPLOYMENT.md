# Showcase deployment

Use this runbook when you want to show the current OffMap web app and CMS. It deploys the **temporary showcase** only: the free Render CMS/database plus an EAS Hosting web preview.

Current public URLs:

- Web: `https://offmap-showcase--showcase.expo.app/`
- CMS: `https://offmap-cms-achrysakis.onrender.com/admin`

## 1. Check your change

From the repository root, use the pinned Node version and run the normal automated gate:

```sh
mise exec node@22.13.0 -- pnpm verify
```

Commit and push the change to `mvp`. The Render Blueprint tracks that branch.

```sh
git push origin mvp
```

## 2. Deploy the CMS first

For ordinary CMS/code changes, Render deploys `mvp` automatically. Open the Render service and use **Manual Deploy** only if a deploy has not started:

<https://dashboard.render.com/web/srv-d9o66vu417fc73ekg190>

For a first deployment or after recreating the Blueprint, use `render.yaml` and supply only these two prompted values:

- `OFFMAP_ADMIN_EMAIL`
- `OFFMAP_ADMIN_PASSWORD` — use a new, strong password; never use the example value from `.env.example`.

Render generates the Payload and submission secrets, runs migrations, seeds the first admin, and imports the reviewed showcase records.

When the deploy is live, check it before deploying the app:

```sh
CMS_URL=https://offmap-cms-achrysakis.onrender.com
curl -fsS "$CMS_URL/health"
curl -fsS "$CMS_URL/api/v1/opportunities?limit=50"
```

Expect a ready health response and `pagination.totalItems: 23`. The archived test record must remain unavailable:

```sh
curl -o /dev/null -s -w '%{http_code}\n' \
  "$CMS_URL/api/v1/opportunities/nasa-lucy-mission-internship"
```

This should print `404`.

## 3. Export and deploy the web app

The API URL is embedded **when Expo exports the web bundle**, so set it explicitly on every showcase deploy. Do this only after the CMS check passes:

```sh
CMS_URL=https://offmap-cms-achrysakis.onrender.com

mise exec node@22.13.0 -- env \
  EXPO_PUBLIC_API_URL="$CMS_URL" \
  pnpm --filter @offmap/app exec expo export --platform web --clear

cd apps/app
mise exec node@22.13.0 -- pnpm dlx eas-cli@latest deploy \
  --alias showcase \
  --environment preview \
  --non-interactive
```

Keep `EXPO_PUBLIC_API_URL` in the EAS **preview** environment set to that same CMS URL for future deployments, but still pass it during export as shown above. Do not point the showcase app at `localhost`, a development database, or a production database.

## 4. Verify the public showcase

```sh
curl -I https://offmap-showcase--showcase.expo.app/
```

Then open the web URL in a browser and confirm:

1. The home page shows **23 opportunities**.
2. An opportunity detail page opens.
3. The CMS admin login works with the current private credentials.

The EAS dashboard lists the new deployment and alias:

<https://expo.dev/projects/401963e2-b1f0-464b-a097-07e0841b63d5/hosting/deployments>

## Showcase limits

This is not a production release. Render's free service can sleep after inactivity, so the first request may be slow. Its free database expires after 30 days and has no managed backups. Browser checks prove the deployed web flow; they do not replace native-device, store, backup-restore, or long-term reliability checks.
