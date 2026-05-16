// tests/unit/components/SettingsToggle.test.ts
// Testes para SettingsToggle incluindo motion.span (motion/react mockado).

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";

// Mock motion/react: motion.span renderiza como <span> passando todas as props
vi.mock("motion/react", () => {
  const motionSpan = vi.fn(({ children, animate, transition, style, ...rest }: any) =>
    React.createElement("span", { "data-animate": JSON.stringify(animate), "data-transition": JSON.stringify(transition), style, ...rest }, children)
  );
  return {
    motion: {
      span: motionSpan,
    },
    MotionConfig: ({ children }: any) => children,
  };
});

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: vi.fn(() => [true, vi.fn()]),
  setMotionEnabled: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { SettingsToggle } from "../../../src/components/SettingsToggle";
import * as motionUtils from "../../../src/lib/motion-utils";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SettingsToggle", () => {
  it("is a function (React component)", () => {
    expect(typeof SettingsToggle).toBe("function");
  });

  // GAP-2: MOT-01 — SettingsToggle visual toggle renders
  it("renders the role=group container with the motion toggle checkbox inside", () => {
    const { container } = render(React.createElement(SettingsToggle));
    const group = container.querySelector('[role="group"]');
    expect(group).toBeTruthy();
    expect(group?.getAttribute("aria-label")).toBe("Controle de animações");

    // The toggle input (hidden checkbox) must exist
    const input = container.querySelector('input[type="checkbox"]#motion-toggle');
    expect(input).toBeTruthy();
  });

  it("toggle checkbox reflects motionEnabled=true (checked by default via mock)", () => {
    const { container } = render(React.createElement(SettingsToggle));
    const input = container.querySelector(
      'input[type="checkbox"]#motion-toggle'
    ) as HTMLInputElement | null;
    expect(input).toBeTruthy();
    // Mock returns [true, vi.fn()] so checked should be true
    expect(input?.checked).toBe(true);
  });

  it("renders the label with the Animações text span", () => {
    const { container } = render(React.createElement(SettingsToggle));
    const spans = Array.from(container.querySelectorAll("span"));
    const animacoesSpan = spans.find((s) => s.textContent === "Animações");
    expect(animacoesSpan).toBeTruthy();
  });

  // --- motion.span tests (RED — falham antes da implementação) ---

  describe("motion.span — indicador (bolinha branca)", () => {
    it("renderiza motion.span para o indicador", () => {
      vi.mocked(motionUtils.useMotionEnabled).mockReturnValue([true, vi.fn()]);
      const { container } = render(React.createElement(SettingsToggle));
      const indicator = container.querySelector("[data-testid='motion-indicator']");
      expect(indicator).not.toBeNull();
    });

    it("motion.span do indicador tem animate.x === 16 quando motionEnabled=true", () => {
      vi.mocked(motionUtils.useMotionEnabled).mockReturnValue([true, vi.fn()]);
      const { container } = render(React.createElement(SettingsToggle));
      const indicator = container.querySelector("[data-testid='motion-indicator']");
      expect(indicator).not.toBeNull();
      const animate = JSON.parse(indicator?.getAttribute("data-animate") ?? "{}");
      expect(animate.x).toBe(16);
    });

    it("motion.span do indicador tem animate.x === 0 quando motionEnabled=false", () => {
      vi.mocked(motionUtils.useMotionEnabled).mockReturnValue([false, vi.fn()]);
      const { container } = render(React.createElement(SettingsToggle));
      const indicator = container.querySelector("[data-testid='motion-indicator']");
      expect(indicator).not.toBeNull();
      const animate = JSON.parse(indicator?.getAttribute("data-animate") ?? "{}");
      expect(animate.x).toBe(0);
    });
  });

  describe("motion.span — label 'Animações'", () => {
    it("motion.span do label 'Animações' existe", () => {
      vi.mocked(motionUtils.useMotionEnabled).mockReturnValue([true, vi.fn()]);
      const { container } = render(React.createElement(SettingsToggle));
      const label = container.querySelector("[data-testid='motion-label']");
      expect(label).not.toBeNull();
    });

    it("motion.span do label tem animate.opacity === 1 quando motionEnabled=true", () => {
      vi.mocked(motionUtils.useMotionEnabled).mockReturnValue([true, vi.fn()]);
      const { container } = render(React.createElement(SettingsToggle));
      const label = container.querySelector("[data-testid='motion-label']");
      expect(label).not.toBeNull();
      const animate = JSON.parse(label?.getAttribute("data-animate") ?? "{}");
      expect(animate.opacity).toBe(1);
    });

    it("motion.span do label tem animate.opacity === 0.4 quando motionEnabled=false", () => {
      vi.mocked(motionUtils.useMotionEnabled).mockReturnValue([false, vi.fn()]);
      const { container } = render(React.createElement(SettingsToggle));
      const label = container.querySelector("[data-testid='motion-label']");
      expect(label).not.toBeNull();
      const animate = JSON.parse(label?.getAttribute("data-animate") ?? "{}");
      expect(animate.opacity).toBe(0.4);
    });
  });
});
