import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Hub page E2E tests.
 *
 * Covers HUB-01 through HUB-04:
 *   HUB-01: Mentor identity section (h1 visible, responsive viewport)
 *   HUB-02: Course cards (PHP, Terraform and Python playgrounds, external links)
 *   HUB-05: Carrossel acessível com os banners dos cursos
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

  test("course links point to the PHP, Terraform and Python playgrounds", async ({ page }) => {
    await page.goto("./");
    const courseLinks = page.locator(".course-card.active .course-link");
    await expect(courseLinks).toHaveCount(3); // PHP, Terraform e Python, todos active
    const hrefs = await courseLinks.evaluateAll(links => links.map(l => l.getAttribute("href")));
    expect(hrefs).toEqual([
      "https://sertaoseracloud.github.io/php-playground/",
      "https://sertaoseracloud.github.io/terraform-playground/",
      "https://sertaoseracloud.github.io/python-playground/",
    ]);
  });

  test("external course links open in a new tab with noopener noreferrer", async ({ page }) => {
    await page.goto("./");
    const courseLinks = page.locator(".course-card.active .course-link");
    for (let i = 0; i < 3; i++) {
      await expect(courseLinks.nth(i)).toHaveAttribute("target", "_blank");
      await expect(courseLinks.nth(i)).toHaveAttribute("rel", "noopener noreferrer");
    }
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

test.describe("Hub carrossel", () => {
  const SITES = [
    "https://sertaoseracloud.github.io/php-playground/",
    "https://sertaoseracloud.github.io/terraform-playground/",
    "https://sertaoseracloud.github.io/python-playground/",
  ];

  test("tem um slide por curso, com banner, texto alternativo e link", async ({ page }) => {
    await page.goto("./");
    const carrossel = page.getByRole("region", { name: "Banners dos cursos" });
    await expect(carrossel).toHaveAttribute("aria-roledescription", "carrossel");
    const slides = carrossel.locator("[data-slide]");
    await expect(slides).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(slides.nth(i)).toHaveAttribute("aria-label", new RegExp(`^${i + 1} de 3: Diverge`));
      await expect(slides.nth(i).locator("a")).toHaveAttribute("href", SITES[i]);
      const alt = await slides.nth(i).locator("img").getAttribute("alt");
      expect(alt?.length).toBeGreaterThan(40);
    }
  });

  test("botões, pontos e setas do teclado trocam o banner (sem rotação automática)", async ({ page }) => {
    await page.goto("./");
    const pontos = page.locator(".carrossel-ponto");
    await expect(pontos.nth(0)).toHaveAttribute("aria-current", "true");

    await page.getByRole("button", { name: "Próximo banner" }).click();
    await expect(pontos.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-anuncio]")).toHaveText("2 de 3: DivergeTerraform");

    await page.getByRole("button", { name: "Banner anterior" }).click();
    await page.getByRole("button", { name: "Banner anterior" }).click();
    await expect(pontos.nth(2)).toHaveAttribute("aria-current", "true"); // volta do primeiro para o último

    const primeiro = page.getByRole("button", { name: "Mostrar banner 1: DivergePHP" });
    await primeiro.click();
    await expect(pontos.nth(0)).toHaveAttribute("aria-current", "true");
    await primeiro.focus(); // o Safari não foca botões no clique
    await page.keyboard.press("ArrowRight");
    await expect(pontos.nth(1)).toHaveAttribute("aria-current", "true");

    // Sem rotação automática: depois de um tempo, continua no mesmo banner.
    await page.waitForTimeout(1500);
    await expect(pontos.nth(1)).toHaveAttribute("aria-current", "true");
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
