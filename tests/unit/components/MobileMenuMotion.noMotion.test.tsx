// tests/unit/components/MobileMenuMotion.noMotion.test.tsx
// GAP-3: MOT-02 — MobileMenuMotion respects prefers-reduced-motion
// Separate file because the main test file hard-codes motionEnabled=true.
// This file mocks motionEnabled=false and verifies the fallback <nav> path.

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, act, cleanup } from "@testing-library/react";

// motionEnabled=false → component must render the plain <nav>, not motion.nav.
vi.mock("motion/react", () => ({
  motion: {
    nav: React.forwardRef(
      (
        props: React.HTMLAttributes<HTMLElement> & {
          initial?: unknown;
          animate?: unknown;
          transition?: unknown;
          "aria-hidden"?: boolean | string;
          "aria-label"?: string;
        },
        ref: React.Ref<HTMLElement>
      ) => {
        const { initial: _i, animate: _a, transition: _t, ...rest } = props;
        // Attach data-testid to distinguish motion.nav from plain nav in assertions
        return React.createElement("nav", { ...rest, ref, "data-motion": "true" });
      }
    ),
    div: "div",
  },
  useReducedMotion: () => true,
}));

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [false, vi.fn()],
  applyFallback: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { MobileMenuMotion } from "../../../src/components/MobileMenuMotion";

afterEach(() => {
  cleanup();
});

describe("MobileMenuMotion — no-motion path (MOT-02)", () => {
  it("renders a <nav> element without throwing when motionEnabled=false", () => {
    expect(() => {
      render(React.createElement(MobileMenuMotion, {}));
    }).not.toThrow();

    const nav = document.querySelector("nav");
    expect(nav).toBeTruthy();
  });

  it("renders the fallback plain <nav>, NOT motion.nav, when motionEnabled=false", () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");
    expect(nav).toBeTruthy();
    // The fallback nav must NOT have data-motion="true" (that attribute is only on mock motion.nav)
    expect(nav?.getAttribute("data-motion")).toBeNull();
  });

  it("fallback nav starts with aria-hidden='true' (menu closed by default)", () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("aria-hidden")).toBe("true");
  });

  it("fallback nav has correct aria-label for accessibility", () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("aria-label")).toBe("Mobile navigation menu");
  });

  it("toggle-menu CustomEvent opens the fallback nav: aria-hidden removed", async () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");

    // Starts closed
    expect(nav?.getAttribute("aria-hidden")).toBe("true");

    // Open via CustomEvent
    await act(async () => {
      window.dispatchEvent(new CustomEvent("toggle-menu"));
    });

    // After open: aria-hidden should be absent (undefined → not set)
    expect(nav?.hasAttribute("aria-hidden")).toBe(false);
  });

  it("children are rendered inside the fallback nav", () => {
    const { container } = render(
      React.createElement(
        MobileMenuMotion,
        {},
        React.createElement("a", { href: "#section" }, "Link de navegação")
      )
    );
    const link = container.querySelector("nav a[href='#section']");
    expect(link).toBeTruthy();
    expect(link?.textContent).toBe("Link de navegação");
  });
});
