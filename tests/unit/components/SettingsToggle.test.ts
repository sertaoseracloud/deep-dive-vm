// tests/unit/components/SettingsToggle.test.ts
// Existence test: asserts the SettingsToggle export is a React component (function).
// motion-utils is mocked to avoid React hook context requirements in pure import tests.

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
  setMotionEnabled: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { SettingsToggle } from "../../../src/components/SettingsToggle";

afterEach(() => {
  cleanup();
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
});
