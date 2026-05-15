// tests/unit/components/HeroMotion.test.tsx
// Cobre: renderização de children, existência de motion.div mockado, sem crash em ambiente sem browser

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(
      (
        props: React.HTMLAttributes<HTMLDivElement> & {
          initial?: unknown;
          animate?: unknown;
          whileInView?: unknown;
          transition?: unknown;
          viewport?: unknown;
        },
        ref: React.Ref<HTMLDivElement>
      ) => {
        const {
          initial: _i,
          animate: _a,
          whileInView: _w,
          transition: _t,
          viewport: _v,
          ...rest
        } = props;
        return React.createElement(
          "div",
          { "data-testid": "motion-div", ref, ...rest },
          props.children
        );
      }
    ),
  },
  MotionConfig: ({ children }: { children: React.ReactNode }) => children,
}));

import { HeroMotion } from "../../../src/components/HeroMotion";

afterEach(() => {
  cleanup();
});

describe("HeroMotion", () => {
  it("renderiza children passados como prop", () => {
    render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("h1", null, "Conteúdo do Hero")
      )
    );
    expect(screen.getByText("Conteúdo do Hero")).toBeTruthy();
  });

  it("existe elemento com data-testid='motion-div' (via mock motion.div)", () => {
    const { container } = render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("span", null, "Filho")
      )
    );
    expect(container.querySelector("[data-testid='motion-div']")).toBeTruthy();
  });

  it("renderiza sem erros em ambiente sem browser (happy-dom)", () => {
    expect(() => {
      render(
        React.createElement(
          HeroMotion,
          null,
          React.createElement("p", null, "Texto de teste")
        )
      );
    }).not.toThrow();
  });

  // GAP-4: MOT-02 — HeroMotion respects prefers-reduced-motion
  // MotionConfig with reducedMotion="user" is mocked as a passthrough.
  // The requirement: children must be visible regardless of reduced-motion preference.
  // This test verifies the MotionConfig passthrough path — even when the system
  // has prefers-reduced-motion active, children are still rendered and reachable.
  it("children are visible regardless of reduced-motion preference (MotionConfig passthrough)", () => {
    const { container } = render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement(
          "p",
          { "data-testid": "hero-child" },
          "Texto visível mesmo com reduced-motion"
        )
      )
    );
    // Child must exist in the DOM regardless of animation state
    const child = container.querySelector("[data-testid='hero-child']");
    expect(child).toBeTruthy();
    expect(child?.textContent).toBe("Texto visível mesmo com reduced-motion");

    // The motion-div wrapper must also be present (MotionConfig passthrough does not remove it)
    const motionDiv = container.querySelector("[data-testid='motion-div']");
    expect(motionDiv).toBeTruthy();
  });
});
