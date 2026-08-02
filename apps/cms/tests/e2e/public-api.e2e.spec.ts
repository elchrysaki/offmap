import { expect, test } from '@playwright/test'

test('public facade exposes only the migrated published dataset', async ({ request }) => {
  const response = await request.get('/api/v1/opportunities?limit=50')
  expect(response.ok()).toBe(true)
  const body = await response.json()
  expect(body.pagination.totalItems).toBe(23)
  expect(body.items).toHaveLength(23)
  expect(body.items.every((item: { slug?: unknown }) => typeof item.slug === 'string')).toBe(true)
})

test('health endpoint reports database readiness without private data', async ({ request }) => {
  const response = await request.get('/health')
  expect(response.ok()).toBe(true)
  await expect(response.json()).resolves.toMatchObject({ status: 'ok', database: 'ready' })
})
