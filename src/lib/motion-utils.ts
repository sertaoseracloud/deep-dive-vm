// src/lib/motion-utils.ts
// Shared animation utilities consumed by all motion components.
// Replaces the legacy src/lib/motion.ts which imported from @motionone/dom.

import { useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "motion/react";

/** localStorage key used to persist the motion enabled preference. */
export const MOTION_STORAGE_KEY = "motionEnabled";

/**
 * React hook that returns whether animations should be enabled,
 * along with a setter that updates both React state and localStorage atomically.
 *
 * Priority (highest to lowest):
 *   1. prefers-reduced-motion system setting -- always overrides stored preference.
 *   2. localStorage value (user toggle).
 *   3. Default: true (animations on).
 *
 * SSR-safe: returns false when window is undefined.
 * Cross-tab sync: listens to the "storage" event.
 *
 * @returns Tuple [enabled, setter] where setter updates state + localStorage atomically.
 */
export function useMotionEnabled(): [boolean, (value: boolean) => void] {
  const prefersReduced = useReducedMotion();

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(MOTION_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "boolean") return parsed;
        // Valor invalido no localStorage -- usar padrao.
      }
    } catch {
      // Ignore JSON parse or storage access errors.
    }
    return true;
  });

  // Setter combinado: atualiza React state E localStorage atomicamente.
  const setAndPersist = useCallback((value: boolean) => {
    setEnabled(value);
    setMotionEnabled(value);
  }, []);

  // Cross-tab sync: update state when another tab writes to localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return; // guard SSR
    const handler = (event: StorageEvent) => {
      if (event.key !== MOTION_STORAGE_KEY) return;
      // Item deletado -- preservar estado atual em vez de reativar animacoes.
      if (event.newValue === null) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (typeof parsed === "boolean") {
          setEnabled(parsed);
        }
        // Valor invalido -- manter estado corrente.
      } catch {
        // Ignore malformed values -- leave current state.
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // prefers-reduced-motion always wins.
  if (prefersReduced) return [false, setAndPersist];
  return [enabled, setAndPersist];
}

/**
 * Persists the user's motion preference to localStorage.
 * Safe to call in environments where storage is unavailable.
 */
export function setMotionEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, JSON.stringify(enabled));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

/**
 * Returns true when running in a browser environment (window is defined).
 * Returns false during SSR/Node.
 */
export function isMotionSupported(): boolean {
  return typeof window !== "undefined";
}

/**
 * Applies a CSS fallback transition to an element.
 * Duration 150 ms satisfies the D-01 performance constraint (150 ms, cubic-bezier(0.0, 0.0, 0.2, 1)).
 *
 * @param element    - Target DOM element.
 * @param properties - Additional CSSStyleDeclaration properties to merge.
 */
export function applyFallback(
  element: HTMLElement,
  properties: Partial<CSSStyleDeclaration>
): void {
  if (typeof window === "undefined") return; // guarda SSR
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Object.assign(element.style, {
    ...(prefersReduced ? {} : { transition: "all 150ms cubic-bezier(0.0, 0.0, 0.2, 1)" }),
    ...properties,
  });
}
