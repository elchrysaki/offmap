import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const baseURL = process.env.E2E_CMS_URL || 'http://localhost:3001'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      'pnpm build && pnpm prepare:standalone && exec env PORT=3001 HOSTNAME=127.0.0.1 node .next/standalone/apps/cms/server.js',
    reuseExistingServer: !process.env.CI,
    url: `${baseURL}/health`,
    timeout: 180_000,
  },
})
