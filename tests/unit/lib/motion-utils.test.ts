// tests/unit/lib/motion-utils.test.ts
// Unit tests for all five motion-utils exports, including renderHook coverage for useMotionEnabled.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  MOTION_STORAGE_KEY,
  useMotionEnabled,
  setMotionEnabled,
  isMotionSupported,
  applyFallback,
} from "../../../src/lib/motion-utils";

// Mock motion/react before imports to control useReducedMotion
vi.mock("motion/react", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from "motion/react";

// ---------------------------------------------------------------------------
// MOTION_STORAGE_KEY
// ---------------------------------------------------------------------------
describe("MOTION_STORAGE_KEY", () => {
  it("equals 'motionEnabled'", () => {
    expect(MOTION_STORAGE_KEY).toBe("motionEnabled");
  });
});

// ---------------------------------------------------------------------------
// isMotionSupported
// ---------------------------------------------------------------------------
describe("isMotionSupported()", () => {
  it("returns true in browser environment (window is defined in happy-dom)", () => {
    expect(isMotionSupported()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setMotionEnabled
// ---------------------------------------------------------------------------
describe("setMotionEnabled()", () => {
  afterEach(() => localStorage.clear());

  it("writes JSON string 'true' to localStorage", () => {
    setMotionEnabled(true);
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("true");
  });

  it("writes JSON string 'false' to localStorage", () => {
    setMotionEnabled(false);
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("false");
  });
});

// ---------------------------------------------------------------------------
// applyFallback
// ---------------------------------------------------------------------------
describe("applyFallback()", () => {
  it("sets transition to 'all 150ms ease-out' on the target element", () => {
    const el = document.createElement("div");
    applyFallback(el, { color: "red" });
    expect(el.style.transition).toBe("all 150ms ease-out");
    expect(el.style.color).toBe("red");
  });
});

// ---------------------------------------------------------------------------
// useMotionEnabled hook (via renderHook from @testing-library/react)
// ---------------------------------------------------------------------------
describe("useMotionEnabled()", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.removeItem(MOTION_STORAGE_KEY);
    vi.restoreAllMocks();
  });

  it("returns true by default (no localStorage entry, no prefers-reduced-motion)", () => {
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current).toBe(true);
  });

  it("returns false when localStorage has motionEnabled='false'", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "false");
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current).toBe(false);
  });

  it("returns false when prefers-reduced-motion is active (overrides localStorage 'true')", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "true");
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current).toBe(false);
  });
});
