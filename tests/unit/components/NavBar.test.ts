import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";

beforeAll(() => {
  if (!existsSync(join(PROJECT_ROOT, "dist/index.html"))) {
    execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
  }
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
});

describe("NavBar component", () => {
  it("renders a <nav> element", () => {
    expect(builtHtml).toContain("<nav");
    expect(builtHtml).toMatch(/<nav[^>]+class="nav"/);
  });

  it("at least one <a> link is present in the output", () => {
    expect(builtHtml).toMatch(/<a[^>]+href/);
  });

  it("nav has aria-label for accessibility", () => {
    expect(builtHtml).toContain('aria-label="Navegação principal"');
  });

  it("brand link to #top is present", () => {
    expect(builtHtml).toContain('href="#top"');
    expect(builtHtml).toContain('class="brand"');
  });

  it("nav-links section contains navigation anchors", () => {
    expect(builtHtml).toContain('class="nav-links"');
    expect(builtHtml).toContain('href="#metodo"');
    expect(builtHtml).toContain('href="#ementa"');
    expect(builtHtml).toContain('href="#faq"');
  });

  it("CTA button link to #investimento is present in nav", () => {
    expect(builtHtml).toContain('href="#investimento"');
    expect(builtHtml).toContain("nav-cta");
  });

  it("brand name text is present", () => {
    expect(builtHtml).toContain("O Sertao será Cloud");
  });
});
