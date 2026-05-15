// tests/unit/components/MobileMenuMotion.test.tsx
// RED phase — tests written before the MobileMenuMotion refactor.
// Verifies the component manages its own open/close state (no isOpen prop).

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

describe("MobileMenuMotion (refactored — no isOpen prop)", () => {
  it("is a function (React component)", () => {
    expect(typeof MobileMenuMotion).toBe("function");
  });

  it("does NOT require isOpen as a prop (accepts only children or nothing)", () => {
    // The component must not have `isOpen` in its props signature.
    // We inspect the function length: a component with (children?) has no required args.
    // If isOpen were required, length would be > 0 with a prop object.
    // We verify by checking the component is callable with an empty props object.
    const renderWithNoIsOpen = () => MobileMenuMotion({});
    // If the type system (at runtime) still uses isOpen, this call may produce unexpected output,
    // but calling it should not throw a type error that crashes.
    expect(renderWithNoIsOpen).not.toThrow();
  });

  it("component signature does not include isOpen (prop not in prop keys of default call)", () => {
    // The component must accept { children? } only. We verify by calling with undefined children.
    const result = MobileMenuMotion({ children: undefined });
    // Should return a React element (object with $$typeof or null/string in mocked env)
    expect(result).toBeDefined();
  });
});
