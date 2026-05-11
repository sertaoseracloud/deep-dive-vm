import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, basename, extname } from "node:path";

const FIXTURES_SECTIONS_DIR = resolve("tests/fixtures/content/sections");

/**
 * Derives a URL slug from a fixture file path.
 * Strips the directory prefix and .md extension, lowercases the result.
 * Example: "hero.md" → "hero"
 */
function deriveSlug(filename: string): string {
  return basename(filename, extname(filename)).toLowerCase();
}

function getFixtureFiles(): string[] {
  return readdirSync(FIXTURES_SECTIONS_DIR).filter((f) => f.endsWith(".md"));
}

describe("Route generation — slug derivation", () => {
  it("each fixture derives a non-empty lowercase slug with no spaces", () => {
    const files = getFixtureFiles();
    expect(files.length).toBeGreaterThan(0);

    for (const filename of files) {
      const slug = deriveSlug(filename);
      expect(slug.length).toBeGreaterThan(0);
      expect(slug).toBe(slug.toLowerCase());
      expect(slug).not.toContain(" ");
    }
  });

  it("slugs are unique across all fixtures", () => {
    const files = getFixtureFiles();
    const slugs = files.map(deriveSlug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });
});

describe("Route generation — idempotency", () => {
  it("parsing each fixture twice produces identical frontmatter data", () => {
    const files = getFixtureFiles();
    expect(files.length).toBeGreaterThan(0);

    for (const filename of files) {
      const filePath = resolve(FIXTURES_SECTIONS_DIR, filename);
      const raw = readFileSync(filePath, "utf-8");

      const parse1 = matter(raw).data;
      const parse2 = matter(raw).data;

      expect(parse1).toEqual(parse2);
    }
  });
});
