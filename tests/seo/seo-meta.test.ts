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
const DIST_INDEX = join(__dirname, "../../dist/deep-dive-vm/index.html");
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

  it("10. All <img> tags have a non-empty alt attribute", () => {
    // Find all <img> tags
    const imgTags = html.match(/<img[^>]*>/gi) ?? [];

    // Guard: ensure the page actually has img elements so the loop does not pass vacuously
    expect(imgTags.length).toBeGreaterThan(0);

    for (const tag of imgTags) {
      const altMatch = tag.match(/alt=["']([^"']*)["']/i);
      expect(altMatch).not.toBeNull();
      expect(altMatch![1].trim().length).toBeGreaterThan(0);
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
});
