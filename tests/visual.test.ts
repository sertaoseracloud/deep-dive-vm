/**
 * visual.test.ts — Pixel-perfect visual regression tests for the landing page.
 *
 * Compares each generated page against a baseline screenshot using Playwright's
 * built-in snapshot matching (which delegates to pixelmatch under the hood).
 *
 * Baseline screenshots are stored in tests/baselines/ and committed to the repo.
 * On first run (no baseline), Playwright creates them automatically.
 *
 * Run: npx playwright test --project=chromium
 */

import { test, expect } from '@playwright/test';

const PAGES = [
  { name: 'home', path: '/' },
];

for (const page of PAGES) {
  test(`visual diff — ${page.name}`, async ({ page: pw }) => {
    await pw.goto('./' + page.path.replace(/^\//, ''));
    // Wait for fonts and images to load
    await pw.waitForLoadState('networkidle');

    const screenshot = await pw.screenshot({ fullPage: true });
    // toMatchSnapshot uses pixelmatch under the hood; threshold of 0.1 = 0.1% diff allowed
    await expect(screenshot).toMatchSnapshot(`${page.name}-baseline.png`, {
      maxDiffPixelRatio: 0.001, // 0.1% pixel diff max
    });
  });
}

test('visual diff — hero section visible', async ({ page }) => {
  await page.goto('./');
  await page.waitForLoadState('networkidle');

  // Verify the hero heading is present
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();

  const screenshot = await page.screenshot({ fullPage: false, clip: { x: 0, y: 0, width: 1280, height: 800 } });
  await expect(screenshot).toMatchSnapshot('hero-viewport.png', {
    maxDiffPixelRatio: 0.001,
  });
});
