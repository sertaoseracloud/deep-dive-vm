// tests/e2e/motion-accessibility.spec.ts
// E2E accessibility spec for motion effects phase.
//
// Prerequisites: the dev/preview server must be running at http://localhost:4321/
// Run with: npm run test:axe
// (which invokes: npx playwright test tests/e2e/motion-accessibility.spec.ts --project=chromium)

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ---------------------------------------------------------------------------
// Group 1: Axe WCAG 2.1 AA audit — runs unconditionally against the built page
// ---------------------------------------------------------------------------
test.describe("Axe accessibility audit after motion", () => {
  test("page has zero WCAG 2.1 AA violations", async ({ page }) => {
    await page.goto("./deep-dive-vm/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Group 2: Price card focus-visible outline (WCAG-02) — GAP-5
// Req: WCAG-02 — "Pricing Cards have focus-visible outline"
// ---------------------------------------------------------------------------
test.describe("Price card focus-visible accessibility (WCAG-02)", () => {
  test("price-cta button is focusable and receives focus via keyboard", async ({
    page,
  }) => {
    await page.goto("./deep-dive-vm/#investimento");

    const priceCta = page.locator(".price-cta").first();
    await expect(priceCta).toBeVisible();

    // Focus the button programmatically
    await priceCta.focus();

    const isFocused = await priceCta.evaluate(
      (el) => document.activeElement === el
    );
    expect(isFocused).toBe(true);
  });

  test("price-card ancestor has :focus-within when price-cta receives focus", async ({
    page,
  }) => {
    await page.goto("./deep-dive-vm/#investimento");

    const priceCta = page.locator(".price-cta").first();
    await expect(priceCta).toBeVisible();
    await priceCta.focus();

    const hasFocusWithin = await page.locator(".price-card").first().evaluate(
      (el) => el.matches(":focus-within")
    );
    expect(hasFocusWithin).toBe(true);
  });

  test("price-card has non-empty, non-none outline when price-cta is focused (WCAG-02)", async ({
    page,
  }) => {
    await page.goto("./deep-dive-vm/#investimento");

    const priceCta = page.locator(".price-cta").first();
    await expect(priceCta).toBeVisible();
    await priceCta.focus();

    const outline = await page.locator(".price-card").first().evaluate(
      (el) => window.getComputedStyle(el).outline
    );

    // outline must be set and not be "none" or empty string — WCAG focus indicator
    expect(outline).toBeTruthy();
    expect(outline).not.toBe("none");
    expect(outline).not.toBe("");
  });
});

// ---------------------------------------------------------------------------
// Group 3: Hamburger aria-expanded — complementary WCAG-01 consolidation (GAP-5)
// Duplicate of homepage.spec.ts test, kept here for motion-accessibility coverage.
// ---------------------------------------------------------------------------
test.describe("Hamburger aria-expanded — motion-accessibility consolidation (WCAG-01)", () => {
  test("hamburger aria-expanded toggles false → true → false on successive clicks", async ({
    page,
  }) => {
    // Hambúrguer só é visível no layout mobile.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-vm/");

    const hamburger = page.locator("#hamburger-btn");
    await expect(hamburger).toBeVisible();

    await expect(hamburger).toHaveAttribute("aria-expanded", "false");

    await hamburger.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");

    await hamburger.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  test("menu do celular: hambúrguer mostra os links, Esc fecha e devolve o foco", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-vm/");

    const hamburger = page.locator("#hamburger-btn");
    const ementa = page.locator("#nav-links").getByRole("link", { name: "Ementa" });
    await expect(hamburger).toHaveAttribute("aria-controls", "nav-links");
    await expect(ementa).toBeHidden();

    await hamburger.click();
    await expect(ementa).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(ementa).toBeHidden();
    await expect(hamburger).toBeFocused();
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");

    // Escolher um link fecha o menu.
    await hamburger.click();
    await ementa.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });
});

// ---------------------------------------------------------------------------
// Group 4: QUAL-02: reduced-motion compliance
// Gate: verifica que todas as animações v1.2 são desativadas com prefers-reduced-motion
// D-AUDIT-02: page.emulateMedia({ reducedMotion: 'reduce' }) ANTES de page.goto
// ---------------------------------------------------------------------------
test.describe("QUAL-02: reduced-motion compliance", () => {
  test("[data-reveal] com reduced-motion tem opacity:1 imediata (sem atraso de transição)", async ({
    page,
  }) => {
    // D-AUDIT-02: emulateMedia ANTES de page.goto — a ordem importa
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./deep-dive-vm/");

    // Verificar via getComputedStyle o primeiro [data-reveal] encontrado no DOM
    const result = await page.evaluate(() => {
      const el = document.querySelector("[data-reveal]");
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        opacity: style.opacity,
        transitionDuration: style.transitionDuration,
        transitionProperty: style.transitionProperty,
      };
    });

    // O elemento [data-reveal] deve existir na página
    expect(result).not.toBeNull();

    // Com reduced-motion: opacity deve ser "1" (não "0" — estado inicial sem animação)
    expect(result!.opacity).toBe("1");

    // Com reduced-motion: transition deve ser suprimida (duration 0s ou property none)
    // CSS: @media (prefers-reduced-motion: reduce) { [data-reveal] { transition: none } }
    const hasNoTransition =
      result!.transitionDuration === "0s" ||
      result!.transitionProperty === "none" ||
      result!.transitionProperty === "";
    expect(hasNoTransition).toBe(true);
  });

  test("[data-stagger] com reduced-motion tem animationName igual a 'none'", async ({
    page,
  }) => {
    // D-AUDIT-02: emulateMedia ANTES de page.goto
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./deep-dive-vm/");

    // Verificar animationName via getComputedStyle — NÃO usar .animation (inclui timing)
    const animationName = await page.evaluate(() => {
      const el = document.querySelector("[data-stagger]");
      if (!el) return null;
      // Pitfall documentado: verificar animationName, não animation shorthand
      return window.getComputedStyle(el).animationName;
    });

    // O elemento [data-stagger] deve existir na página
    expect(animationName).not.toBeNull();

    // Com reduced-motion: animation:none → animationName === "none"
    // CSS: @media (prefers-reduced-motion: reduce) { [data-stagger] { animation: none } }
    expect(animationName).toBe("none");
  });
});
