import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buscarArtigos,
  buscarCorpo,
  dataCurta,
  idiomas,
  limparHtml,
  nivelarTitulos,
  nomeDoIdioma,
  normalizarArtigo,
  ordenar,
  PERFIL,
  precisamDeCorpo,
} from "../../../src/lib/devto.js";
import salvos from "../../../src/data/devto-artigos.json";

const bruto = (id: number, data: string, extra: Record<string, unknown> = {}) => ({
  id,
  slug: `artigo-${id}`,
  title: ` Artigo ${id} `,
  description: "Resumo",
  url: `https://dev.to/sertaoseracloud/artigo-${id}`,
  canonical_url: `https://dev.to/sertaoseracloud/artigo-${id}`,
  published_at: data,
  edited_at: null,
  reading_time_minutes: 5,
  tag_list: ["aws", "azure"],
  cover_image: null,
  language: "pt",
  positive_reactions_count: 3,
  comments_count: 1,
  ...extra,
});

const resposta = (corpo: unknown, ok = true, status = 200) => ({ ok, status, json: async () => corpo }) as Response;
const comoFetch = (f: (url: string) => Promise<Response>) => f as unknown as typeof fetch;

describe("dev.to: lista", () => {
  it("normaliza só os campos do site", () => {
    expect(normalizarArtigo(bruto(1, "2026-09-28T15:33:42Z"))).toEqual({
      id: 1,
      slug: "artigo-1",
      title: "Artigo 1",
      description: "Resumo",
      url: "https://dev.to/sertaoseracloud/artigo-1",
      canonical: "https://dev.to/sertaoseracloud/artigo-1",
      publishedAt: "2026-09-28T15:33:42Z",
      editedAt: "2026-09-28T15:33:42Z",
      readingTime: 5,
      tags: ["aws", "azure"],
      cover: null,
      language: "pt",
      reactions: 3,
      comments: 1,
    });
  });

  it("aceita tags em texto, idioma ausente, sem slug/canonical e contagens públicas", () => {
    const a = normalizarArtigo({
      id: 2,
      url: "https://dev.to/x",
      published_at: "2026-01-01T00:00:00Z",
      edited_at: "2026-02-01T00:00:00Z",
      tag_list: "go, kubernetes ,",
      language: "EN-us",
      public_reactions_count: 7,
      cover_image: "https://media.dev.to/capa.png",
    });
    expect(a.tags).toEqual(["go", "kubernetes"]);
    expect(a.language).toBe("en");
    expect(a.reactions).toBe(7);
    expect(a.comments).toBe(0);
    expect(a.readingTime).toBe(0);
    expect(a.title).toBe("");
    expect(a.slug).toBe("2");
    expect(a.canonical).toBe("https://dev.to/x");
    expect(a.editedAt).toBe("2026-02-01T00:00:00Z");
    expect(a.cover).toBe("https://media.dev.to/capa.png");
    expect(normalizarArtigo({ id: 3, url: "u", published_at: "x" }).language).toBe("pt");
    expect(normalizarArtigo({ id: 4, url: "u", published_at: "x" }).tags).toEqual([]);
  });

  it("busca página por página até a última e ordena do mais novo", async () => {
    const pagina1 = Array.from({ length: 100 }, (_, i) => bruto(i + 1, `2025-01-${String((i % 28) + 1).padStart(2, "0")}T00:00:00Z`));
    const pagina2 = [bruto(500, "2026-10-01T00:00:00Z")];
    const buscar = vi.fn(async (url: string) => resposta(url.endsWith("&page=1") ? pagina1 : pagina2));
    const artigos = await buscarArtigos(comoFetch(buscar));
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(buscar.mock.calls[0][0]).toBe("https://dev.to/api/articles?username=sertaoseracloud&per_page=100&page=1");
    expect(artigos).toHaveLength(101);
    expect(artigos[0].id).toBe(500);
  });

  it("deixa de fora os [Boost] (compartilhamentos de posts de outras pessoas)", async () => {
    const lote = [bruto(1, "2026-01-01T00:00:00Z"), bruto(2, "2026-01-02T00:00:00Z", { title: "[Boost]" })];
    const artigos = await buscarArtigos(comoFetch(async () => resposta(lote)));
    expect(artigos.map((a) => a.id)).toEqual([1]);
    expect(salvos.some((a) => a.title === "[Boost]")).toBe(false);
  });

  it("falha quando a API responde com erro ou formato inesperado", async () => {
    await expect(buscarArtigos(comoFetch(async () => resposta([], false, 503)))).rejects.toThrow("503");
    await expect(buscarArtigos(comoFetch(async () => resposta({ erro: 1 })))).rejects.toThrow("formato");
  });

  it("ordenar remove repetidos", () => {
    const a = normalizarArtigo(bruto(1, "2026-01-01T00:00:00Z"));
    const b = normalizarArtigo(bruto(2, "2026-02-01T00:00:00Z"));
    expect(ordenar([a, b, a]).map((x) => x.id)).toEqual([2, 1]);
  });
});

describe("dev.to: corpo do artigo", () => {
  it("busca o corpo já limpo", async () => {
    const buscar = vi.fn(async () => resposta({ body_html: "<h1>Título</h1><p>Oi</p>" }));
    expect(await buscarCorpo(comoFetch(buscar), 42)).toBe("<h2>Título</h2><p>Oi</p>");
    expect(buscar).toHaveBeenCalledWith("https://dev.to/api/articles/42", expect.anything());
    expect(await buscarCorpo(comoFetch(async () => resposta({})), 1)).toBe("");
  });

  it("espera e tenta de novo quando a API pede calma (429)", async () => {
    let chamadas = 0;
    const buscar = async () => (++chamadas < 3 ? resposta({}, false, 429) : resposta({ body_html: "<p>ok</p>" }));
    const esperar = vi.fn(async (_ms: number) => {});
    expect(await buscarCorpo(comoFetch(buscar), 7, esperar)).toBe("<p>ok</p>");
    expect(esperar.mock.calls.map((c) => c[0])).toEqual([5000, 10000]);
  });

  it("desiste depois de 4 tentativas ou com outro erro", async () => {
    const esperar = async () => {};
    await expect(buscarCorpo(comoFetch(async () => resposta({}, false, 429)), 7, esperar)).rejects.toThrow("429");
    await expect(buscarCorpo(comoFetch(async () => resposta({}, false, 404)), 7, esperar)).rejects.toThrow("404 no artigo 7");
  });

  it("limpa o HTML do dev.to para o site, sem mudar quando aplicado de novo", () => {
    const html = [
      '<div class="highlight js-code-highlight"><pre class="highlight python"><code>x = 1</code></pre>',
      '<div class="highlight__panel js-actions-panel"><div class="highlight__panel-action js-fullscreen-code-action"><svg></svg></div></div></div>',
      '<h1 id="a">Seção</h1>',
      '<h3>\n  <a name="pr%C3%A9-requisitos" href="#pr%C3%A9-requisitos">\n  </a>\n  Pré-requisitos\n</h3>',
      '<p><a name="solta" href="#solta"></a>Texto</p>',
      '<h2>\n  <a name="" href="#">\n  </a>\n  <img src="b.png" alt="Painel"></h2>',
      '<p onclick="alert(1)">Texto <a href="javascript:alert(1)">link</a></p>',
      '<script>alert(1)</script>',
      '<button class="crayons-btn">Seguir</button>',
      '<img src="a.png" alt="Diagrama"><iframe src="https://www.youtube.com/embed/x"></iframe>',
      "<table><tr><td>1</td></tr></table>",
    ].join("");
    const limpo = limparHtml(html);
    expect(limpo).not.toContain("highlight__panel");
    expect(limpo).not.toContain("<script");
    expect(limpo).not.toContain("<button");
    expect(limpo).not.toContain("onclick");
    expect(limpo).not.toContain("javascript:");
    expect(limpo).toContain('<h2 id="a">Seção</h2>');
    expect(limpo).toContain('<h3 id="pr%C3%A9-requisitos">Pré-requisitos\n</h3>');
    expect(limpo).toContain('<p><span id="solta"></span>Texto</p>');
    expect(limpo).not.toMatch(/<a name=/);
    expect(limpo).toContain('<pre tabindex="0" class="highlight python">');
    expect(limpo).toContain('<table tabindex="0">');
    expect(limpo).toContain('<img loading="lazy" src="a.png" alt="Diagrama">');
    expect(limpo).toContain('<iframe loading="lazy" src="https://www.youtube.com/embed/x">');
    expect(limparHtml(limpo)).toBe(limpo);
  });

  it("títulos seguem em sequência a partir de h2, sem pular níveis", () => {
    expect(nivelarTitulos("<h3>A</h3><p>x</p><h5 id='b'>B</h5><h3>C</h3>")).toBe("<h2>A</h2><p>x</p><h3 id='b'>B</h3><h2>C</h2>");
    expect(nivelarTitulos("<h2>A</h2><h3>B</h3>")).toBe("<h2>A</h2><h3>B</h3>");
    expect(nivelarTitulos("<p>sem títulos</p>")).toBe("<p>sem títulos</p>");
    // h1 do texto vira h2 e o resto acompanha
    expect(limparHtml("<h1>A</h1><h4>B</h4>")).toBe("<h2>A</h2><h3>B</h3>");
    for (const id of salvos.slice(0, 20).map((a) => a.id)) {
      const html = readFileSync(join(process.cwd(), "src/data/devto", `${id}.html`), "utf8");
      const niveis = [...new Set([...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1])))].sort();
      niveis.forEach((n, i) => expect(n, `artigo ${id}`).toBe(i + 2));
    }
  });

  it("precisa baixar o corpo só dos artigos novos, editados ou sem arquivo", () => {
    const a = (id: number, editedAt: string) => ({ ...normalizarArtigo(bruto(id, "2026-01-01T00:00:00Z")), editedAt });
    const salvosAntes = [a(1, "2026-01-01"), a(2, "2026-01-01"), a(3, "2026-01-01")];
    const atuais = [a(1, "2026-01-01"), a(2, "2026-03-01"), a(3, "2026-01-01"), a(4, "2026-04-01")];
    const comArquivo = new Set([1, 2, 4]);
    expect(precisamDeCorpo(atuais, salvosAntes, (id) => comArquivo.has(id)).map((x) => x.id)).toEqual([2, 3, 4]);
  });
});

describe("dev.to: textos e lista salva", () => {
  it("data curta, idiomas e perfil", () => {
    expect(dataCurta("2026-09-28T15:33:42Z")).toBe("28 set 2026");
    expect(dataCurta("2025-01-05T00:00:00Z")).toBe("5 jan 2025");
    expect(nomeDoIdioma("pt")).toBe("Português");
    expect(nomeDoIdioma("en")).toBe("English");
    expect(nomeDoIdioma("es")).toBe("Español");
    expect(nomeDoIdioma("fr")).toBe("FR");
    const lista = ["en", "pt", "en"].map((language, i) => ({ ...normalizarArtigo(bruto(i, "2026-01-01T00:00:00Z")), language }));
    expect(idiomas(lista)).toEqual(["en", "pt"]);
    expect(PERFIL).toBe("https://dev.to/sertaoseracloud");
  });

  it("a lista salva no repositório está no formato do site, com slugs únicos", () => {
    expect(salvos.length).toBeGreaterThan(0);
    for (const a of salvos) {
      expect(a.url).toMatch(/^https:\/\/dev\.to\/sertaoseracloud\//);
      expect(a.canonical).toMatch(/^https:\/\//);
      expect(a.slug).toMatch(/^[a-z0-9-]+$/);
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
    expect(new Set(salvos.map((a) => a.slug)).size).toBe(salvos.length);
    expect(ordenar(salvos).map((a) => a.id)).toEqual(salvos.map((a) => a.id));
  });
});
