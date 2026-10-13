// tests/unit/lib/motion-utils.test.ts
// Unit tests for all five motion-utils exports, including renderHook coverage for useMotionEnabled.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { renderHook, act } from "@testing-library/react";
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
  it("sets transition to 'all 150ms cubic-bezier(0.0, 0.0, 0.2, 1)' on the target element", () => {
    const el = document.createElement("div");
    applyFallback(el, { color: "red" });
    expect(el.style.transition).toBe("all 150ms cubic-bezier(0.0, 0.0, 0.2, 1)");
    expect(el.style.color).toBe("red");
  });
});

// ---------------------------------------------------------------------------
// useMotionEnabled hook (via renderHook from @testing-library/react)
// useMotionEnabled now returns a tuple: [boolean, (value: boolean) => void]
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
    expect(result.current[0]).toBe(true);
  });

  it("returns false when localStorage has motionEnabled='false'", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "false");
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(false);
  });

  it("returns false when prefers-reduced-motion is active (overrides localStorage 'true')", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "true");
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(false);
  });

  it("returns a setter function as the second element of the tuple", () => {
    const { result } = renderHook(() => useMotionEnabled());
    expect(typeof result.current[1]).toBe("function");
  });

  it("ignores non-boolean localStorage values and uses default true", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "123");
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Robustez: storage indisponível, valores corrompidos e sincronização entre abas
// ---------------------------------------------------------------------------
describe("useMotionEnabled() — persistência e sincronização entre abas", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  const dispatchStorage = (key: string | null, newValue: string | null) =>
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
    });

  it("usa o padrão true quando o valor salvo não é JSON válido", () => {
    localStorage.setItem(MOTION_STORAGE_KEY, "{corrompido");
    const { result } = renderHook(() => useMotionEnabled());
    expect(result.current[0]).toBe(true);
  });

  it("setter atualiza o estado e persiste no localStorage", () => {
    const { result } = renderHook(() => useMotionEnabled());
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("false");
  });

  it("aplica o valor booleano gravado por outra aba", () => {
    const { result } = renderHook(() => useMotionEnabled());
    dispatchStorage(MOTION_STORAGE_KEY, "false");
    expect(result.current[0]).toBe(false);
  });

  it("ignora eventos de outras chaves, remoção da chave e valores inválidos", () => {
    const { result } = renderHook(() => useMotionEnabled());
    dispatchStorage("outraChave", "false");
    dispatchStorage(MOTION_STORAGE_KEY, null);
    dispatchStorage(MOTION_STORAGE_KEY, "{corrompido");
    dispatchStorage(MOTION_STORAGE_KEY, "123");
    expect(result.current[0]).toBe(true);
  });

  it("remove o listener de storage ao desmontar", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useMotionEnabled());
    unmount();
    expect(spy).toHaveBeenCalledWith("storage", expect.any(Function));
  });
});

describe("setMotionEnabled() — storage bloqueado", () => {
  it("não lança erro quando o localStorage recusa a escrita", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(() => setMotionEnabled(true)).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe("applyFallback() — prefers-reduced-motion", () => {
  it("não aplica transição quando o sistema pede menos movimento", () => {
    const spy = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    const el = document.createElement("div");
    applyFallback(el, { color: "blue" });
    expect(el.style.transition).toBe("");
    expect(el.style.color).toBe("blue");
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// SSR: sem window (renderização no servidor do Astro)
// ---------------------------------------------------------------------------
describe("SSR (window indefinido)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("isMotionSupported() retorna false e applyFallback() não toca no elemento", () => {
    const el = document.createElement("div");
    vi.stubGlobal("window", undefined);
    expect(isMotionSupported()).toBe(false);
    applyFallback(el, { color: "red" });
    vi.unstubAllGlobals();
    expect(el.style.color).toBe("");
  });

  it("useMotionEnabled() renderiza desligado no servidor", () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const Probe = () => React.createElement("span", null, String(useMotionEnabled()[0]));
    vi.stubGlobal("window", undefined);
    const html = renderToString(React.createElement(Probe));
    vi.unstubAllGlobals();
    expect(html).toContain("false");
  });
});
