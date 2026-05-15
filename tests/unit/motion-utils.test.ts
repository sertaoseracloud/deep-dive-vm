// tests/unit/motion-utils.test.ts
// RED: Tests written BEFORE src/lib/motion-utils.ts is created.
// Covers the behavioral contract from PLAN.md Task 2.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ------------------------------------------------------------------
// Mocks that must be set up before the module is imported.
// We use vi.mock with a factory to control "motion/react" entirely.
// ------------------------------------------------------------------
vi.mock("motion/react", () => ({
  useReducedMotion: vi.fn(),
}));

// ------------------------------------------------------------------
// Import the module under test AFTER mocks are registered.
// ------------------------------------------------------------------
import {
  MOTION_STORAGE_KEY,
  useMotionEnabled,
  setMotionEnabled,
  isMotionSupported,
  applyFallback,
} from "../../src/lib/motion-utils";
import { useReducedMotion } from "motion/react";
import { renderHook, act } from "@testing-library/react";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const mockUseReducedMotion = useReducedMotion as ReturnType<typeof vi.fn>;

function setupLocalStorage(value: string | null) {
  if (value === null) {
    localStorage.removeItem(MOTION_STORAGE_KEY);
  } else {
    localStorage.setItem(MOTION_STORAGE_KEY, value);
  }
}

// ------------------------------------------------------------------
// MOTION_STORAGE_KEY
// ------------------------------------------------------------------
describe("MOTION_STORAGE_KEY", () => {
  it("equals 'motionEnabled'", () => {
    expect(MOTION_STORAGE_KEY).toBe("motionEnabled");
  });
});

// ------------------------------------------------------------------
// isMotionSupported
// ------------------------------------------------------------------
describe("isMotionSupported()", () => {
  it("returns true in browser environment (window defined)", () => {
    // happy-dom defines window by default.
    expect(isMotionSupported()).toBe(true);
  });
});

// ------------------------------------------------------------------
// setMotionEnabled
// ------------------------------------------------------------------
describe("setMotionEnabled()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("writes JSON string 'true' for true", () => {
    setMotionEnabled(true);
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("true");
  });

  it("writes JSON string 'false' for false", () => {
    setMotionEnabled(false);
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("false");
  });
});

// ------------------------------------------------------------------
// applyFallback
// ------------------------------------------------------------------
describe("applyFallback()", () => {
  it("sets transition to 'all 150ms ease-out' on the element", () => {
    const el = document.createElement("div");
    applyFallback(el, {});
    expect(el.style.transition).toBe("all 150ms ease-out");
  });

  it("merges additional properties onto element.style", () => {
    const el = document.createElement("div");
    applyFallback(el, { transform: "translateX(0)" });
    expect(el.style.transform).toBe("translateX(0)");
    expect(el.style.transition).toBe("all 150ms ease-out");
  });
});

// ------------------------------------------------------------------
// useMotionEnabled hook
// ------------------------------------------------------------------
describe("useMotionEnabled()", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true (default) when localStorage has no entry and media query does not reduce", () => {
    setupLocalStorage(null);
    mockUseReducedMotion.mockReturnValue(false);

    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(true);
  });

  it("returns true when localStorage has 'true' and media query does not reduce", () => {
    setupLocalStorage("true");
    mockUseReducedMotion.mockReturnValue(false);

    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(true);
  });

  it("returns false when localStorage has 'false' regardless of media query", () => {
    setupLocalStorage("false");
    mockUseReducedMotion.mockReturnValue(false);

    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(false);
  });

  it("returns false when prefers-reduced-motion is reduce, regardless of localStorage 'true'", () => {
    setupLocalStorage("true");
    mockUseReducedMotion.mockReturnValue(true);

    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(false);
  });

  it("returns false when prefers-reduced-motion is reduce and localStorage is null", () => {
    setupLocalStorage(null);
    mockUseReducedMotion.mockReturnValue(true);

    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(false);
  });

  it("updates state when a storage event fires with new value", () => {
    setupLocalStorage("true");
    mockUseReducedMotion.mockReturnValue(false);

    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(true);

    act(() => {
      // Simulate cross-tab storage event changing the value to false
      localStorage.setItem(MOTION_STORAGE_KEY, "false");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: MOTION_STORAGE_KEY,
          newValue: "false",
          storageArea: localStorage,
        })
      );
    });

    expect(result.current[0]).toBe(false);
  });
});
