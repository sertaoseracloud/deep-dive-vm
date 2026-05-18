import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Hub page E2E tests.
 *
 * Covers HUB-01 through HUB-04:
 *   HUB-01: Mentor identity section (h1 visible, responsive viewport)
 *   HUB-02: Course cards (active + coming-soon structure)
 *   HUB-03: Social icon links (4 networks, aria-label per link)
 *   HUB-04: Open Graph hub-og.png (verified via Layout.test.ts and seo-meta.test.ts)
 *
 * Additionally covers:
 *   - Skip-link wiring to #conteudo-principal
 *   - axe-core WCAG 2.0 A/AA critical-violation smoke check
 *
 * Requires: npm run build && npm run preview (or Playwright's webServer auto-start).
 * baseURL is configured in playwright.config.ts as http://localhost:4321/
 * page.goto("./") navigates to the hub root.
 */

test.describe("Hub load", () => {
  test("GET / returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./");
    expect(response?.status()).toBe(200);
  });

  test("<h1> is visible on the page", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("3 social icon links are present and each has a non-empty aria-label", async ({ page }) => {
    await page.goto("./");
    const socialLinks = page.locator(".social-icon-link");
    await expect(socialLinks).toHaveCount(3); // WhatsApp disabled until real number configured
    for (let i = 0; i < 3; i++) {
      const label = await socialLinks.nth(i).getAttribute("aria-label");
      expect(label).toBeTruthy();
    }
  });

  test("3 course cards are present", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".course-card")).toHaveCount(3);
  });

  test("active course card is visible", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".course-card.active").first()).toBeVisible();
  });

  test("coming-soon course card is visible", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".course-card.coming-soon")).toBeVisible();
  });

  test("coming-soon course card has no clickable course-link", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator(".course-card.coming-soon .course-link")).toHaveCount(0);
  });

  test("mentor photo img.mentor-photo is visible on the page", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("img.mentor-photo")).toBeVisible();
  });

  test(".bio is visible and contains expected tagline text", async ({ page }) => {
    await page.goto("./");
    const bio = page.locator(".bio");
    await expect(bio).toBeVisible();
    await expect(bio).toContainText("Systems Architect · 2× MVP Microsoft · Docker Captain");
  });

  test("active course card link href contains /deep-dive-vm/", async ({ page }) => {
    await page.goto("./");
    const courseLink = page.locator(".course-card.active .course-link").first();
    await expect(courseLink).toBeVisible();
    const href = await courseLink.getAttribute("href");
    expect(href).toContain("/deep-dive-vm/");
  });

  test("Python active course card link href contains /deep-dive-python-neurodivergentes/", async ({ page }) => {
    await page.goto("./");
    const courseLinks = page.locator(".course-card.active .course-link");
    await expect(courseLinks).toHaveCount(2); // VM + Python ambos active
    const hrefs = await courseLinks.evaluateAll(links => links.map(l => l.getAttribute("href")));
    expect(hrefs.some(h => h?.includes("/deep-dive-python-neurodivergentes/"))).toBe(true);
  });

  test("all active social icon links have rel containing noopener", async ({ page }) => {
    await page.goto("./");
    const socialLinks = page.locator(".social-icon-link");
    await expect(socialLinks).toHaveCount(3); // WhatsApp disabled until real number configured
    for (let i = 0; i < 3; i++) {
      const rel = await socialLinks.nth(i).getAttribute("rel");
      expect(rel).toContain("noopener");
    }
  });
});

test.describe("Hub accessibility", () => {
  test("skip link has href='#conteudo-principal' and correct text", async ({ page }) => {
    await page.goto("./");
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toHaveAttribute("href", "#conteudo-principal");
    await expect(skipLink).toHaveText("Pular para o conteúdo");
  });

  test("no critical axe-core violations on hub (WCAG 2.0 A/AA)", async ({ page }) => {
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

test.describe("Hub responsive", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
