import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { testUser } from '../helpers/test-user'

test.describe('Admin Panel', () => {
  let page: Page
  const serverURL = process.env.E2E_CMS_URL || 'http://127.0.0.1:3001'

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
    await expect(page).toHaveURL(`${serverURL}/admin/collections/users`)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto(`${serverURL}/admin/collections/opportunities/create`)
    await expect(page).toHaveURL(`${serverURL}/admin/collections/opportunities/create`)
    const editViewArtifact = page.locator('input[name="slug"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
