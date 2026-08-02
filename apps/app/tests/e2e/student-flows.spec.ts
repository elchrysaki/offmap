import { expect, test } from '@playwright/test';

test.describe('student opportunity flows', () => {
  test('discovers, searches, saves, and opens reviewed details', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'YOUR MAP TO WHAT’S POSSIBLE' })).toBeVisible();
    await expect(page.getByText('23 opportunities', { exact: true })).toBeVisible();

    await page.getByRole('textbox', { name: 'Search opportunities' }).fill('NASA');
    await expect(page.getByText('4 opportunities', { exact: true })).toBeVisible();

    await page
      .getByRole('button', { name: 'Save Lucy Mission Asteroid Ambassador Program', exact: true })
      .click();
    await expect(
      page.getByRole('button', {
        name: 'Remove Lucy Mission Asteroid Ambassador Program from saved',
        exact: true,
      }),
    ).toBeVisible();

    await page.goto('/saved');
    await expect(page.getByRole('heading', { name: 'SAVED', exact: true })).toBeVisible();
    await expect(
      page.getByText('Lucy Mission Asteroid Ambassador Program', { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole('button', {
        name: 'Remove Lucy Mission Asteroid Ambassador Program from saved',
        exact: true,
      }),
    ).toBeVisible();

    await page.goto('/opportunities/lucy-mission-asteroid-ambassador-program');
    await expect(
      page.getByRole('heading', { name: 'Lucy Mission Asteroid Ambassador Program', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Open organizer page ↗', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('No direct application link is confirmed. The organizer page leaves OffMap.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sources and review', exact: true }),
    ).toBeVisible();
  });

  test('advances the bounded guest contribution form without publishing', async ({ page }) => {
    await page.goto('/submit');
    await expect(page.getByLabel('Step 1 of 2', { exact: true })).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Official source URL' })
      .fill('https://example.org/student-program');
    await page.getByRole('textbox', { name: 'Opportunity title' }).fill('Student program');
    await page.getByRole('button', { name: 'Next: a little context' }).click();

    await expect(page.getByLabel('Step 2 of 2', { exact: true })).toBeVisible();
    await expect(page.getByText('Not sure is a valid answer.', { exact: true })).toBeVisible();
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Send to human review' })).toBeVisible();
  });

  test('keeps the mobile web layout within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'YOUR MAP TO WHAT’S POSSIBLE' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  });
});
