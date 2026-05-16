import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let source = "";

beforeAll(() => {
  source = readFileSync(
    join(PROJECT_ROOT, "src/components/sections/Bonuses.astro"),
    "utf-8"
  );
});

// ---------------------------------------------------------------------------
// ANIM-05 — Bonuses.astro stagger markup validation
// Static analysis on the raw .astro source file (no Astro runtime needed).
// ---------------------------------------------------------------------------

describe("ANIM-05 — Bonuses.astro bonus-cards have data-stagger + incremental animation-delay", () => {
  it("source file is non-empty (sanity check)", () => {
    expect(source.trim().length).toBeGreaterThan(0);
  });

  it("data-stagger attribute appears exactly 3 times (one per bonus-card)", () => {
    const matches = source.match(/data-stagger/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(3);
  });

  it("animation-delay: 0ms appears exactly 1 time (first bonus-card)", () => {
    const matches = source.match(/animation-delay:\s*0ms/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("animation-delay: 80ms appears exactly 1 time (second bonus-card)", () => {
    const matches = source.match(/animation-delay:\s*80ms/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("animation-delay: 160ms appears exactly 1 time (third bonus-card)", () => {
    const matches = source.match(/animation-delay:\s*160ms/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("section element has data-reveal attribute", () => {
    // The section must have data-reveal so the IO script triggers stagger
    expect(source).toMatch(/<section[^>]+data-reveal/);
  });

  it("each bonus-card with data-stagger also carries an animation-delay inline style", () => {
    // Verify the three stagger elements each have an inline style with animation-delay
    const staggerPattern =
      /data-stagger\s+style="animation-delay:\s*\d+ms"/g;
    const matches = source.match(staggerPattern);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(3);
  });

  it("delays are strictly incremental: 0ms → 80ms → 160ms in document order", () => {
    const delayPattern = /animation-delay:\s*(\d+)ms/g;
    const delays: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = delayPattern.exec(source)) !== null) {
      delays.push(parseInt(match[1], 10));
    }
    // Filter only the three stagger delays (CSS section may have none)
    const staggerDelays = delays.filter((d) => [0, 80, 160].includes(d));
    expect(staggerDelays).toEqual([0, 80, 160]);
  });
});
