/**
 * capture-baselines.js — One-shot Playwright scraper for legacy baseline capture.
 *
 * Navigates to the live legacy landing page (single-page site), hides fixed/sticky
 * overlays and countdown timers, then captures a screenshot of each pilot section
 * element via page.locator(sectionId).screenshot(). Writes PNGs to
 * tests/baselines/legacy/<slug>.png.
 *
 * Usage:
 *   LEGACY_BASE_URL=https://example.com node src/scripts/capture-baselines.js
 *   node --env-file .env src/scripts/capture-baselines.js
 *
 * Prerequisites:
 *   1. Update tests/baselines/legacy/pilot-slugs.js with actual GSC top-5 sections.
 *   2. Confirm the sectionId values (#top, #investimento, etc.) exist on the legacy page.
 *   3. After running, commit tests/baselines/legacy/*.png to git.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PILOT_SECTIONS } from '../../tests/baselines/legacy/pilot-slugs.js';

// Cross-platform path resolution — fileURLToPath avoids leading slash on Windows
const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');
const BASELINES_DIR = path.join(ROOT, 'tests', 'baselines', 'legacy');

// ── Validate LEGACY_BASE_URL ──────────────────────────────────────────────────

const LEGACY_BASE_URL = process.env.LEGACY_BASE_URL;

if (!LEGACY_BASE_URL) {
  console.error('Error: LEGACY_BASE_URL environment variable is required.');
  console.error('');
  console.error('  Usage:');
  console.error('    LEGACY_BASE_URL=https://example.com node src/scripts/capture-baselines.js');
  console.error('    node --env-file .env src/scripts/capture-baselines.js');
  console.error('');
  console.error('  The value must be the production URL of the legacy landing page.');
  process.exit(1);
}

// Validate URL syntax (T-02-01 mitigation — reject invalid/non-http(s) schemes)
let parsedUrl;
try {
  parsedUrl = new URL(LEGACY_BASE_URL);
} catch {
  console.error('Error: LEGACY_BASE_URL is not a valid URL: ' + LEGACY_BASE_URL);
  process.exit(1);
}

if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
  console.error('Error: LEGACY_BASE_URL must use http or https scheme. Got: ' + parsedUrl.protocol);
  process.exit(1);
}

// Ensure output directory exists
fs.mkdirSync(BASELINES_DIR, { recursive: true });

// Normalise URL — append trailing slash if missing
const legacyUrl = LEGACY_BASE_URL.replace(/\/$/, '') + '/';

console.log('Capturing legacy baseline screenshots...');
console.log('  Source URL: ' + legacyUrl);
console.log('  Output dir: ' + BASELINES_DIR);
console.log('  Sections:   ' + PILOT_SECTIONS.map(p => p.slug).join(', '));
console.log('');

// ── Launch browser ────────────────────────────────────────────────────────────

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});

try {
  const page = await context.newPage();

  // Navigate once — single-page site; all sections on the root URL
  console.log('Navigating to: ' + legacyUrl);
  await page.goto(legacyUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // ── Hide fixed/sticky overlays and countdown timers ───────────────────────
  // Hides cookie banners, consent popups, modals, and countdown elements that
  // would appear on top of section content and corrupt the screenshot.
  await page.evaluate(() => {
    const overlaySelectors = [
      '[class*="cookie"]', '[id*="cookie"]',
      '[class*="consent"]', '[id*="consent"]',
      '[class*="gdpr"]',   '[id*="gdpr"]',
      '[class*="popup"]',  '[id*="popup"]',
      '[class*="modal"]',  '[id*="modal"]',
      '[class*="banner"]', '[id*="banner"]',
      '[class*="overlay"]', '[id*="overlay"]',
    ];
    for (const sel of overlaySelectors) {
      document.querySelectorAll(sel).forEach(el => {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
          el.style.display = 'none';
        }
      });
    }
    // Hide countdown timers (visibility:hidden keeps layout stable)
    document.querySelectorAll('[class*="countdown"]').forEach(el => {
      el.style.visibility = 'hidden';
    });
  });

  // Wait for layout to settle after overlay removal
  await page.waitForTimeout(300);

  // ── Capture each pilot section ────────────────────────────────────────────
  for (const { slug, sectionId } of PILOT_SECTIONS) {
    const outPath = path.join(BASELINES_DIR, slug + '.png');
    try {
      const section = page.locator(sectionId);
      await section.waitFor({ state: 'visible', timeout: 5000 });
      await section.screenshot({ path: outPath });
      console.log('  Saved: tests/baselines/legacy/' + slug + '.png');
    } catch (err) {
      console.warn('  SKIP ' + slug + ' (' + sectionId + '): ' + err.message);
    }
  }
} finally {
  await browser.close();
}

console.log('');
console.log('Baseline capture complete. Commit tests/baselines/legacy/*.png to git.');
console.log('  git add tests/baselines/legacy/*.png');
console.log('  git commit -m "chore(phase-2): commit legacy baseline PNGs for pilot sections"');
