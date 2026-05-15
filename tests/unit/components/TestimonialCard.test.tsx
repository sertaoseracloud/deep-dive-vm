// tests/unit/components/TestimonialCard.test.tsx
// Cobre renderização completa do TestimonialCard com dados reais do Rafael M.

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
}));

import { TestimonialCard } from "../../../src/components/TestimonialCard";
import type { TestimonialData } from "../../../src/components/TestimonialCard";

const fixture: TestimonialData = {
  id: "rafael-m",
  initials: "RM",
  quote: "O módulo de Zero Trust e Bastion sozinho já pagou a mentoria.",
  name: "Rafael M.",
  role: "SR. CLOUD ENGINEER · FINTECH",
};

afterEach(() => {
  cleanup();
});

describe("TestimonialCard", () => {
  it("renderiza o quote do depoimento", () => {
    render(React.createElement(TestimonialCard, { data: fixture }));
    expect(
      screen.getByText(/O módulo de Zero Trust e Bastion/i)
    ).toBeTruthy();
  });

  it("renderiza as iniciais 'RM' no avatar", () => {
    render(React.createElement(TestimonialCard, { data: fixture }));
    expect(screen.getByText("RM")).toBeTruthy();
  });

  it("renderiza o nome 'Rafael M.'", () => {
    render(React.createElement(TestimonialCard, { data: fixture }));
    expect(screen.getByText("Rafael M.")).toBeTruthy();
  });

  it("renderiza o role contendo 'SR. CLOUD ENGINEER'", () => {
    render(React.createElement(TestimonialCard, { data: fixture }));
    expect(screen.getByText(/SR\. CLOUD ENGINEER/)).toBeTruthy();
  });

  it("renderiza 5 estrelas SVG", () => {
    const { container } = render(
      React.createElement(TestimonialCard, { data: fixture })
    );
    const stars = container.querySelectorAll(".stars svg");
    expect(stars.length).toBe(5);
  });
});
