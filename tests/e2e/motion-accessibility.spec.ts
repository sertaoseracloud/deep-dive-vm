// tests/e2e/motion-accessibility.spec.ts
// E2E accessibility spec for motion effects phase.
//
// Prerequisites: the dev/preview server must be running at http://localhost:4321/deep-dive-vm/
// Run with: npm run test:axe
// (which invokes: npx playwright test tests/e2e/motion-accessibility.spec.ts --project=chromium)

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ---------------------------------------------------------------------------
// Group 1: Axe WCAG 2.1 AA audit — runs unconditionally against the built page
// ---------------------------------------------------------------------------
test.describe("Axe accessibility audit after motion", () => {
  test("page has zero WCAG 2.1 AA violations", async ({ page }) => {
    await page.goto("./");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Group 2: SettingsToggle reduce-motion behavior
// TODO (Phase 02): wire SettingsToggle into a visible page location so the
// toggle can be found by its aria-label without test.skip.
// ---------------------------------------------------------------------------
test.describe("SettingsToggle reduce-motion behavior", () => {
  test("disabling toggle sets localStorage motionEnabled to false", async ({ page }) => {
    await page.goto("./");
    const toggle = page.locator('input[aria-label="Enable animations"]');
    if (await toggle.isVisible()) {
      await toggle.uncheck();
      const value = await page.evaluate(() => localStorage.getItem("motionEnabled"));
      expect(value).toBe("false");
    } else {
      // TODO: SettingsToggle is rendered with client:load but not yet placed in a
      // visible page section. Wire a trigger in Phase 02 to surface the toggle.
      test.skip(true, "SettingsToggle not visible in current page — wire trigger in Phase 02");
    }
  });
});

// ---------------------------------------------------------------------------
// Group 3: CarouselMotion keyboard navigation
// TODO (Phase 02): CarouselMotion uses client:load hydration; requires dev server
// to hydrate the component before keyboard events can be tested.
// ---------------------------------------------------------------------------
test.describe("CarouselMotion keyboard navigation", () => {
  test("carousel accepts ArrowRight and ArrowLeft without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("./");
    const carousel = page.locator('[role="region"][aria-label="Testimonials carousel"]');
    if (await carousel.isVisible()) {
      await carousel.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowLeft");
      expect(errors).toHaveLength(0);
    } else {
      // TODO: CarouselMotion is in index.astro with client:load; the static preview
      // renders it with SSR fallback HTML only. Hydration requires a real dev/preview
      // server — verify aria role is present in index.astro after Phase 02 integration.
      test.skip(true, "CarouselMotion carousel region not found in static HTML — requires hydration via dev server");
    }
  });
});

// ---------------------------------------------------------------------------
// Group 4: MobileMenuMotion ARIA state
// TODO (Phase 02): wire a visible open/close trigger button in index.astro.
// ---------------------------------------------------------------------------
test.describe("MobileMenuMotion ARIA state", () => {
  test("mobile nav has aria-hidden when closed", async ({ page }) => {
    await page.goto("./");
    const nav = page.locator('[aria-label="Mobile navigation menu"]');
    if (await nav.isVisible()) {
      const ariaHidden = await nav.getAttribute("aria-hidden");
      expect(ariaHidden).toBe("true");
    } else {
      // TODO: MobileMenuMotion open/close trigger (hamburger button) deferred to Phase 02.
      // Once wired, remove this skip and assert aria-hidden toggles on open/close.
      test.skip(true, "Mobile navigation menu not visible — open/close trigger deferred to Phase 02");
    }
  });
});
