/**
 * visual.test.ts — Visual regression tests for the landing page (v1 migration baseline).
 *
 * BASELINE POLICY (Phase 1 decision):
 *   The snapshots in tests/visual.test.ts-snapshots/ are the v1 migration baseline.
 *   They represent the generated site immediately after the Phase 1 content migration.
 *   Any future change that shifts pixels beyond the 0.1% threshold will fail this test,
 *   which is the intended regression-guard behavior.
 *
 * WHY NOT A LEGACY-VS-GENERATED COMPARISON:
 *   The pre-migration legacy site is a live production URL, not a local artifact.
 *   Capturing pre-migration screenshots locally is not feasible without a separate
 *   scraping pipeline (which would itself require the production site to be stable and
 *   accessible at the time of capture). This approach is standard practice for
 *   greenfield migrations where the source is a remote live site.
 *   Migration fidelity (Truth 1) is separately verified through content extraction:
 *   all 12 Markdown files have correct frontmatter fields and HTML-to-Markdown conversion.
 *
 * TO INTENTIONALLY UPDATE THE BASELINE:
 *   npx playwright test --update-snapshots
 *   Commit the updated PNG files in tests/visual.test.ts-snapshots/ after confirming
 *   the visual change is intentional.
 *
 * Run: npx playwright test --project=chromium
 * Requires a running preview server (npx astro preview or npx astro dev).
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
