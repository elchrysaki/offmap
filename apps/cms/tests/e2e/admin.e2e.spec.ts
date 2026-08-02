import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { testUser } from '../helpers/test-user'

test.describe('Admin Panel', () => {
  let page: Page
  const serverURL = process.env.E2E_CMS_URL || 'http://localhost:3001'

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

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

  test('can open an opportunity edit view', async () => {
    await page.goto(`${serverURL}/admin/collections/opportunities`)
    const opportunityLink = page
      .locator('a[href^="/admin/collections/opportunities/"]:not([href$="/create"])')
      .first()
    await expect(opportunityLink).toBeVisible()
    await opportunityLink.click()
    await expect(page).toHaveURL(/\/admin\/collections\/opportunities\/[^/?]+(?:\?|$)/)
    await expect(page.locator('input[name="slug"]')).toBeVisible({ timeout: 30_000 })
  })
})
