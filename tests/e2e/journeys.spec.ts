import { test, expect } from "@playwright/test";

/**
 * Critical user journey E2E tests.
 *
 * Covers:
 *   - CTA button hrefs (Hero primary/ghost, NavBar CTA)
 *   - Anchor scrolling to each major section ID
 *   - Sticky CTA DOM presence and mobile-viewport visibility
 *
 * baseURL is configured in playwright.config.ts as http://localhost:4321/deep-dive-vm/
 * All page.goto("./") calls resolve to that base URL.
 */

test.describe("CTA buttons", () => {
  test("Hero primary CTA has href pointing to #investimento", async ({ page }) => {
    await page.goto("./");
    const primaryCta = page.locator("header#top a.btn.primary.massive");
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveAttribute("href", "#investimento");
  });

  test("Hero ghost CTA has href pointing to #ementa", async ({ page }) => {
    await page.goto("./");
    const ghostCta = page.locator("header#top a.btn.ghost");
    await expect(ghostCta).toBeVisible();
    await expect(ghostCta).toHaveAttribute("href", "#ementa");
  });

  test("NavBar CTA has href pointing to #investimento", async ({ page }) => {
    await page.goto("./");
    const navCta = page.locator("a.btn.nav-cta");
    await expect(navCta).toBeVisible();
    await expect(navCta).toHaveAttribute("href", "#investimento");
  });
});

test.describe("Anchor scrolling", () => {
  test("#top (hero section) is visible immediately on load", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#top")).toBeVisible();
  });

  test("#metodo section scrolls into viewport", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
      document.querySelector("#metodo")?.scrollIntoView()
    );
    await expect(page.locator("#metodo")).toBeInViewport();
  });

  test("#ementa section scrolls into viewport", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
      document.querySelector("#ementa")?.scrollIntoView()
    );
    await expect(page.locator("#ementa")).toBeInViewport();
  });

  test("#mentor section scrolls into viewport", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
      document.querySelector("#mentor")?.scrollIntoView()
    );
    await expect(page.locator("#mentor")).toBeInViewport();
  });

  test("#investimento section scrolls into viewport", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
      document.querySelector("#investimento")?.scrollIntoView()
    );
    await expect(page.locator("#investimento")).toBeInViewport();
  });

  test("#faq section scrolls into viewport", async ({ page }) => {
    await page.goto("./");
    await page.evaluate(() =>
      document.querySelector("#faq")?.scrollIntoView()
    );
    await expect(page.locator("#faq")).toBeInViewport();
  });
});

test.describe("Sticky CTA", () => {
  test("sticky CTA is present in DOM and contains href to #investimento", async ({ page }) => {
    await page.goto("./");
    const stickyCta = page.locator("div.sticky-cta");
    await expect(stickyCta).toBeAttached();
    const link = stickyCta.locator("a[href]");
    await expect(link).toHaveAttribute("href", "#investimento");
  });

  test("sticky CTA is visible on mobile viewport (375px wide)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./");
    await page.evaluate(() => window.scrollBy(0, 500));
    await expect(page.locator("div.sticky-cta")).toBeVisible();
  });
});
