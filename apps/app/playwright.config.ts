import { defineConfig, devices } from '@playwright/test';

const cmsUrl = process.env.E2E_CMS_URL || 'http://127.0.0.1:3001';
const appUrl = process.env.E2E_APP_URL || 'http://127.0.0.1:8081';

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: appUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command:
        'pnpm --dir ../cms build && exec env PORT=3001 HOSTNAME=127.0.0.1 pnpm --dir ../cms start',
      url: `${cmsUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `EXPO_PUBLIC_API_URL=${cmsUrl} pnpm web -- --port 8081`,
      url: appUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
