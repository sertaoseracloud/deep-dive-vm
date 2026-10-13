import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Acessibilidade de todas as telas (mesmo padrão dos playgrounds DivergePHP e
 * DivergeTerraform): axe-core com WCAG 2.2 AA em cada página e em cada tema do
 * painel ♿, reflow em 320 px com texto em 175%, alvos de toque, fonte mínima,
 * e o comportamento do painel e dos diálogos pelo teclado.
 */

const PAGINAS = [
  { nome: "hub", url: "./" },
  { nome: "LP Azure VM", url: "./deep-dive-vm/" },
  { nome: "LP Python", url: "./deep-dive-python-neurodivergentes/" },
  { nome: "EC2 (em breve)", url: "./deep-dive-ec2/" },
  { nome: "declaração de acessibilidade", url: "./acessibilidade/" },
];

const TEMAS = ["padrao", "claro", "alto-contraste", "suave"] as const;
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Grava a escolha do painel antes de abrir a página, como faria uma visita anterior. */
async function comPreferencias(page: Page, prefs: Record<string, unknown>) {
  await page.addInitScript((p) => {
    const classes: Record<string, string> = {
      fonteLegivel: "a11y-fonte-legivel",
      espacamento: "a11y-espacamento",
      linhasCurtas: "a11y-linhas-curtas",
      sublinharLinks: "a11y-links",
      reduzirMovimento: "a11y-sem-movimento",
      libras: "a11y-libras",
    };
    const completo = { tema: "padrao", tamanho: 100, ...p } as Record<string, unknown>;
    localStorage.setItem("a11y:preferencias", JSON.stringify(completo));
    localStorage.setItem(
      "a11y:aplicado",
      JSON.stringify({
        tema: completo.tema,
        escala: String((completo.tamanho as number) / 100),
        classes: Object.keys(classes).filter((k) => completo[k]).map((k) => classes[k]),
        cor: "#000000",
      })
    );
  }, prefs);
}

/** Mostra tudo o que entra com animação de rolagem, para o axe ver as cores finais. */
async function revelarTudo(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-revealed", ""));
  });
}

async function violacoes(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return resultado.violations.map((v) => ({
    regra: v.id,
    impacto: v.impact,
    alvos: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));
}

for (const pagina of PAGINAS) {
  test.describe(`${pagina.nome}`, () => {
    for (const tema of TEMAS) {
      test(`axe WCAG 2.2 AA sem violações — tema ${tema}`, async ({ page }) => {
        await comPreferencias(page, { tema, reduzirMovimento: true });
        await page.goto(pagina.url);
        await expect(page.locator("html")).toHaveAttribute("data-tema", tema);
        await revelarTudo(page);
        expect(await violacoes(page)).toEqual([]);
      });
    }

    test("320 px com texto em 175%: sem rolagem horizontal nem texto cortado", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await comPreferencias(page, { tamanho: 175, reduzirMovimento: true });
      await page.goto(pagina.url);
      // Mede com as fontes finais (a troca de fonte muda a largura das palavras).
      await page.evaluate(() => document.fonts.ready);
      // Abre os <details> para medir também o conteúdo recolhido.
      await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
      const medida = await page.evaluate(() => {
        const janela = window.innerWidth;
        // body tem overflow-x: hidden, então só a rolagem não basta: texto que
        // passa da borda some sem aviso. Procura o elemento mais interno que estoura.
        const cortados = [...document.querySelectorAll<HTMLElement>("body *")]
          .filter((el) => {
            if (!el.textContent?.trim() || el.closest("[aria-hidden='true'], .sr-only, dialog:not([open])")) return false;
            if (getComputedStyle(el).position === "fixed") return false;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.right <= janela + 1) return false;
            return ![...el.children].some((c) => c.getBoundingClientRect().right > janela + 1);
          })
          .map((el) => `${el.tagName.toLowerCase()} "${el.textContent!.trim().slice(0, 30)}"`);
        return { documento: document.documentElement.scrollWidth, janela, cortados: cortados.slice(0, 10) };
      });
      expect(medida.documento).toBeLessThanOrEqual(medida.janela);
      expect(medida.cortados).toEqual([]);
    });

    test("nenhum texto visível abaixo de 12 px", async ({ page }) => {
      await page.goto(pagina.url);
      await revelarTudo(page);
      const pequenos = await page.evaluate(() => {
        const achados: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const no = walker.currentNode;
          const el = no.parentElement;
          if (!el || !no.textContent?.trim()) continue;
          if (el.closest(".sr-only, [hidden], dialog:not([open]), noscript, script, style")) continue;
          const estilo = getComputedStyle(el);
          if (estilo.display === "none" || estilo.visibility === "hidden") continue;
          const px = parseFloat(estilo.fontSize);
          if (px < 12) achados.push(`${el.tagName.toLowerCase()}.${el.className}: ${px}px "${no.textContent.trim().slice(0, 30)}"`);
        }
        return achados;
      });
      expect(pequenos).toEqual([]);
    });
  });
}

test.describe("alvos de toque (WCAG 2.5.8)", () => {
  for (const pagina of PAGINAS) {
    test(`${pagina.nome}: botões e links fora de texto corrido têm 24×24 px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(pagina.url);
      const pequenos = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("a[href], button, input, summary")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false; // invisível
            if (el.closest(".sr-only, dialog:not([open])")) return false;
            if (el.classList.contains("skip-link")) return false;
            // Exceção da WCAG: link dentro de uma frase.
            if (el.tagName === "A" && el.closest("p, li, dd") && el.parentElement?.childNodes.length! > 1) return false;
            return r.width < 24 || r.height < 24;
          })
          .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"`)
      );
      expect(pequenos).toEqual([]);
    });
  }
});

test.describe("painel ♿ Acessibilidade", () => {
  test("abre pelo teclado, prende o foco, Esc fecha e devolve o foco ao botão", async ({ page }) => {
    await page.goto("./");
    const botao = page.locator("#btn-acessibilidade");
    await botao.focus();
    await page.keyboard.press("Enter");
    const dialogo = page.getByRole("dialog", { name: "Acessibilidade" });
    await expect(dialogo).toBeVisible();
    await expect(page.locator(":focus")).toBeAttached();
    expect(await page.evaluate(() => !!document.activeElement?.closest("#dialogo-a11y"))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await expect(botao).toBeFocused();
  });

  test("tema escolhido vale na hora, fica salvo e volta antes da primeira pintura", async ({ page }) => {
    await page.goto("./deep-dive-vm/");
    await page.locator("#btn-acessibilidade").click();
    await page.getByRole("radio", { name: "Alto contraste" }).check();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "alto-contraste");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#000000");

    // Na recarga, o tema já está no <html> quando o DOM fica pronto (sem piscar).
    await page.reload({ waitUntil: "commit" });
    const temaNoInicio = await page.evaluate(
      () =>
        new Promise<string | null>((ok) => {
          const ler = () => ok(document.documentElement.getAttribute("data-tema"));
          if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ler, { once: true });
          else ler();
        })
    );
    expect(temaNoInicio).toBe("alto-contraste");
  });

  test("perfil liga as opções dele e anuncia a mudança; ligar de novo desliga", async ({ page }) => {
    await page.goto("./");
    await page.locator("#btn-acessibilidade").click();
    const perfil = page.locator('[data-perfil="leitura"]');
    await perfil.click();
    await expect(perfil).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveClass(/a11y-fonte-legivel/);
    await expect(page.locator("html")).toHaveClass(/a11y-espacamento/);
    await expect(page.locator("#a11y-aviso")).toHaveText("Perfil ligado.");
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Atkinson Hyperlegible");
    await perfil.click();
    await expect(perfil).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).not.toHaveClass(/a11y-fonte-legivel/);
  });

  test("tamanho do texto vai de 87,5% a 175% e trava nos limites", async ({ page }) => {
    await page.goto("./");
    await page.locator("#btn-acessibilidade").click();
    const maior = page.getByRole("button", { name: "Aumentar o texto" });
    for (let i = 0; i < 4; i++) await maior.click();
    await expect(page.locator("#a11y-tamanho")).toHaveText("175%");
    await expect(maior).toBeDisabled();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe("28px");
  });

  test("reduzir animações mostra o conteúdo sem esperar a rolagem", async ({ page }) => {
    await comPreferencias(page, { reduzirMovimento: true });
    await page.goto("./deep-dive-vm/");
    const opacidade = await page
      .locator("[data-reveal]")
      .last()
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(opacidade).toBe("1");
  });

  test("sem escolha salva, segue o contraste alto do sistema", async ({ page }) => {
    await page.emulateMedia({ contrast: "more" } as Parameters<Page["emulateMedia"]>[0]);
    await page.goto("./");
    await expect(page.locator("html")).toHaveAttribute("data-tema", "alto-contraste");
  });

  test("sem escolha salva, o modo claro do sistema aplica o tema Claro antes da pintura", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("./deep-dive-vm/", { waitUntil: "commit" });
    const temaNoInicio = await page.evaluate(
      () =>
        new Promise<string | null>((ok) => {
          const ler = () => ok(document.documentElement.getAttribute("data-tema"));
          if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ler, { once: true });
          else ler();
        })
    );
    expect(temaNoInicio).toBe("claro");
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f5f7fb");
  });

  test("com escolha salva, o painel vence o sistema", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await comPreferencias(page, { tema: "padrao" });
    await page.goto("./");
    await expect(page.locator("html")).toHaveAttribute("data-tema", "padrao");
  });

  test("restaurar padrão apaga a escolha salva", async ({ page }) => {
    await comPreferencias(page, { tema: "suave" });
    await page.goto("./");
    await page.locator("#btn-acessibilidade").click();
    await page.getByRole("button", { name: "Restaurar padrão" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "padrao");
    expect(await page.evaluate(() => localStorage.getItem("a11y:preferencias"))).toBeNull();
  });
});

test.describe("termos e privacidade (LP)", () => {
  test("botões do rodapé abrem diálogos nomeados; Esc fecha e devolve o foco", async ({ page }) => {
    await page.goto("./deep-dive-vm/");
    const termos = page.getByRole("button", { name: "Termos" });
    await termos.focus();
    await page.keyboard.press("Enter");
    const dialogo = page.getByRole("dialog", { name: "Termos de Uso" });
    await expect(dialogo).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await expect(termos).toBeFocused();

    await page.getByRole("button", { name: "Privacidade" }).click();
    await expect(page.locator("#modal-privacy")).toBeVisible();
    await page.locator("#modal-privacy").getByRole("button", { name: "Fechar" }).click();
    await expect(page.locator("#modal-privacy")).toBeHidden();
  });
});

test.describe("hub: cards dos cursos", () => {
  test("cada curso tem link de acesso e de star com nomes distintos", async ({ page }) => {
    await page.goto("./");
    await expect(page.getByRole("link", { name: /Acessar curso DivergePHP/ })).toHaveAttribute(
      "href",
      "https://sertaoseracloud.github.io/php-playground/"
    );
    await expect(page.getByRole("link", { name: /Dar uma star no GitHub para o DivergeTerraform/ })).toHaveAttribute(
      "href",
      "https://github.com/sertaoseracloud/terraform-playground"
    );
    await expect(page.getByRole("list", { name: "Redes sociais" }).getByRole("link")).toHaveCount(3);
  });
});
