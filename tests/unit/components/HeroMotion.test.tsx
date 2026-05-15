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
});
