import { expect, test } from '@playwright/test';

test.describe('student opportunity flows', () => {
  test('discovers, searches, saves, and opens reviewed details', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'your map to what’s possible' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'saved.', exact: true })).toBeVisible();
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
    for (const path of [
      '/',
      '/opportunities',
      '/submit',
      '/opportunities/lucy-mission-asteroid-ambassador-program',
    ]) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(dimensions.document, `${path} should not overflow`).toBeLessThanOrEqual(
        dimensions.viewport,
      );
    }
  });

  test('exposes hover, focus, and selected states without relying on color alone', async ({
    page,
  }) => {
    await page.goto('/');
    const primary = page.getByRole('button', { name: 'Explore opportunities' });
    const restingShadow = await primary.evaluate((element) => getComputedStyle(element).boxShadow);

    await primary.hover();
    await expect(primary).not.toHaveCSS('box-shadow', restingShadow);
    await primary.focus();
    await expect(primary).toHaveCSS('border-color', 'rgb(18, 104, 255)');

    await page.goto('/opportunities');
    await expect(page.getByRole('button', { name: /All categories/ })).toContainText('✓');
    const events = page.getByRole('button', { name: /Events/ });
    await events.click();
    await expect(events).toContainText('✓');
  });
});
