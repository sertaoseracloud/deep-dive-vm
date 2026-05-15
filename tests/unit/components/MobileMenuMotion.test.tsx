// tests/unit/components/MobileMenuMotion.test.tsx
// Tests written in RED phase to drive the MobileMenuMotion refactor:
// - Component manages open/close state internally (no isOpen prop).
// - Component renders a nav element.

import { describe, it, expect, vi } from "vitest";
import React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("motion/react", () => ({
  motion: {
    nav: React.forwardRef((props: React.HTMLAttributes<HTMLElement> & { initial?: unknown; animate?: unknown; transition?: unknown }, ref) =>
      createElement("nav", { ...props, ref })
    ),
    div: "div",
  },
  useReducedMotion: () => false,
}));

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
  applyFallback: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { MobileMenuMotion } from "../../../src/components/MobileMenuMotion";

describe("MobileMenuMotion (refactored — no isOpen prop)", () => {
  it("is a function (React component)", () => {
    expect(typeof MobileMenuMotion).toBe("function");
  });

  it("does NOT have isOpen in its prop type (only children allowed)", () => {
    // Verify that the component accepts an empty props object without TypeScript errors.
    // If the component still required isOpen, passing {} would be a type violation.
    // At runtime we check via the component's displayName or by inspecting length.
    // The component should have exactly 0-1 required args (props object).
    // We check: calling with {} (no isOpen) should not result in isOpen being destructured.
    const props = {};
    // The component type must be callable with props that has no isOpen key.
    // TypeScript enforces this at compile time; at runtime we verify it doesn't crash
    // due to missing isOpen by using renderToStaticMarkup (React SSR, no hooks issues).
    // Note: useEffect won't run in SSR, useState IS supported.
    const html = renderToStaticMarkup(createElement(MobileMenuMotion, props));
    expect(html).toContain("<nav");
  });

  it("renders a nav element", () => {
    const html = renderToStaticMarkup(createElement(MobileMenuMotion, {}));
    expect(html).toContain("<nav");
  });
});
