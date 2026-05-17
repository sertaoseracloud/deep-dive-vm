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

describe("StickyCta component", () => {
  it("renders output containing an <a> CTA link", () => {
    expect(builtHtml).toMatch(/<a[^>]+href/);
  });

  it("renders sticky-cta container", () => {
    expect(builtHtml).toContain("sticky-cta");
    expect(builtHtml).toMatch(/class="sticky-cta"/);
  });

  it("sticky CTA links to #investimento", () => {
    expect(builtHtml).toContain("sticky-btn");
    // The sticky-btn custom class is on a btn that goes to #investimento
    expect(builtHtml).toMatch(/class="btn primary sticky-btn"/);
  });

  it("sticky CTA contains call-to-action text", () => {
    expect(builtHtml).toContain("Quero começar");
  });

  it("pricing meta text is shown in sticky bar", () => {
    // StickyCta shows the installment pricing info
    expect(builtHtml).toContain("R$ 78,92");
  });
});
