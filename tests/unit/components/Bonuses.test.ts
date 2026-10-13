import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let source = "";
let bonusSection = "";

beforeAll(() => {
  source = readFileSync(
    join(PROJECT_ROOT, "src/components/sections/Bonuses.astro"),
    "utf-8"
  );
  // Bonuses.astro é data-driven (cards vêm de props): a marcação final só
  // existe no HTML gerado, então o stagger é validado no build da LP VM.
  const builtHtml = readFileSync(
    join(PROJECT_ROOT, "dist/deep-dive-vm/index.html"),
    "utf-8"
  );
  const start = builtHtml.indexOf('id="bonus"');
  bonusSection = builtHtml.slice(start, builtHtml.indexOf("</section>", start));
});

// ---------------------------------------------------------------------------
// ANIM-05 — Bonuses stagger markup validation (built output of /deep-dive-vm/)
// ---------------------------------------------------------------------------

describe("ANIM-05 — Bonuses.astro bonus-cards have data-stagger + incremental animation-delay", () => {
  it("source file is non-empty (sanity check)", () => {
    expect(source.trim().length).toBeGreaterThan(0);
  });

  it("section element has data-reveal attribute", () => {
    // The section must have data-reveal so the IO script triggers stagger
    expect(source).toMatch(/<section[^>]+data-reveal/);
  });

  it("bonus section is present in the built LP", () => {
    expect(bonusSection.length).toBeGreaterThan(0);
  });

  it("every bonus-card carries data-stagger with an inline animation-delay", () => {
    const cards = bonusSection.match(/<div class="bonus-card[^"]*"[^>]*>/g) ?? [];
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card).toMatch(/data-stagger\s+style="animation-delay:\s*\d+ms"/);
    }
  });

  it("delays are strictly incremental: 0ms → 80ms → 160ms in document order", () => {
    const delays = [...bonusSection.matchAll(/animation-delay:\s*(\d+)ms/g)].map(
      (m) => parseInt(m[1], 10)
    );
    expect(delays).toEqual([0, 80, 160]);
  });
});
