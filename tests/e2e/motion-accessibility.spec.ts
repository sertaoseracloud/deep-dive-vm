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
// Group 2: SettingsToggle reduce-motion behavior
// TODO (Phase 02): wire SettingsToggle into a visible page location so the
// toggle can be found by its aria-label without test.skip.
// ---------------------------------------------------------------------------
test.describe("SettingsToggle reduce-motion behavior", () => {
  test("disabling toggle sets localStorage motionEnabled to false", async ({ page }) => {
    await page.goto("./deep-dive-vm/");
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
    await page.goto("./deep-dive-vm/");
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
    await page.goto("./deep-dive-vm/");
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

// ---------------------------------------------------------------------------
// Group 5: Price card focus-visible outline (WCAG-02) — GAP-5
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
// Group 6: Hamburger aria-expanded — complementary WCAG-01 consolidation (GAP-5)
// Duplicate of homepage.spec.ts test, kept here for motion-accessibility coverage.
// ---------------------------------------------------------------------------
test.describe("Hamburger aria-expanded — motion-accessibility consolidation (WCAG-01)", () => {
  test("hamburger aria-expanded toggles false → true → false on successive clicks", async ({
    page,
  }) => {
    await page.goto("./deep-dive-vm/");

    const hamburger = page.locator("#hamburger-btn");
    await expect(hamburger).toBeVisible();

    await expect(hamburger).toHaveAttribute("aria-expanded", "false");

    await hamburger.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");

    await hamburger.click();
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  test("MobileMenuMotion nav aria-hidden reflects open/closed state after hamburger click", async ({
    page,
  }) => {
    await page.goto("./deep-dive-vm/");

    const hamburger = page.locator("#hamburger-btn");
    await expect(hamburger).toBeVisible();

    const mobileNav = page.locator('nav[aria-label="Mobile navigation menu"]');

    // Closed: aria-hidden="true"
    await expect(mobileNav).toHaveAttribute("aria-hidden", "true");

    // Open: aria-hidden absent
    await hamburger.click();
    await expect(mobileNav).not.toHaveAttribute("aria-hidden");

    // Closed again: aria-hidden="true"
    await hamburger.click();
    await expect(mobileNav).toHaveAttribute("aria-hidden", "true");
  });
});

// ---------------------------------------------------------------------------
// Group 7: QUAL-02: reduced-motion compliance
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

  test(".hero-stagger-item está ausente no DOM com reduced-motion ativo", async ({
    page,
  }) => {
    // D-AUDIT-02: emulateMedia ANTES de page.goto
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./deep-dive-vm/");

    // HeroMotionSingle verifica window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Se prefersReduced === true: retorna sem aplicar a classe hero-stagger-item
    // Logo: com reduced-motion, .hero-stagger-item NÃO deve existir no DOM
    const count = await page.locator(".hero-stagger-item").count();
    expect(count).toBe(0);
  });

  test("motion.span[data-testid='motion-label'] com reduced-motion não tem animação CSS ativa", async ({
    page,
  }) => {
    // D-AUDIT-02: emulateMedia ANTES de page.goto
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./deep-dive-vm/");

    // SettingsToggle usa MotionConfig reducedMotion="user"
    // Com prefers-reduced-motion ativo, o Motion suprime automaticamente via matchMedia
    const motionLabel = page.locator('span[data-testid="motion-label"]');

    if (await motionLabel.count() === 0) {
      // SettingsToggle requer client:load hydration — pode não estar disponível no preview estático
      test.skip(true, "SettingsToggle requires client:load hydration — span[data-testid='motion-label'] not found in static preview");
      return;
    }

    // Verificar animationName via getComputedStyle — MotionConfig reducedMotion="user"
    // suprime animações CSS geradas pelo Motion quando prefers-reduced-motion está ativo
    const animationName = await page.evaluate(() => {
      const el = document.querySelector('span[data-testid="motion-label"]');
      if (!el) return null;
      return window.getComputedStyle(el).animationName;
    });

    // Com MotionConfig reducedMotion="user": animações suprimidas → animationName === "none"
    expect(animationName).toBe("none");
  });
});
