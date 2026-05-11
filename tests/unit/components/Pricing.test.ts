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

describe("Pricing component", () => {
  it("renders pricing section output (non-empty)", () => {
    expect(builtHtml.trim()).not.toBe("");
  });

  it("pricing section has id=investimento", () => {
    expect(builtHtml).toContain('id="investimento"');
    expect(builtHtml).toMatch(/section[^>]+id="investimento"/);
  });

  it("at least one CTA <a> element present", () => {
    expect(builtHtml).toMatch(/<a[^>]+href/);
  });

  it("price-card element is present", () => {
    expect(builtHtml).toContain("price-card");
  });

  it("price in BRL is shown (R$)", () => {
    expect(builtHtml).toContain("R$");
  });

  it("installment price 12x is present", () => {
    expect(builtHtml).toContain("12×");
    expect(builtHtml).toContain("78");
  });

  it("PIX full price R$ 947 is present", () => {
    expect(builtHtml).toContain("R$ 947");
  });

  it("Hotmart payment platform mention is present", () => {
    expect(builtHtml).toContain("Hotmart");
  });

  it("7-day guarantee is mentioned", () => {
    expect(builtHtml).toContain("7 dias");
    expect(builtHtml).toContain("Garantia");
  });

  it("price-includes list is present", () => {
    expect(builtHtml).toContain("price-includes");
  });
});
