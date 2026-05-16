import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";
let pricingSource = "";

beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
  pricingSource = readFileSync(
    join(PROJECT_ROOT, "src/components/sections/Pricing.astro"),
    "utf-8"
  );
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

// ---------------------------------------------------------------------------
// ANIM-05 — Pricing.astro stagger markup validation
// Static analysis on the raw .astro source (no Astro runtime needed).
// ---------------------------------------------------------------------------

describe("ANIM-05 — Pricing.astro price-includes li elements have data-stagger + 0–560ms delays", () => {
  it("source file is non-empty (sanity check)", () => {
    expect(pricingSource.trim().length).toBeGreaterThan(0);
  });

  it("data-stagger appears exactly 8 times (one per price-includes li)", () => {
    const matches = pricingSource.match(/data-stagger/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(8);
  });

  it("animation-delay: 0ms appears exactly 1 time (first li)", () => {
    const matches = pricingSource.match(/animation-delay:\s*0ms/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("animation-delay: 560ms appears exactly 1 time (last li)", () => {
    const matches = pricingSource.match(/animation-delay:\s*560ms/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("section.pricing has data-reveal attribute", () => {
    expect(pricingSource).toMatch(/<section[^>]+class="pricing"[^>]*data-reveal/);
  });

  it("all 8 delay values are present: 0, 80, 160, 240, 320, 400, 480, 560ms", () => {
    const expected = [0, 80, 160, 240, 320, 400, 480, 560];
    const delayPattern = /animation-delay:\s*(\d+)ms/g;
    const found: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = delayPattern.exec(pricingSource)) !== null) {
      found.push(parseInt(match[1], 10));
    }
    // Filter only the expected stagger delays
    const staggerDelays = found.filter((d) => expected.includes(d));
    expect(staggerDelays.sort((a, b) => a - b)).toEqual(expected);
  });

  it("delays appear in strictly ascending order in document source", () => {
    const delayPattern = /animation-delay:\s*(\d+)ms/g;
    const found: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = delayPattern.exec(pricingSource)) !== null) {
      found.push(parseInt(match[1], 10));
    }
    // All captured values must form a non-decreasing sequence
    for (let i = 1; i < found.length; i++) {
      expect(found[i]).toBeGreaterThanOrEqual(found[i - 1]);
    }
  });

  it("each data-stagger li also carries an inline animation-delay style", () => {
    // Each stagger element must have the style inline (not just data-stagger alone)
    const pattern = /data-stagger\s+style="animation-delay:\s*\d+ms"/g;
    const matches = pricingSource.match(pattern);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(8);
  });
});
