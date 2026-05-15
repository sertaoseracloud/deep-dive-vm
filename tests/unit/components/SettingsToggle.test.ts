// tests/unit/components/SettingsToggle.test.ts
// Existence test: asserts the SettingsToggle export is a React component (function).
// motion-utils is mocked to avoid React hook context requirements in pure import tests.

import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
  setMotionEnabled: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { SettingsToggle } from "../../../src/components/SettingsToggle";

describe("SettingsToggle", () => {
  it("is a function (React component)", () => {
    expect(typeof SettingsToggle).toBe("function");
  });
});
