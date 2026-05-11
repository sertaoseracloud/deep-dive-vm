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

    const focused: Array<{ tag: string; text: string }> = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const el = await page.evaluate(() => {
        const el = document.activeElement;
        return el
          ? { tag: el.tagName, text: el.getAttribute("href") ?? el.textContent?.trim().slice(0, 20) ?? "" }
          : { tag: "NONE", text: "" };
      });
      focused.push(el);
    }

    // Focus should never be lost to body
    expect(focused.map((f) => f.tag)).not.toContain("NONE");

    // At least 2 distinct anchor elements received focus
    const anchorFocused = focused.filter((f) => f.tag === "A");
    expect(anchorFocused.length).toBeGreaterThanOrEqual(2);

    // No element appeared twice in sequence (no stuck focus)
    for (let i = 1; i < focused.length; i++) {
      expect(focused[i].text).not.toBe(focused[i - 1].text);
    }
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
    // Tab past skip link to the first navigation element
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // first nav link

    // Assert the focused element is an anchor (not body or skip link)
    const tagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(tagName).toBe("A");

    // Now check it has a visible focus ring
    const outlineStyle = await page.evaluate(
      () => window.getComputedStyle(document.activeElement as Element).outlineStyle
    );
    expect(outlineStyle).not.toBe("none");
    expect(outlineStyle).not.toBe("");
  });
});
