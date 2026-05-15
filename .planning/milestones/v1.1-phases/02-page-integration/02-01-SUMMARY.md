---
phase: "02"
plan: "01"
subsystem: "page-integration"
tags: ["react", "motion", "mobile-menu", "carousel", "testimonials", "settings-toggle"]
dependency_graph:
  requires: ["01-01", "01-02", "01-03"]
  provides: ["02-02", "02-03"]
  affects: ["index.astro", "NavBar.astro", "MobileMenuMotion", "CarouselMotion", "SettingsToggle"]
tech_stack:
  added: []
  patterns:
    - "CustomEvent-based cross-component communication (hamburger -> MobileMenuMotion)"
    - "React.createElement in Astro frontmatter for passing JSX to client components"
    - "renderToStaticMarkup in Vitest for testing hooks-enabled components server-side"
key_files:
  created:
    - "src/components/TestimonialCard.tsx"
    - "tests/unit/components/MobileMenuMotion.test.tsx"
    - "tests/unit/components/TestimonialCard.test.tsx"
  modified:
    - "src/components/MobileMenuMotion.tsx"
    - "src/components/SettingsToggle.tsx"
    - "src/components/layout/NavBar.astro"
    - "src/pages/index.astro"
    - "vitest.config.ts"
decisions:
  - "CustomEvent dispatch (toggle-menu) used instead of prop drilling isOpen through Astro -> React boundary"
  - "renderToStaticMarkup used in tests to verify component renders nav element without DOM/hook issues"
  - "vitest.config.ts updated to include *.test.tsx pattern in unit-integration project"
  - "TestimonialCard created as pure presentational component (no motion hooks needed)"
metrics:
  duration: "~18 minutes"
  completed: "2026-05-15"
  tasks_completed: 3
  files_created: 3
  files_modified: 5
---

# Phase 02 Plan 01: Integration Loose Ends Summary

**One-liner:** MobileMenuMotion refactored to CustomEvent-driven state, NavBar hamburger wired, real testimonials in CarouselMotion via TestimonialCard, SettingsToggle styled as fixed visual toggle switch.

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| RED test | MobileMenuMotion.test.tsx (RED phase) | 130bf69 | PASS |
| Task 1 | MobileMenuMotion CustomEvent + NavBar hamburger | c945577 | PASS |
| Task 2 | TestimonialCard + real testimonials in CarouselMotion | 681f899 | PASS |
| Task 3 | SettingsToggle visual switch | 64d2fc5 | PASS |

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `tsc --noEmit` | exit 0 | exit 0 | PASS |
| `npm run build` | exit 0 | exit 0 | PASS |
| Unit tests (113 tests, 17 files) | all pass | all pass | PASS |
| `isOpen={false}` in index.astro | 0 | 0 | PASS |
| `<Testimonials` in index.astro | 0 | 0 | PASS |
| `carouselItems` in index.astro | >= 1 | 2 | PASS |
| `hamburger-btn` in NavBar.astro | >= 2 | 2 | PASS |
| `toggle-menu` in NavBar.astro | >= 1 | 1 | PASS |
| `isOpen: boolean` in MobileMenuMotion.tsx | 0 | 0 | PASS |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest.config.ts did not include *.test.tsx**
- **Found during:** Task 1 RED phase
- **Issue:** vitest.config.ts only included `*.test.ts` patterns; running `vitest run *.test.tsx` returned 0 tests collected
- **Fix:** Added `tests/unit/**/*.test.tsx` and `tests/integration/**/*.test.tsx` to the unit-integration project's `include` array
- **Files modified:** `vitest.config.ts`
- **Commit:** 130bf69 (included in RED commit)

**2. [Rule 1 - Bug] RED test approach incompatible with React hooks outside renderer**
- **Found during:** Task 1 RED phase — tests 2 and 3 threw `Cannot read properties of null (reading 'useState')` when calling the component function directly
- **Issue:** Calling a React hooks component as a plain function outside React context crashes with null dispatcher error
- **Fix:** Rewrote tests to use `renderToStaticMarkup` from `react-dom/server` which provides a valid React context (SSR renderer, supports `useState`, skips `useEffect`)
- **Files modified:** `tests/unit/components/MobileMenuMotion.test.tsx`
- **Commit:** c945577 (tests updated alongside implementation)

**Note on TDD RED/GREEN sequence:** The RED commit (130bf69) used the initial test approach that crashed. The tests were corrected in the same wave as the implementation. The final test file represents both the intent (no `isOpen` prop, renders `<nav>`) and the correct testing technique. The implementation (MobileMenuMotion.tsx) is independent and correct — the deviation was in the test approach, not the component behavior.

## Known Stubs

None. All three testimonials in `carouselItems` contain real user-provided content. The `CarouselMotion` component receives real data via `TestimonialCard` instances.

## Threat Flags

None. No new network endpoints, auth paths, or file access patterns introduced. All changes are pure client-side React components and static Astro markup.

## Self-Check: PASSED

- `src/components/TestimonialCard.tsx` — FOUND
- `src/components/MobileMenuMotion.tsx` — FOUND (refactored)
- `src/components/SettingsToggle.tsx` — FOUND (visual switch)
- `src/components/layout/NavBar.astro` — FOUND (hamburger added)
- `src/pages/index.astro` — FOUND (isOpen removed, real testimonials wired)
- Commit 130bf69 — FOUND
- Commit c945577 — FOUND
- Commit 681f899 — FOUND
- Commit 64d2fc5 — FOUND
