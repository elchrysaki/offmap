import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { testUser } from '../helpers/test-user'

test.describe('Admin Panel', () => {
  let page: Page
  const serverURL = process.env.E2E_CMS_URL || 'http://localhost:3001'

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
    page.on('console', (message) => {
      if (message.type() === 'error') console.error(`Admin console: ${message.text()}`)
    })
    page.on('pageerror', (error) => console.error(`Admin page error: ${error.message}`))
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.error(`Admin response: ${response.status()} ${response.url()}`)
      }
    })
    page.on('requestfailed', (request) => {
      console.error(`Admin request failed: ${request.url()} ${request.failure()?.errorText}`)
    })

    await login({ page, user: testUser })
  })

  test('can navigate to dashboard', async () => {
    await page.goto(`${serverURL}/admin`)
    await expect(page).toHaveURL(`${serverURL}/admin`)
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto(`${serverURL}/admin/collections/users`)
    await expect(page).toHaveURL(/\/admin\/collections\/users(?:\?|$)/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to submission create view', async () => {
    await page.goto(`${serverURL}/admin/collections/submissions`)
    await page.getByRole('link', { name: 'Create New', exact: false }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/submissions\/create(?:\?|$)/)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[name="sourceUrl"]')).toBeVisible({ timeout: 30_000 })
  })
})
