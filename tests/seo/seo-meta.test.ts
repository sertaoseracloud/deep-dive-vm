import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

const DIST_INDEX = resolve("dist/index.html");

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
    expect(title).not.toBeNull();
    expect(title!.length).toBeLessThanOrEqual(60);
  });

  it("2. <meta name=description> content is present and between 10–160 chars", () => {
    const desc = extractMetaContent(html, "description");
    expect(desc).not.toBeNull();
    expect(desc!.length).toBeGreaterThanOrEqual(10);
    expect(desc!.length).toBeLessThanOrEqual(160);
  });

  it("3. <meta property=og:title> is present and non-empty", () => {
    const ogTitle = extractMetaContent(html, "og:title");
    expect(ogTitle).not.toBeNull();
    expect(ogTitle!.length).toBeGreaterThan(0);
  });

  it("4. <meta property=og:description> is present and non-empty", () => {
    const ogDesc = extractMetaContent(html, "og:description");
    expect(ogDesc).not.toBeNull();
    expect(ogDesc!.length).toBeGreaterThan(0);
  });

  it("5. <meta property=og:image> is present and non-empty", () => {
    const ogImage = extractMetaContent(html, "og:image");
    expect(ogImage).not.toBeNull();
    expect(ogImage!.length).toBeGreaterThan(0);
  });

  it("6. <meta property=og:type> is present and equals 'website'", () => {
    const ogType = extractMetaContent(html, "og:type");
    expect(ogType).toBe("website");
  });

  it("7. <meta name=twitter:card> is present and non-empty", () => {
    const twitterCard = extractMetaContent(html, "twitter:card");
    expect(twitterCard).not.toBeNull();
    expect(twitterCard!.length).toBeGreaterThan(0);
  });

  it("8. Exactly one <h1> tag in the document", () => {
    const h1Count = countMatches(html, /<h1[\s>]/gi);
    expect(h1Count).toBe(1);
  });

  it("9. <link rel=canonical> is present with a non-empty href", () => {
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)
      ?? html.match(/<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
    expect(canonicalMatch).not.toBeNull();
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
});
