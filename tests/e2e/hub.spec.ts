import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Hub page E2E tests.
 *
 * Covers HUB-01 through HUB-04:
 *   HUB-01: Mentor identity section (h1 visible, responsive viewport)
 *   HUB-02: Course cards (PHP, Terraform, Python and Kubernetes playgrounds, external links)
 *   HUB-05: Carrossel acessível com os banners dos cursos
 *   HUB-06: Abas Cursos | Eventos, com a MVPConf 2027 (inscrição e call for papers)
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

  test("4 course cards are present", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#painel-cursos .course-card")).toHaveCount(4);
    await expect(page.locator('[data-ir-aba="cursos"]')).toHaveText("4 cursos gratuitos");
    await expect(page.locator("#aba-cursos .aba-contador")).toHaveText("4");
  });

  test("active course card is visible", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#painel-cursos .course-card.active").first()).toBeVisible();
  });

  test("mentor photo img.mentor-photo is visible on the page", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("img.mentor-photo")).toBeVisible();
  });

  test(".bio is visible and contains expected tagline text", async ({ page }) => {
    await page.goto("./");
    const bio = page.locator(".bio");
    await expect(bio).toBeVisible();
    await expect(bio).toContainText("Arquiteto de Soluções · Microsoft MVP · Docker Captain · AWS Golden Jacket");
    await expect(page.locator("h1")).toHaveText("Cláudio Filipe Lima Rapôso");
  });

  test("course links point to the PHP, Terraform, Python and Kubernetes playgrounds", async ({ page }) => {
    await page.goto("./");
    const courseLinks = page.locator("#painel-cursos .course-card.active .course-link");
    await expect(courseLinks).toHaveCount(4);
    const hrefs = await courseLinks.evaluateAll(links => links.map(l => l.getAttribute("href")));
    expect(hrefs).toEqual([
      "https://sertaoseracloud.github.io/php-playground/",
      "https://sertaoseracloud.github.io/terraform-playground/",
      "https://sertaoseracloud.github.io/python-playground/",
      "https://sertaoseracloud.github.io/kubernetes-playground/",
    ]);
  });

  test("external course links open in a new tab with noopener noreferrer", async ({ page }) => {
    await page.goto("./");
    const courseLinks = page.locator("#painel-cursos .course-card.active .course-link");
    await expect(courseLinks).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(courseLinks.nth(i)).toHaveAttribute("target", "_blank");
      await expect(courseLinks.nth(i)).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("Kubernetes card shows exercises and repository link", async ({ page }) => {
    await page.goto("./");
    const card = page.locator("#painel-cursos .course-card").filter({ hasText: "DivergeKubernetes" });
    await expect(card).toBeVisible();
    await expect(card.locator(".chip-forte")).toHaveText("261 exercícios");
    const repo = card.getByRole("link", { name: /Dar uma star/ });
    await expect(repo).toHaveAttribute("href", "https://github.com/sertaoseracloud/kubernetes-playground");
    await expect(repo).toHaveAttribute("target", "_blank");
    await expect(repo).toHaveAttribute("rel", "noopener noreferrer");
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

  test("tem um slide por curso com banner cadastrado, texto alternativo e link", async ({ page }) => {
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
    const carrossel = page.getByRole("region", { name: "Banners dos cursos" });
    const pontos = carrossel.locator(".carrossel-ponto");
    await expect(pontos.nth(0)).toHaveAttribute("aria-current", "true");

    await page.getByRole("button", { name: "Próximo banner" }).click();
    await expect(pontos.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(carrossel.locator("[data-anuncio]")).toHaveText("2 de 3: DivergeTerraform");

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

test.describe("Hub abas", () => {
  test("Cursos é a aba inicial; Eventos mostra a MVPConf com banners e links", async ({ page }) => {
    await page.goto("./");
    const cursos = page.getByRole("tab", { name: "Cursos" });
    const eventos = page.getByRole("tab", { name: /Eventos/ });
    await expect(cursos).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "Cursos" })).toBeVisible();
    await expect(page.locator("#painel-eventos")).toBeHidden();

    await eventos.click();
    await expect(eventos).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#eventos$/);
    const painel = page.getByRole("tabpanel", { name: /Eventos/ });
    await expect(painel).toBeVisible();
    await expect(painel.getByRole("heading", { name: "MVPConf 2027" })).toBeVisible();
    // Os eventos que já passaram somem no build; a MVPConf 2027 fica até out/2027.
    const cards = painel.locator(".event-card");
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
    expect(await painel.locator("[data-slide]").count()).toBeGreaterThanOrEqual(2);
    // Do mais próximo para o mais distante: a MVPConf 2027 é o último card.
    await expect(cards.last().locator("h4")).toHaveText("MVPConf 2027");

    // Carrossel de eventos: com mais de 5 banners, um contador no lugar dos pontos.
    const slides = await painel.locator("[data-slide]").count();
    if (slides > 5) {
      await painel.getByRole("button", { name: "Próximo banner" }).click();
      await expect(painel.locator("[data-contador]")).toHaveText(`2 de ${slides}`);
    }
    await expect(painel.getByRole("link", { name: /Inscrever-se\s+—\s+MVPConf 2027/ })).toHaveAttribute(
      "href",
      "https://mvpconf.com.br/conf/br/2027/register"
    );
    await expect(painel.getByRole("link", { name: /Enviar palestra\s+—\s+MVPConf 2027/ })).toHaveAttribute(
      "href",
      "https://mvpconf.com.br/conf/br/2027#contato"
    );
  });

  test("setas do teclado trocam a aba e #eventos abre direto em Eventos", async ({ page }) => {
    await page.goto("./");
    const cursos = page.getByRole("tab", { name: "Cursos" });
    await cursos.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /Eventos/ })).toBeFocused();
    await expect(page.locator("#painel-cursos")).toBeHidden();
    await page.keyboard.press("Home");
    await expect(cursos).toBeFocused();
    await expect(page.locator("#painel-cursos")).toBeVisible();

    await page.goto("./#eventos");
    await expect(page.getByRole("tab", { name: /Eventos/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#painel-eventos")).toBeVisible();
  });

  test("no critical axe-core violations on the Eventos tab", async ({ page }) => {
    await page.goto("./#eventos");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
  });
});

test.describe("Hub UX", () => {
  test("atalhos do perfil abrem a aba certa e levam o foco até ela", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: /próximos eventos/ }).click();
    const eventos = page.getByRole("tab", { name: /Eventos/ });
    await expect(eventos).toHaveAttribute("aria-selected", "true");
    await expect(eventos).toBeFocused();
    await page.getByRole("link", { name: /cursos gratuitos/ }).click();
    await expect(page.getByRole("tab", { name: "Cursos" })).toHaveAttribute("aria-selected", "true");
  });

  test("cards de evento mostram data em destaque, destaques e quanto falta", async ({ page }) => {
    // Relógio fixo perto da MVPConf 2027 (os eventos anteriores somem sozinhos).
    await page.clock.setFixedTime(new Date("2027-10-01T10:00:00"));
    await page.goto("./#eventos");
    const card = page.locator(".event-card").filter({ hasText: "MVPConf 2027" });
    await expect(card.locator(".event-data")).toContainText("22–23");
    await expect(card.locator(".chip")).toHaveText(["Presencial", "Renda para ONGs", "Call for papers aberto"]);
    await expect(card.locator("[data-faltam]")).toHaveText(" · faltam 21 dias");
    await expect(page.locator(".mes-titulo")).toHaveText(["outubro de 2027"]);
  });

  test("encontro do AWS UG: destaque da palestra e um só botão de inscrição", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-20T10:00:00"));
    await page.goto("./#eventos");
    const card = page.locator(".event-card").filter({ hasText: "AWS User Group Floripa" });
    await expect(card.locator(".chip")).toHaveText(["Presencial", "Palestra do Cláudio"]);
    await expect(card.getByRole("link")).toHaveCount(1);
    await expect(card.getByRole("link", { name: /Inscrever-se\s+—\s+21º Encontro AWS User Group Floripa/ })).toHaveAttribute(
      "href",
      "https://www.meetup.com/pt-br/aws-user-group-floripa/events/316963249/"
    );
    await expect(card.locator("[data-faltam]")).toHaveText(" · faltam 8 dias");
    await expect(page.locator(".mes-titulo").first()).toHaveText("outubro de 2026");
  });

  test("regionais aparecem como gratuitas", async ({ page }) => {
    await page.goto("./#eventos");
    const regionais = page.locator(".event-card").filter({ hasText: "MVP Conf Regional" });
    for (const card of await regionais.all()) {
      await expect(card.locator(".chip").filter({ hasText: "Gratuito" })).toBeVisible();
    }
  });

  test("eventos que já acabaram somem e o contador da aba acompanha", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-20T10:00:00"));
    await page.goto("./#eventos");
    const titulos = await page.locator(".event-card h4").allTextContents();
    expect(titulos).not.toContain("MVP Conf Regional Manaus"); // 12/11
    expect(titulos).toContain("MVPConf 2027");
    await expect(page.locator("[data-contador-eventos]")).toHaveText(String(titulos.length));
  });

  test("sem buracos: o carrossel começa logo abaixo das abas", async ({ page }) => {
    await page.goto("./");
    const abas = await page.locator(".hub-abas").boundingBox();
    const carrossel = await page.getByRole("region", { name: "Banners dos cursos" }).boundingBox();
    expect(carrossel!.y - (abas!.y + abas!.height)).toBeLessThan(160);
  });
});

test.describe("Hub blog (dev.to)", () => {
  test("aba Blog mostra 9 artigos, 'Mostrar mais' traz mais 9 e leva o foco", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: /artigos no blog/ }).click();
    const aba = page.getByRole("tab", { name: "Blog" });
    await expect(aba).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/#blog$/);

    const painel = page.getByRole("tabpanel", { name: "Blog" });
    const visiveis = painel.locator(".post-card:visible");
    await expect(visiveis).toHaveCount(9);
    const primeiro = visiveis.first();
    await expect(primeiro.getByRole("link", { name: /^Ler artigo/ })).toHaveAttribute("href", /^\/blog\/[a-z0-9-]+\/$/);
    await expect(primeiro.getByRole("link", { name: /no dev\.to \(abre em nova aba\)/ })).toHaveAttribute("href", /^https:\/\/dev\.to\/sertaoseracloud\//);

    await painel.getByRole("button", { name: /Mostrar mais artigos/ }).click();
    await expect(visiveis).toHaveCount(18);
    await expect(painel.locator(".post-card").nth(9).getByRole("link", { name: /^Ler artigo/ })).toBeFocused();
    await expect(painel.locator("[data-anuncio-blog]")).toHaveText(/Mostrando 18 de \d+ artigos/);
  });

  test("filtro por idioma e títulos em inglês marcados com lang=en", async ({ page }) => {
    await page.goto("./#blog");
    const painel = page.getByRole("tabpanel", { name: "Blog" });
    await painel.getByRole("button", { name: /^English/ }).click();
    await expect(painel.getByRole("button", { name: /^English/ })).toHaveAttribute("aria-pressed", "true");
    const visiveis = painel.locator(".post-card:visible");
    expect(await visiveis.count()).toBeGreaterThan(0);
    for (const card of await visiveis.all()) {
      await expect(card).toHaveAttribute("data-idioma", "en");
      await expect(card.locator("h3")).toHaveAttribute("lang", "en");
    }
    await painel.getByRole("button", { name: /^Português/ }).click();
    for (const card of await painel.locator(".post-card:visible").all()) {
      await expect(card.locator("h3")).not.toHaveAttribute("lang", /.+/);
    }
    await expect(painel.locator("[data-anuncio-blog]")).toHaveText(/\d+ artigos?\./);
  });

  test("o artigo abre dentro do site, com canonical no dev.to e volta para o Blog", async ({ page }) => {
    await page.goto("./#blog");
    const painel = page.getByRole("tabpanel", { name: "Blog" });
    const card = painel.locator(".post-card").first();
    const titulo = (await card.locator("h3").textContent())!.trim();
    await card.getByRole("link", { name: /^Ler artigo/ }).click();

    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+\/$/);
    await expect(page.locator("h1")).toHaveText(titulo);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/dev\.to\/sertaoseracloud\//);
    await expect(page.locator(".artigo-corpo")).not.toBeEmpty();
    // Blocos de código roláveis pelo teclado
    const pre = page.locator(".artigo-corpo pre").first();
    if (await pre.count()) await expect(pre).toHaveAttribute("tabindex", "0");
    await expect(page.getByRole("link", { name: /Comentar ou reagir no dev\.to/ })).toHaveAttribute("href", /^https:\/\/dev\.to\//);

    await page.getByRole("link", { name: /Blog/ }).first().click();
    await expect(page.getByRole("tab", { name: "Blog" })).toHaveAttribute("aria-selected", "true");
  });

  test("diagramas Mermaid viram desenho nas cores do tema, com o código ao lado", async ({ page }) => {
    // Primeiro artigo salvo que tem um bloco ```mermaid
    const { readdirSync, readFileSync } = await import("node:fs");
    const pasta = new URL("../../src/data/devto/", import.meta.url);
    const arquivo = readdirSync(pasta).find((f) => readFileSync(new URL(f, pasta), "utf8").includes('data-lang="mermaid"'));
    test.skip(!arquivo, "nenhum artigo com diagrama na lista salva");
    const { default: lista } = await import("../../src/data/devto-artigos.json", { with: { type: "json" } });
    const artigo = lista.find((a: { id: number }) => `${a.id}.html` === arquivo)!;

    await page.goto(`./blog/${artigo.slug}/`);
    const figura = page.locator("figure.diagrama").first();
    // O Mermaid só carrega quando o diagrama se aproxima da tela.
    await figura.scrollIntoViewIfNeeded();
    await expect(figura).toHaveAttribute("aria-label", /^(Fluxograma|Diagrama)/);
    const desenho = figura.locator(".diagrama-desenho svg");
    await expect(desenho).toBeVisible({ timeout: 15000 });
    // O diagrama fica no tamanho real; se não couber, a dica aparece e o quadro rola pelo teclado.
    const desenhoBox = figura.locator(".diagrama-desenho");
    await expect(desenhoBox).toHaveAttribute("tabindex", "0");
    const naoCabe = await desenhoBox.evaluate((el) => el.scrollWidth > el.clientWidth + 4);
    await expect(figura.locator(".diagrama-dica")).toBeVisible({ visible: naoCabe });
    await expect(figura.locator("details.diagrama-codigo summary")).toHaveText("Ver o código do diagrama");
    await expect(figura.locator("details.diagrama-codigo pre")).toBeHidden();
    await figura.locator("summary").click();
    await expect(figura.locator("details.diagrama-codigo pre")).toBeVisible();

    // Diagrama desenhado também passa no axe (contraste, rótulos, foco).
    const axe = await new AxeBuilder({ page }).include("figure.diagrama").withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);

    // Troca para o tema claro: o diagrama é redesenhado com o texto escuro do tema.
    const corDoTexto = () => desenho.evaluate((svg) => getComputedStyle(svg.querySelector("text")!).fill);
    const antes = await corDoTexto();
    await page.locator("#btn-acessibilidade").click();
    await page.getByRole("radio", { name: "Claro" }).check();
    await expect.poll(corDoTexto, { timeout: 15000 }).not.toBe(antes);
  });

  test("no serious axe-core violations on the Blog tab", async ({ page }) => {
    await page.goto("./#blog");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
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
