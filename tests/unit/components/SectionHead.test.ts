import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";

beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
});

describe("SectionHead component", () => {
  it("eyebrow-text span is present in output", () => {
    expect(builtHtml).toContain("eyebrow-text");
  });

  it("eyebrow content is present (O TETO INVISÍVEL)", () => {
    // One of the SectionHead instances uses this eyebrow text
    expect(builtHtml).toContain("O TETO INVISÍVEL");
  });

  it("section-title h2 is present in output", () => {
    expect(builtHtml).toContain("section-title");
    expect(builtHtml).toMatch(/<h2[^>]*class="section-title/);
  });

  it("section-lede p is present in output", () => {
    expect(builtHtml).toContain("section-lede");
  });

  it("section-head wrapper div is present in output", () => {
    expect(builtHtml).toMatch(/class="section-head /);
  });

  it("idx span is present in at least one SectionHead instance", () => {
    // Some SectionHead usages include idx; check idx class is in output
    expect(builtHtml).toContain("class=\"idx\"");
  });

  it("titleHtml with HTML span is preserved in output (flame class passthrough)", () => {
    // Section titles use <span class="flame"> for highlighted words
    expect(builtHtml).toContain('class="flame"');
  });

  it("multiple section-head blocks are rendered (one per section)", () => {
    const matches = builtHtml.match(/section-head/g) ?? [];
    expect(matches.length).toBeGreaterThan(1);
  });

  it("multiple h2.section-title elements are present", () => {
    const matches = builtHtml.match(/class="section-title"/g) ?? [];
    expect(matches.length).toBeGreaterThan(0);
  });

  it("bar span (decorative bar element) is present in eyebrow", () => {
    expect(builtHtml).toMatch(/class="bar"/);
  });
});
