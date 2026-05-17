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

describe("Footer component", () => {
  it("renders a <footer> element", () => {
    expect(builtHtml).toContain("<footer");
    expect(builtHtml).toMatch(/<footer[^>]+class="footer"/);
  });

  it("contains brand name text", () => {
    // Footer brand text appears in the footer
    expect(builtHtml).toContain("O Sertao será Cloud");
  });

  it("contains Raposo in footer disclaimer", () => {
    expect(builtHtml).toContain("Raposo");
  });

  it("contains copyright year in footer disclaimer", () => {
    // Regex robusto — não depende do ano atual em runtime (dist pode ser de ano anterior)
    expect(builtHtml).toMatch(/© 20\d{2}/);
  });

  it("footer-disclaimer div is present", () => {
    expect(builtHtml).toContain("footer-disclaimer");
  });

  it("footer-meta links are present (Termos, Privacidade, Suporte)", () => {
    expect(builtHtml).toContain("Termos");
    expect(builtHtml).toContain("Privacidade");
    expect(builtHtml).toContain("Suporte");
  });

  it("CNPJ or legal info is present in disclaimer", () => {
    expect(builtHtml).toContain("CNPJ");
  });
});
