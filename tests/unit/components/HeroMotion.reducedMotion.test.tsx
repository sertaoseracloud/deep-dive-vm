// tests/unit/components/HeroMotion.reducedMotion.test.tsx
// Caminho de child único (produção): respeita prefers-reduced-motion e aplica o stagger CSS.

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { HeroMotion } from "../../../src/components/HeroMotion";

const header = () =>
  React.createElement(
    "header",
    null,
    React.createElement("h1", null, "Título"),
    React.createElement("p", { className: "hero-sub" }, "Subtítulo")
  );

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("HeroMotion — child único", () => {
  it("aplica hero-stagger-item com atraso incremental quando há movimento", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false } as MediaQueryList);
    const { container } = render(React.createElement(HeroMotion, null, header()));
    const items = container.querySelectorAll<HTMLElement>(".hero-stagger-item");
    expect(items).toHaveLength(2);
    expect([...items].map((el) => el.style.animationDelay)).toEqual(["0ms", "120ms"]);
  });

  it("não anima nada quando o sistema pede menos movimento", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const { container } = render(React.createElement(HeroMotion, null, header()));
    expect(container.querySelectorAll(".hero-stagger-item")).toHaveLength(0);
  });
});
