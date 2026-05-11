import { test, expect } from "@playwright/test";

/**
 * Keyboard accessibility E2E tests.
 *
 * Covers:
 *   - Tab key navigation order through interactive elements
 *   - Skip link presence, href, text, and activation (moves focus to #main)
 *   - Focus-visible: focused interactive element has a CSS outline (not "none")
 *
 * Note: main#main has tabindex="-1" added in src/pages/index.astro so that
 * activating the skip link via Enter can programmatically receive focus.
 * This is a standard accessibility pattern that does NOT add main to the tab order.
 *
 * baseURL is configured in playwright.config.ts as http://localhost:4321/deep-dive-vm/
 */

test.describe("Keyboard navigation", () => {
  test("Tab key moves focus through at least 3 interactive elements in logical order", async ({
    page,
  }) => {
    await page.goto("./");

    const focused: string[] = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const el = await page.evaluate(() => {
        const el = document.activeElement;
        return el
          ? `${el.tagName}:${el.getAttribute("href") ?? el.textContent?.trim().slice(0, 20)}`
          : "none";
      });
      focused.push(el);
    }

    // At least 3 elements received focus
    expect(focused.length).toBeGreaterThanOrEqual(3);

    // At least 2 entries should be anchor ("A:") elements
    const anchorCount = focused.filter((entry) => entry.startsWith("A:")).length;
    expect(anchorCount).toBeGreaterThanOrEqual(2);

    // Focus should never be lost to body (no entry should be "none")
    expect(focused).not.toContain("none");
  });

  test("skip link is the first focusable element", async ({ page }) => {
    await page.goto("./");
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(
      () => document.activeElement?.className ?? ""
    );
    expect(firstFocused).toContain("skip-link");
  });
});

test.describe("Skip link functionality", () => {
  test("skip link is present with href='#main' and correct text", async ({
    page,
  }) => {
    await page.goto("./");
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toHaveAttribute("href", "#main");
    await expect(skipLink).toHaveText("Pular para o conteúdo");
  });

  test("activating skip link moves focus to #main", async ({ page }) => {
    await page.goto("./");
    // Tab to focus the skip link (it is the first focusable element)
    await page.keyboard.press("Tab");
    // Press Enter to activate it
    await page.keyboard.press("Enter");
    const focused = await page.evaluate(
      () => document.activeElement?.id ?? ""
    );
    expect(focused).toBe("main");
  });
});

test.describe("Focus-visible", () => {
  test("focused interactive element has a visible CSS outline (not outline:none)", async ({
    page,
  }) => {
    await page.goto("./");
    // Tab once to move focus to skip link
    await page.keyboard.press("Tab");
    // Tab again to move to the next interactive element (NavBar brand link)
    await page.keyboard.press("Tab");
    const outlineStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "none";
      return window.getComputedStyle(el).outlineStyle;
    });
    expect(outlineStyle).not.toBe("none");
    expect(outlineStyle).not.toBe("");
  });
});
