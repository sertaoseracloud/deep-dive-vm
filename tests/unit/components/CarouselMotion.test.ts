// tests/unit/components/CarouselMotion.test.ts
// Existence test: asserts the CarouselMotion export is a React component (function).
// motion/react and motion are mocked to prevent browser-only API crashes in Vitest/happy-dom.

import { describe, it, expect, vi } from "vitest";

vi.mock("motion/react", () => ({
  motion: { div: "div", nav: "nav" },
  useReducedMotion: () => false,
}));

vi.mock("motion", () => ({
  animate: vi.fn(() => ({ pause: vi.fn(), play: vi.fn(), stop: vi.fn() })),
}));

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
  isMotionSupported: () => true,
  applyFallback: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { CarouselMotion } from "../../../src/components/CarouselMotion";

describe("CarouselMotion", () => {
  it("is a function (React component)", () => {
    expect(typeof CarouselMotion).toBe("function");
  });
});
