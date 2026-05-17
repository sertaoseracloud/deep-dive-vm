import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * EC2 coming-soon page E2E tests.
 *
 * Covers SCAFF-01:
 *   - HTTP 200 on /deep-dive-ec2/
 *   - <h1> "Deep Dive EC2" visible
 *   - Badge "EM BREVE" visible
 *   - Back-link to hub (href="/")
 *   - Skip-link wiring to #conteudo-principal
 *   - axe-core WCAG 2.0 A/AA critical-violation smoke check
 *   - Mobile 375x812 no horizontal overflow
 *
 * Requires: npm run build && npm run preview (or Playwright's webServer auto-start).
 * baseURL is configured in playwright.config.ts as http://localhost:4321/
 * page.goto("./deep-dive-ec2/") navigates to the EC2 coming-soon page.
 */

test.describe("EC2 coming-soon load", () => {
  test("GET /deep-dive-ec2/ returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./deep-dive-ec2/");
    expect(response?.status()).toBe(200);
  });

  test("<h1> Deep Dive EC2 is visible", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Deep Dive EC2");
  });

  test("badge EM BREVE is visible", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    await expect(page.locator(".badge-coming-soon")).toBeVisible();
    await expect(page.locator(".badge-coming-soon")).toContainText("EM BREVE");
  });

  test("back link to hub is present and points to /", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    const backLink = page.locator("a.back-link");
    await expect(backLink).toBeVisible();
    const href = await backLink.getAttribute("href");
    expect(href).toBe("/");
  });
});

test.describe("EC2 coming-soon accessibility", () => {
  test("skip link has href='#conteudo-principal'", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toHaveAttribute("href", "#conteudo-principal");
  });

  test("no critical axe-core violations (WCAG 2.0 A/AA)", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
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

test.describe("EC2 coming-soon responsive", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-ec2/");
    await expect(page.locator("h1")).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
