import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Python LP load", () => {
  test("GET /deep-dive-python-neurodivergentes/ returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./deep-dive-python-neurodivergentes/");
    expect(response?.status()).toBe(200);
  });

  test("<h1> is visible and contains Python copy", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Python");
  });

  test("primary CTA links to #investimento", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    const cta = page.locator('[data-testid="hero-cta-primary"]');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toContain("#investimento");
  });

  test("ghost CTA links to #ementa", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    const cta = page.locator('[data-testid="hero-cta-ghost"]');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toContain("#ementa");
  });

  test("#investimento section is present", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("#investimento")).toBeAttached();
  });

  test("#ementa section is present", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("#ementa")).toBeAttached();
  });

  test("sticky CTA is present in DOM", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator('[data-testid="sticky-cta"]')).toBeAttached();
  });
});

test.describe("Python LP accessibility", () => {
  test("skip link has href='#main'", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#main");
  });

  test("no critical axe-core violations (WCAG 2.0 A/AA)", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const criticalViolations = results.violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });
});

test.describe("Python LP responsive", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("h1")).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });
});
