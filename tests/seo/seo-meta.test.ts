import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Static SEO meta-tag assertions.
 *
 * Parses dist/index.html produced by `npm run build`.
 * In CI: the lighthouse job runs `npm run build` before this suite.
 * Locally: run `npm run build` before `npm run test:all`.
 *
 * The test does NOT call execSync('npm run build') inline to avoid
 * side-effects during parallel test runs and to keep test time predictable.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_INDEX = join(__dirname, "../../dist/index.html");
const DIST_DIR = join(__dirname, "../../dist");

let html = "";

beforeAll(() => {
  if (!existsSync(DIST_INDEX)) {
    throw new Error(
      `dist/index.html not found. Run 'npm run build' before running SEO tests.\nExpected path: ${DIST_INDEX}`
    );
  }
  html = readFileSync(DIST_INDEX, "utf-8");
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractTitle(h: string): string | null {
  const match = h.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractMetaContent(h: string, name: string): string | null {
  // Matches both name="" and property="" meta tags
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escapeRe(name)}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${escapeRe(name)}["']`,
    "i"
  );
  const m = h.match(re) ?? h.match(re2);
  return m ? m[1] : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(h: string, pattern: RegExp): number {
  return (h.match(pattern) ?? []).length;
}

// ── Assertions ────────────────────────────────────────────────────────────────

describe("SEO meta-tag static assertions (dist/index.html)", () => {
  it("1. <title> tag is present and <= 60 characters", () => {
    const title = extractTitle(html);
    expect(title, "<title> tag must be present in dist/index.html").toBeTruthy();
    expect(title!.length).toBeLessThanOrEqual(60);
  });

  it("2. <meta name=description> content is present and between 10–160 chars", () => {
    const desc = extractMetaContent(html, "description");
    expect(desc, "<meta name=description> must be present").toBeTruthy();
    expect(desc!.length).toBeGreaterThanOrEqual(10);
    expect(desc!.length).toBeLessThanOrEqual(160);
  });

  it("3. <meta property=og:title> is present and non-empty", () => {
    const ogTitle = extractMetaContent(html, "og:title");
    expect(ogTitle, "<meta property=og:title> must be present").toBeTruthy();
    expect(ogTitle!.length).toBeGreaterThan(0);
  });

  it("4. <meta property=og:description> is present and non-empty", () => {
    const ogDesc = extractMetaContent(html, "og:description");
    expect(ogDesc, "<meta property=og:description> must be present").toBeTruthy();
    expect(ogDesc!.length).toBeGreaterThan(0);
  });

  it("5. <meta property=og:image> is present and non-empty", () => {
    const ogImage = extractMetaContent(html, "og:image");
    expect(ogImage, "<meta property=og:image> must be present").toBeTruthy();
    expect(ogImage!.length).toBeGreaterThan(0);
  });

  it("6. <meta property=og:type> is present and equals 'website'", () => {
    const ogType = extractMetaContent(html, "og:type");
    expect(ogType).toBe("website");
  });

  it("7. <meta name=twitter:card> is present and non-empty", () => {
    const twitterCard = extractMetaContent(html, "twitter:card");
    expect(twitterCard, "<meta name=twitter:card> must be present").toBeTruthy();
    expect(twitterCard!.length).toBeGreaterThan(0);
  });

  it("8. Exactly one <h1> tag in the document", () => {
    const h1Count = countMatches(html, /<h1[\s>]/gi);
    expect(h1Count).toBe(1);
  });

  it("9. <link rel=canonical> is present with a non-empty href", () => {
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)
      ?? html.match(/<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
    expect(canonicalMatch, "<link rel=canonical> must be present").toBeTruthy();
    expect(canonicalMatch![1].length).toBeGreaterThan(0);
  });

  it("10. All <img> tags have alt; empty alt only on decorative blog covers", () => {
    // Find all <img> tags
    const imgTags = html.match(/<img[^>]*>/gi) ?? [];

    // Guard: ensure the page actually has img elements so the loop does not pass vacuously
    expect(imgTags.length).toBeGreaterThan(0);

    for (const tag of imgTags) {
      const altMatch = tag.match(/alt=["']([^"']*)["']/i);
      expect(altMatch, tag).not.toBeNull();
      // A capa do card do blog repete o título ao lado: é decorativa (alt="", WCAG H67).
      if (/class=["'][^"']*\bpost-capa\b/.test(tag)) continue;
      expect(altMatch![1].trim().length, tag).toBeGreaterThan(0);
    }
  });

  it("11. JSON-LD <script type=application/ld+json> is present and parseable with @context and @type", () => {
    const match = html.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    expect(match, "JSON-LD script block must be present in dist/index.html").toBeTruthy();

    let parsed: unknown;
    try {
      parsed = JSON.parse(match![1]);
    } catch (e) {
      throw new Error(`JSON-LD is not valid JSON: ${(e as Error).message}`);
    }
    expect((parsed as Record<string, unknown>)["@context"]).toBeTruthy();
    expect((parsed as Record<string, unknown>)["@type"]).toBeTruthy();
  });

  it("12. Heading hierarchy: no H2 before first H1, no heading level skip", () => {
    const headingMatches = [...html.matchAll(/<(h[1-6])[\s>]/gi)];
    const levels = headingMatches.map((m) => parseInt(m[1].slice(1), 10));
    expect(levels).toContain(1);
    const firstH1Index = levels.indexOf(1);
    const firstH2Index = levels.indexOf(2);
    if (firstH2Index !== -1) {
      expect(firstH2Index).toBeGreaterThan(firstH1Index);
    }
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      if (diff > 0) {
        expect(diff).toBeLessThanOrEqual(1);
      }
    }
  });

  it("13. dist/sitemap-index.xml exists after build", () => {
    expect(existsSync(join(DIST_DIR, "sitemap-index.xml"))).toBe(true);
  });


  it("16. dist/index.html og:image points to hub-og.png", () => {
    const hubIndexPath = join(DIST_DIR, "index.html");
    expect(existsSync(hubIndexPath), `dist/index.html not found at ${hubIndexPath}`).toBe(true);
    const hubHtml = readFileSync(hubIndexPath, "utf-8");
    const ogImage = extractMetaContent(hubHtml, "og:image");
    expect(ogImage).toBeTruthy();
    expect(ogImage).toContain("hub-og.png");
  });

});

describe("Sitemap content assertions (dist/sitemap-0.xml)", () => {
  const SITEMAP_PATH = join(DIST_DIR, "sitemap-0.xml");

  it("14. sitemap-0.xml lists the hub and the accessibility statement, and nothing else", () => {
    expect(existsSync(SITEMAP_PATH), `sitemap-0.xml not found. Run 'npm run build' first.`).toBe(true);
    const sitemap = readFileSync(SITEMAP_PATH, "utf-8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs).toEqual([
      "https://mentoria.sertaoseracloud.com/",
      "https://mentoria.sertaoseracloud.com/acessibilidade/",
    ]);
  });

  it("15. the removed landing pages are not built", () => {
    for (const rota of ["deep-dive-vm", "deep-dive-ec2", "deep-dive-python-neurodivergentes"]) {
      expect(existsSync(join(DIST_DIR, rota, "index.html")), rota).toBe(false);
    }
  });
});

describe("Blog: artigos dentro do site com canonical no dev.to", () => {
  const artigos: { id: number; slug: string; title: string; canonical: string; url: string; language: string }[] = JSON.parse(
    readFileSync(join(__dirname, "../../src/data/devto-artigos.json"), "utf-8")
  );

  it("17. cada artigo vira /blog/<slug>/ com canonical = canonical_url do dev.to", () => {
    expect(artigos.length).toBeGreaterThan(0);
    for (const artigo of artigos) {
      const pagina = join(DIST_DIR, "blog", artigo.slug, "index.html");
      expect(existsSync(pagina), pagina).toBe(true);
      const h = readFileSync(pagina, "utf-8");
      const canonical = h.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
      expect(canonical, artigo.slug).toBe(artigo.canonical);
      expect(canonical).toMatch(/^https:\/\/dev\.to\/sertaoseracloud\//);
    }
  });

  it("18. página do artigo: um único <h1>, texto completo, JSON-LD BlogPosting e lang nos artigos em inglês", () => {
    for (const artigo of artigos.slice(0, 10)) {
      const h = readFileSync(join(DIST_DIR, "blog", artigo.slug, "index.html"), "utf-8");
      expect(countMatches(h, /<h1[\s>]/gi), artigo.slug).toBe(1);
      expect(h).toContain('class="artigo-corpo"');
      expect(h.length).toBeGreaterThan(2000);
      const ld = JSON.parse(h.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i)![1]);
      expect(ld["@type"]).toBe("BlogPosting");
      expect(ld.mainEntityOfPage).toBe(artigo.canonical);
      if (artigo.language !== "pt") expect(h).toMatch(new RegExp(`<article class="artigo"[^>]*lang="${artigo.language}"`));
      // Sem os botões de tela cheia do dev.to (só funcionam lá).
      expect(h).not.toContain("js-fullscreen-code-action");
    }
  });

  it("19. o sitemap não lista as páginas do blog (a página oficial é a do dev.to)", () => {
    const sitemap = readFileSync(join(DIST_DIR, "sitemap-0.xml"), "utf-8");
    expect(sitemap).not.toContain("/blog/");
  });
});
