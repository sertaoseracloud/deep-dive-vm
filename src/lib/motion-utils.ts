// src/lib/motion-utils.ts
// Shared animation utilities consumed by all motion components.
// Replaces the legacy src/lib/motion.ts which imported from @motionone/dom.

import { useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";

/** localStorage key used to persist the motion enabled preference. */
export const MOTION_STORAGE_KEY = "motionEnabled";

/**
 * React hook that returns whether animations should be enabled.
 *
 * Priority (highest to lowest):
 *   1. prefers-reduced-motion system setting — always overrides stored preference.
 *   2. localStorage value (user toggle).
 *   3. Default: true (animations on).
 *
 * SSR-safe: returns false when window is undefined.
 * Cross-tab sync: listens to the "storage" event.
 */
export function useMotionEnabled(): boolean {
  const prefersReduced = useReducedMotion();

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(MOTION_STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored) as boolean;
      }
    } catch {
      // Ignore JSON parse or storage access errors.
    }
    return true;
  });

  // Cross-tab sync: update state when another tab writes to localStorage.
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== MOTION_STORAGE_KEY) return;
      try {
        const newValue = event.newValue !== null ? (JSON.parse(event.newValue) as boolean) : true;
        setEnabled(newValue);
      } catch {
        // Ignore malformed values — leave current state.
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // prefers-reduced-motion always wins.
  if (prefersReduced) return false;
  return enabled;
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
 * Duration 150 ms satisfies the D-01 performance constraint (≤ 150 ms, ease-out).
 *
 * @param element    - Target DOM element.
 * @param properties - Additional CSSStyleDeclaration properties to merge.
 */
export function applyFallback(
  element: HTMLElement,
  properties: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, {
    transition: "all 150ms ease-out",
    ...properties,
  });
}
