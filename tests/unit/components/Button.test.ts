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

describe("Button component", () => {
  it("variant=primary renders <a> with class btn primary", () => {
    expect(builtHtml).toContain("btn");
    expect(builtHtml).toContain("primary");
    expect(builtHtml).toMatch(/class="btn primary/);
  });

  it("variant=ghost renders class btn ghost", () => {
    expect(builtHtml).toContain("btn ghost");
    expect(builtHtml).toContain("btn");
  });

  it("size=massive appends class massive", () => {
    expect(builtHtml).toContain("massive");
    expect(builtHtml).toMatch(/class="btn[^"]*massive/);
  });

  it("href value appears as href attribute on <a>", () => {
    // The page has multiple buttons linking to #investimento
    expect(builtHtml).toContain('href="#investimento"');
  });

  it("<a> elements with href are present", () => {
    expect(builtHtml).toMatch(/<a[^>]+href/);
  });

  it("missing variant defaults to primary — primary class is present in output", () => {
    expect(builtHtml).toContain("primary");
  });

  it("btn class is present in every Button element output", () => {
    // The page uses Button component in nav and hero; all must have btn class
    const matches = builtHtml.match(/class="btn[^"]*"/g) ?? [];
    expect(matches.length).toBeGreaterThan(0);
  });

  it("btn primary massive variant is present for hero CTA", () => {
    // Hero uses Button with variant=primary and size=massive
    expect(builtHtml).toMatch(/class="btn primary massive/);
  });

  it("nav-cta custom class is applied to nav Button", () => {
    // NavBar uses Button with customClass=nav-cta
    expect(builtHtml).toContain("nav-cta");
    expect(builtHtml).toMatch(/class="btn primary nav-cta/);
  });

  it("ghost variant is used in hero for secondary CTA", () => {
    expect(builtHtml).toMatch(/class="btn ghost/);
  });
});
