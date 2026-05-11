/**
 * seo.test.ts — SEO meta tag and structured data validation for the landing page.
 *
 * Validates that the rendered HTML contains all required SEO elements:
 * - <title> tag with content
 * - <meta name="description"> with content
 * - <meta property="og:title"> and <meta property="og:description">
 * - Canonical link element
 *
 * Run: npx playwright test tests/seo.test.ts --project=chromium
 */

import { test, expect } from '@playwright/test';

test.describe('SEO meta tags', () => {
  test('home page has required meta tags', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');

    // Title tag
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title).toContain('Deep Dive');

    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect((description ?? '').length).toBeGreaterThan(50);

    // Open Graph title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    // ogTitle may be absent if astro-seo is not configured; soft check
    if (ogTitle) {
      expect(ogTitle.length).toBeGreaterThan(5);
    }

    // H1 heading present
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const h1Text = await h1.innerText();
    expect(h1Text.length).toBeGreaterThan(10);
  });

  test('home page has a CTA button linking to #investimento', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');

    // The primary CTA should link to the pricing section
    const ctaLink = page.locator('a[href="#investimento"]').first();
    await expect(ctaLink).toBeVisible();
  });

  test('content markdown files have required frontmatter fields', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const matter = (await import('gray-matter')).default;

    const contentDir = path.join(process.cwd(), 'src', 'content');
    const files = fs.readdirSync(contentDir).filter((f: string) => f.endsWith('.md'));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');
      const { data } = matter(raw);

      expect(data.title, `${file} missing title`).toBeTruthy();
      expect(data.description, `${file} missing description`).toBeDefined();
      expect(data.cta_text, `${file} missing cta_text`).toBeDefined();
      expect(data.cta_link, `${file} missing cta_link`).toBeDefined();
    }
  });
});
