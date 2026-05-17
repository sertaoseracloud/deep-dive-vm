import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";

beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/deep-dive-vm/index.html"), "utf-8");
});

describe("Hero component", () => {
  it("renders exactly one <h1> in the full page output", () => {
    const h1Matches = builtHtml.match(/<h1[^>]*>/g) ?? [];
    expect(h1Matches.length).toBe(1);
  });

  it("<h1> text content is non-empty", () => {
    const match = builtHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    expect(match).not.toBeNull();
    const content = match![1].replace(/<[^>]+>/g, "").trim();
    expect(content.length).toBeGreaterThan(0);
  });

  it("at least one <a> button/link exists in the hero section", () => {
    // Hero section contains multiple CTA links
    expect(builtHtml).toMatch(/<a[^>]+href="#investimento"/);
  });

  it("hero section has id=top", () => {
    expect(builtHtml).toContain('id="top"');
  });

  it("hero has class hero", () => {
    expect(builtHtml).toMatch(/class="hero"/);
  });

  it("hero contains primary CTA (Quero ser Arquiteto de Nuvem)", () => {
    expect(builtHtml).toContain("Quero ser Arquiteto de Nuvem");
  });

  it("hero contains ghost CTA (Ver Ementa Completa)", () => {
    expect(builtHtml).toContain("Ver Ementa Completa");
  });

  it("hero-title h1 class is present", () => {
    expect(builtHtml).toContain("hero-title");
  });

  it("hero-points list items are present", () => {
    expect(builtHtml).toContain("hero-points");
  });
});
