import { describe, it, expect } from "vitest";
import { z } from "zod";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Fixture paths (relative to project root)
const FIXTURES_DIR = resolve("tests/fixtures/content/sections");

// ── Zod schemas ────────────────────────────────────────────────────────────────

const heroSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(160),
  eyebrow: z.string(),
  idx: z.string().optional(),
});

const faqSchema = z.object({
  questions: z
    .array(
      z.object({
        q: z.string(),
        a: z.string(),
      })
    )
    .min(1),
});

const pricingSchema = z.object({
  price: z.number(),
  currency: z.string().length(3),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function parseFixture(filename: string) {
  const raw = readFileSync(resolve(FIXTURES_DIR, filename), "utf-8");
  return matter(raw).data;
}

// ── Positive-path assertions ─────────────────────────────────────────────────

describe("Content collection schema validation — positive paths", () => {
  it("hero.md passes heroSchema", () => {
    const data = parseFixture("hero.md");
    const result = heroSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("faq.md passes faqSchema", () => {
    const data = parseFixture("faq.md");
    const result = faqSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("pricing.md passes pricingSchema", () => {
    const data = parseFixture("pricing.md");
    const result = pricingSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

// ── Negative (red-path) assertions ──────────────────────────────────────────

describe("Content collection schema validation — negative paths (Zod rejects invalid data)", () => {
  it("heroSchema rejects empty title (min(1) violation)", () => {
    const result = heroSchema.safeParse({ title: "", description: "Valid description", eyebrow: "TEST" });
    expect(result.success).toBe(false);
  });

  it("heroSchema rejects description exceeding 160 chars (max(160) violation)", () => {
    const result = heroSchema.safeParse({
      title: "Valid Title",
      description: "x".repeat(200),
      eyebrow: "TEST",
    });
    expect(result.success).toBe(false);
  });

  it("faqSchema rejects empty questions array (min(1) violation)", () => {
    const result = faqSchema.safeParse({ questions: [] });
    expect(result.success).toBe(false);
  });

  it("pricingSchema rejects non-numeric price", () => {
    const result = pricingSchema.safeParse({ price: "not-a-number", currency: "BRL" });
    expect(result.success).toBe(false);
  });
});
