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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PILOT_SECTIONS } from './baselines/legacy/pilot-slugs.js';

// Cross-platform path resolution — fileURLToPath avoids leading slash on Windows
// (new URL('.', import.meta.url).pathname returns '/C:/...' on Windows)
const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const LEGACY_DIR = path.join(ROOT, 'tests', 'baselines', 'legacy');

const MAX_DIFF_RATIO = 0.001; // 0.1% — locked threshold from Phase 1

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

// ── Pilot sections: compare against legacy baselines via pixelmatch ───────────
// For each pilot section, capture the section element screenshot from the generated
// page and compare pixel-by-pixel against the pre-captured legacy PNG.
// Baselines must be committed at tests/baselines/legacy/<slug>.png before running.
// Run the scraper first: LEGACY_BASE_URL=<url> node src/scripts/capture-baselines.js

for (const { slug, sectionId } of PILOT_SECTIONS) {
  test(`visual diff (legacy baseline) — ${slug}`, async ({ page }) => {
    // 1. Navigate to the generated page (single-page site — all sections on home)
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    // 2. Capture screenshot of the specific section element (not fullPage)
    const section = page.locator(sectionId);
    await expect(section).toBeVisible({ timeout: 5000 });
    const actualBuffer = await section.screenshot();

    // 3. Load legacy baseline PNG — throws a clear error if missing (not a vague crash)
    const baselinePath = path.join(LEGACY_DIR, slug + '.png');
    if (!fs.existsSync(baselinePath)) {
      throw new Error(
        'Legacy baseline missing: ' + baselinePath + '\n' +
        'Run: LEGACY_BASE_URL=<url> node src/scripts/capture-baselines.js\n' +
        'Then commit tests/baselines/legacy/*.png before running tests.',
      );
    }
    const baselineBuffer = fs.readFileSync(baselinePath);

    // 4. Decode both buffers with pngjs
    const actual = PNG.sync.read(actualBuffer);
    const baseline = PNG.sync.read(baselineBuffer);

    // 5. Assert matching dimensions before calling pixelmatch (Pitfall 1 — crash prevention)
    expect(actual.width, `${slug}: width mismatch (actual ${actual.width} vs baseline ${baseline.width})`).toBe(baseline.width);
    expect(actual.height, `${slug}: height mismatch (actual ${actual.height} vs baseline ${baseline.height})`).toBe(baseline.height);

    // 6. Run pixelmatch
    const diff = new PNG({ width: actual.width, height: actual.height });
    const numDiffPixels = pixelmatch(
      actual.data, baseline.data, diff.data,
      actual.width, actual.height,
      { threshold: 0.1 }, // color tolerance in [0,1]
    );

    const totalPixels = actual.width * actual.height;
    const diffRatio = numDiffPixels / totalPixels;

    // 7. Save diff image on failure for debugging
    if (diffRatio > MAX_DIFF_RATIO) {
      const diffOutPath = path.join(ROOT, 'test-results', 'diff-' + slug + '.png');
      fs.mkdirSync(path.dirname(diffOutPath), { recursive: true });
      fs.writeFileSync(diffOutPath, PNG.sync.write(diff));
      console.error('Diff image saved to: ' + diffOutPath);
    }

    // 8. Assert within threshold
    expect(diffRatio, `${slug}: pixel diff ${(diffRatio * 100).toFixed(3)}% exceeds 0.1% threshold`).toBeLessThanOrEqual(MAX_DIFF_RATIO);
  });
}
