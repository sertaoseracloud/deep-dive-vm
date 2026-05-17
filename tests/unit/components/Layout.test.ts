import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";
let hubHtml = "";

beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/deep-dive-vm/index.html"), "utf-8");
  hubHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
});

describe("Layout component", () => {
  it("title appears in <title> tag", () => {
    expect(builtHtml).toMatch(/<title[^>]*>.*Deep Dive Azure VM.*<\/title>/s);
  });

  it("description appears in meta description content", () => {
    expect(builtHtml).toMatch(/name="description"[^>]+content="[^"]+"/);
    // Actual description from index page
    expect(builtHtml).toContain("Formação de 54h");
  });

  it("Open Graph og:title meta tag is present", () => {
    expect(builtHtml).toContain("og:title");
    expect(builtHtml).toMatch(/property="og:title"/);
  });

  it("Open Graph og:type meta tag is present and equals website", () => {
    expect(builtHtml).toContain("og:type");
    expect(builtHtml).toContain("website");
    expect(builtHtml).toMatch(/property="og:type"[^>]+content="website"/);
  });

  it("Twitter card meta tag is present", () => {
    expect(builtHtml).toContain("twitter:card");
    expect(builtHtml).toMatch(/name="twitter:card"/);
  });

  it("<html lang=pt-BR> attribute is set", () => {
    expect(builtHtml).toContain('lang="pt-BR"');
  });

  it("charset utf-8 is declared in head", () => {
    expect(builtHtml).toMatch(/<meta charset="utf-8"/);
  });

  it("viewport meta tag is present", () => {
    expect(builtHtml).toContain("viewport");
    expect(builtHtml).toContain("width=device-width");
  });

  it("og:image meta tag is present", () => {
    expect(builtHtml).toContain("og:image");
  });

  it("twitter:creator meta tag is present", () => {
    expect(builtHtml).toContain("twitter:creator");
    expect(builtHtml).toContain("@sertaoseracloud");
  });

  it("hub og:image points to hub-og.png (not claudio1)", () => {
    const ogImageMatch =
      hubHtml.match(/property="og:image"[^>]+content="([^"]+)"/) ??
      hubHtml.match(/content="([^"]+)"[^>]*property="og:image"/);
    const content = ogImageMatch?.[1];
    expect(content).toBeTruthy();
    expect(content).toContain("hub-og.png");
    expect(content).not.toContain("claudio1");
  });

  it("LP og:image still uses claudio1 (not hub-og.png)", () => {
    expect(builtHtml).toContain("og:image");
    expect(builtHtml).not.toContain("hub-og.png");
  });

  it("LP does not contain noindex meta", () => {
    expect(builtHtml).not.toMatch(/name=["']robots["'][^>]+noindex/i);
  });
});
