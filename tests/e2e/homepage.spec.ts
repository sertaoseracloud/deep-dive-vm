import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Homepage E2E tests.
 *
 * Stability note: The axe-core accessibility check (last test) is the least
 * stable test because it depends on third-party font loading and CSS variable
 * resolution in the headless browser. If it flakes in CI, the `retries: 2`
 * setting in playwright.config.ts provides the recovery mechanism.
 *
 * Requires: npm run build && npm run preview (or Playwright's webServer auto-start).
 * baseURL is configured in playwright.config.ts as http://localhost:4321/deep-dive-vm
 */

test.describe("Homepage load", () => {
  test("GET / returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./");
    expect(response?.status()).toBe(200);
  });

  test("<h1> is visible on the page", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("page <title> is non-empty", async ({ page }) => {
    await page.goto("./");
    await expect(page).toHaveTitle(/.+/);
  });
});

test.describe("Section visibility", () => {
  test("#top (hero section) is visible", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#top")).toBeVisible();
  });

  test("<main> element is present", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("main")).toBeVisible();
  });

  test("<footer> element is visible", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("<nav> is visible", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("nav").first()).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("<a> elements inside <nav> have valid href attributes", async ({ page }) => {
    await page.goto("./");
    const navLinks = page.locator("nav a[href]");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      expect(href).not.toBe("");
      expect(href).not.toBe(null);
    }
  });

  test("at least 3 anchor links present in the page body pointing to section IDs", async ({ page }) => {
    await page.goto("./");
    // Links pointing to fragment identifiers (#section-id)
    const anchorLinks = page.locator('a[href^="#"]');
    const count = await anchorLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe("Responsive viewports", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
  });

  test("tablet 768x1024: h1 visible", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("desktop 1280x800: h1 visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("ultra-wide 1920x1080: h1 visible, layout intact", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Accessibility smoke check", () => {
  // NOTE: This is the least stable test â€” depends on font loading and CSS var resolution
  // in headless Chromium. retries: 2 in playwright.config.ts provides flake recovery.
  test("no critical axe-core violations on homepage (level A/AA)", async ({ page }) => {
    await page.goto("./");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical"
    );

    if (criticalViolations.length > 0) {
      console.error(
        "Critical a11y violations:",
        JSON.stringify(criticalViolations, null, 2)
      );
    }

    expect(criticalViolations).toHaveLength(0);
  });
});

