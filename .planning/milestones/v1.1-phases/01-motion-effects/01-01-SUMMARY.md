---
phase: 01-motion-effects
plan: "01"
subsystem: animation-infrastructure
tags: [motion, react, astro, typescript, animation-utils]
dependency_graph:
  requires: []
  provides:
    - src/lib/motion-utils.ts (MOTION_STORAGE_KEY, useMotionEnabled, setMotionEnabled, isMotionSupported, applyFallback)
    - astro react integration (enables .tsx hydration)
  affects:
    - src/components/CarouselMotion.tsx (Wave 2 will update import path)
    - src/components/MobileMenuMotion.tsx (Wave 2 will update import path)
    - src/components/SettingsToggle.tsx (Wave 2 will update import path)
tech_stack:
  added:
    - motion@12.38.0 (unified animation library, React entry via motion/react)
    - react@19.2.6 (required by @astrojs/react)
    - react-dom@19.2.6 (required by @astrojs/react)
    - "@astrojs/react@5.0.5 (Astro integration enabling .tsx hydration)"
    - "@testing-library/react@16.3.2 (renderHook support for TDD)"
  patterns:
    - useReducedMotion from motion/react for accessibility-first animation gating
    - localStorage + storage event for cross-tab motion preference sync
    - typeof window guard for SSR safety
key_files:
  created:
    - src/lib/motion-utils.ts
    - tests/unit/motion-utils.test.ts
  modified:
    - package.json
    - package-lock.json
    - astro.config.mjs
  deleted:
    - src/lib/motion.ts (legacy file using @motionone/dom anti-pattern)
decisions:
  - "Use motion@12.38.0 (not framer-motion, not @motionone/dom) per research recommendation"
  - "prefers-reduced-motion system setting overrides localStorage value unconditionally"
  - "applyFallback transition fixed at 150ms ease-out to satisfy D-01 performance constraint"
  - "Wave 2 to update component imports from ../lib/motion to ../lib/motion-utils"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-15"
  tasks_completed: 2
  files_changed: 6
---

# Phase 01 Plan 01: Install Motion Package and Create Motion Utils Summary

Install `motion` npm package (v12.x), add `@astrojs/react` integration, and create `src/lib/motion-utils.ts` — the shared animation utility module replacing the legacy `src/lib/motion.ts` that used the broken `@motionone/dom` import.

## Tasks Completed

### Task 1: Install packages and update Astro config

**Packages installed (exact versions from package-lock.json):**

| Package | Version | Purpose |
|---------|---------|---------|
| motion | 12.38.0 | Unified animation library (motion/react entry point) |
| react | 19.2.6 | UI runtime required by @astrojs/react |
| react-dom | 19.2.6 | DOM renderer required by @astrojs/react |
| @astrojs/react | 5.0.5 | Astro integration enabling .tsx component hydration |
| @testing-library/react | 16.3.2 | renderHook support for TDD (deviation: required by test) |

**astro.config.mjs changes:**
- Added `import react from '@astrojs/react'`
- Added `react()` to `integrations` array alongside `sitemap()`

### Task 2: Create motion-utils.ts (TDD — RED/GREEN/REFACTOR)

**Five exports in `src/lib/motion-utils.ts`:**

| Export | Type | Contract |
|--------|------|---------|
| `MOTION_STORAGE_KEY` | `const string` | `"motionEnabled"` — localStorage key |
| `useMotionEnabled` | React hook | Returns `false` when `prefers-reduced-motion` is reduce; reads localStorage with SSR guard; cross-tab sync via storage event |
| `setMotionEnabled` | function | Writes `JSON.stringify(enabled)` to localStorage; wrapped in try/catch |
| `isMotionSupported` | function | Returns `typeof window !== "undefined"` |
| `applyFallback` | function | Sets `transition: "all 150ms ease-out"` + merges additional CSS properties |

**Key import:** `import { useReducedMotion } from "motion/react"` (not a polyfill, not hand-rolled)

**Legacy file deleted:** `src/lib/motion.ts` removed. It used `@motionone/dom` (not installed) and the `(window as any).Motion` anti-pattern.

## TDD Gate Compliance

- RED commit `b2670a0`: `test(01-01): add failing tests for motion-utils module (RED)` — 171 lines, 12 test cases, suite failed because module didn't exist
- GREEN commit `d6050b6`: `feat(01-01): create motion-utils.ts and delete legacy motion.ts` — all 12 tests pass

## TypeScript Build Status

`npm run build` exits with code 0. TypeScript reports no errors for `src/lib/motion-utils.ts`.

The three `.tsx` components (`CarouselMotion.tsx`, `MobileMenuMotion.tsx`, `SettingsToggle.tsx`) still import from `../lib/motion` (deleted). These imports were broken before this plan (the old `motion.ts` also had a broken `@motionone/dom` import that was never installed). Wave 2 (plan 01-02) will update these import paths to `../lib/motion-utils`.

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` exits 0 | PASS |
| `grep -r "from.*@motionone/dom" src/` returns no real imports | PASS (only a code comment) |
| `grep "from \"motion/react\"" src/lib/motion-utils.ts` | PASS (1 match) |
| `grep "react()" astro.config.mjs` | PASS (1 match) |
| All 12 unit tests pass | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing @testing-library/react for renderHook**
- **Found during:** Task 2 (TDD RED phase — test runner)
- **Issue:** Test file uses `renderHook` from `@testing-library/react`, which was not in devDependencies
- **Fix:** `npm install --save-dev @testing-library/react @testing-library/user-event`
- **Files modified:** package.json, package-lock.json
- **Commit:** d6050b6 (included in feat commit)

## Known Stubs

None — this plan creates utility infrastructure only, no UI rendering or data display.

## Threat Flags

None — `motion-utils.ts` introduces no new network endpoints, auth paths, file access patterns, or schema changes. The localStorage access is documented in the plan's threat model (T-01-01, T-01-02, T-01-03) and mitigated by: JSON.parse in try/catch, prefers-reduced-motion override, and SSR window guards.

## Self-Check: PASSED

- [x] `src/lib/motion-utils.ts` exists at correct path
- [x] `src/lib/motion.ts` deleted (was untracked, now gone from filesystem)
- [x] `tests/unit/motion-utils.test.ts` exists
- [x] Commits b2670a0 (RED), 273fb5d (packages), d6050b6 (feat) all present in git log
- [x] `npm run build` exits 0
- [x] 12/12 unit tests pass
