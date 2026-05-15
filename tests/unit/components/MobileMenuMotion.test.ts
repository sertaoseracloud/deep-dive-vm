// tests/unit/components/MobileMenuMotion.test.ts
// Existence test: asserts the MobileMenuMotion export is a React component (function).
// motion/react is mocked to prevent browser-only API crashes in Vitest/happy-dom.

import { describe, it, expect, vi } from "vitest";

vi.mock("motion/react", () => ({
  motion: { nav: "nav", div: "div" },
  useReducedMotion: () => false,
}));

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
  applyFallback: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { MobileMenuMotion } from "../../../src/components/MobileMenuMotion";

describe("MobileMenuMotion", () => {
  it("is a function (React component)", () => {
    expect(typeof MobileMenuMotion).toBe("function");
  });
});
