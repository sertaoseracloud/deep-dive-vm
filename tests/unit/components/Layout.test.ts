import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let hubHtml = "";
let a11yHtml = "";

beforeAll(() => {
  const hubPath = join(PROJECT_ROOT, "dist/index.html");
  const a11yPath = join(PROJECT_ROOT, "dist/acessibilidade/index.html");
  if (!existsSync(hubPath) || !existsSync(a11yPath)) {
    throw new Error(`dist/ files not found. Run 'npm run build' before running Layout tests.\nExpected: ${hubPath}`);
  }
  hubHtml = readFileSync(hubPath, "utf-8");
  a11yHtml = readFileSync(a11yPath, "utf-8");
});

const meta = (html: string, nome: string) =>
  (html.match(new RegExp(`(?:property|name)="${nome}"[^>]+content="([^"]+)"`)) ??
    html.match(new RegExp(`content="([^"]+)"[^>]*(?:property|name)="${nome}"`)))?.[1];

describe("Layout component", () => {
  it("title appears in <title> tag", () => {
    expect(hubHtml).toMatch(/<title[^>]*>.*Cláudio Rapôso.*<\/title>/s);
  });

  it("description appears in meta description content", () => {
    expect(meta(hubHtml, "description")).toContain("DivergePython");
  });

  it("Open Graph og:title and og:type=website are present", () => {
    expect(meta(hubHtml, "og:title")).toBeTruthy();
    expect(meta(hubHtml, "og:type")).toBe("website");
  });

  it("Twitter card and creator are present", () => {
    expect(meta(hubHtml, "twitter:card")).toBe("summary_large_image");
    expect(meta(hubHtml, "twitter:creator")).toBe("@sertaoseracloud");
  });

  it("<html lang=pt-BR>, charset utf-8 and viewport are set", () => {
    expect(hubHtml).toContain('lang="pt-BR"');
    expect(hubHtml).toMatch(/<meta charset="utf-8"/);
    expect(hubHtml).toContain("width=device-width");
  });

  it("hub og:image points to hub-og.png", () => {
    expect(meta(hubHtml, "og:image")).toContain("hub-og.png");
  });

  it("hub og:url points to root and the hub is indexable", () => {
    expect(meta(hubHtml, "og:url")).toBe("https://mentoria.sertaoseracloud.com/");
    expect(hubHtml).not.toMatch(/name=["']robots["'][^>]+noindex/i);
  });

  it("keywords and image alt no longer mention the removed landing pages", () => {
    for (const html of [hubHtml, a11yHtml]) {
      expect(html).not.toContain("Deep Dive Azure VM");
      expect(html).not.toContain("data-reveal");
    }
  });
});
