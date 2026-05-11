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

describe("Faq component", () => {
  it("renders FAQ section (non-empty)", () => {
    expect(builtHtml.trim()).not.toBe("");
  });

  it("FAQ section has id=faq", () => {
    expect(builtHtml).toContain('id="faq"');
    expect(builtHtml).toMatch(/section[^>]+id="faq"/);
  });

  it("contains at least one <summary> element (FAQ question container)", () => {
    expect(builtHtml).toContain("<summary");
    expect(builtHtml).toMatch(/<summary[^>]*>/);
  });

  it("contains <details> elements for FAQ items", () => {
    expect(builtHtml).toContain("<details");
    const detailsMatches = builtHtml.match(/<details[^>]*>/g) ?? [];
    expect(detailsMatches.length).toBeGreaterThan(0);
  });

  it("faq div container is present", () => {
    expect(builtHtml).toContain('class="faq"');
  });

  it("FAQ contains real question text about access/format", () => {
    expect(builtHtml).toContain("Como funciona o acesso");
  });

  it("FAQ eyebrow text is PERGUNTAS FREQUENTES", () => {
    expect(builtHtml).toContain("PERGUNTAS FREQUENTES");
  });

  it("plus indicator span is present in summary elements", () => {
    expect(builtHtml).toContain('class="plus"');
  });
});
