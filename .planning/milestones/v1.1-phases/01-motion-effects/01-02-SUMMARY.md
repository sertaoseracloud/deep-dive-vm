---
phase: 01-motion-effects
plan: "02"
subsystem: motion-components
tags: [motion, react, animation, accessibility, carousel, mobile-menu, settings]
dependency_graph:
  requires:
    - "01-01-SUMMARY.md"
  provides:
    - CarouselMotion component (functional, wired into page)
    - MobileMenuMotion component (functional, wired into page)
    - SettingsToggle component (functional, wired into page)
  affects:
    - src/pages/index.astro
tech_stack:
  added: []
  patterns:
    - "motion (imperative DOM animate) for CarouselMotion"
    - "motion/react (declarative motion.nav) for MobileMenuMotion"
    - "useMotionEnabled/setMotionEnabled from motion-utils for all components"
    - "client:load Astro directive for browser hydration"
key_files:
  created: []
  modified:
    - src/components/CarouselMotion.tsx
    - src/components/MobileMenuMotion.tsx
    - src/components/SettingsToggle.tsx
    - src/pages/index.astro
decisions:
  - "Use x property (not translateX) in animate() DOM overload to satisfy DOMKeyframesDefinition type"
  - "MobileMenuMotion uses motion.nav declarative when motionEnabled=true; plain nav with applyFallback when false"
  - "CarouselMotion scaffold from Wave 1 had correct architecture but wrong translateX property name"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-15"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 4
---

# Phase 01 Plan 02: Motion Components and Page Wiring Summary

Rewrote three motion components to use the motion package properly, eliminated legacy `(window as any).Motion` references, and wired all three into `src/pages/index.astro` with `client:load` hydration.

## Animation API Per Component

| Component | API Style | Import | Pattern |
|-----------|-----------|--------|---------|
| CarouselMotion | Imperative (DOM) | `animate` from `"motion"` | `animate(el, { x: [...] }, options)` — stores handle for pause/play |
| MobileMenuMotion | Declarative (React) | `motion` from `"motion/react"` | `<motion.nav initial animate transition>` |
| SettingsToggle | None (state only) | none from motion | reads/writes motionEnabled via motion-utils |

## TypeScript Issues Resolved

**TS2769 in CarouselMotion.tsx** — `translateX` was used as a keyframe property in the `animate()` call, but this falls into the `ObjectTarget<HTMLDivElement>` overload which does not know `translateX`. The fix was to use `x` which is correctly mapped in `CSSStyleDeclarationWithTransform` as `x: number | string` and resolves to the DOM overload `(ElementOrSelector, DOMKeyframesDefinition, options)`.

**TS2307 in MobileMenuMotion.tsx and SettingsToggle.tsx** — Both files imported from `../lib/motion` (legacy module deleted in Wave 1). Fixed by updating imports to `../lib/motion-utils`.

## Final Import Graph

```
src/components/CarouselMotion.tsx
  └── "motion"                      (animate — imperative DOM API)
  └── "../lib/motion-utils"         (useMotionEnabled, isMotionSupported, applyFallback)

src/components/MobileMenuMotion.tsx
  └── "motion/react"                (motion — declarative React components)
  └── "../lib/motion-utils"         (useMotionEnabled, applyFallback)

src/components/SettingsToggle.tsx
  └── "../lib/motion-utils"         (setMotionEnabled, useMotionEnabled)

src/lib/motion-utils.ts
  └── "motion/react"                (useReducedMotion)
  └── "react"                       (useState, useEffect)
```

## index.astro Component Placement

| Component | Placement | Notes |
|-----------|-----------|-------|
| MobileMenuMotion | Adjacent to NavBar (outside main) | `isOpen={false}` — TODO Phase 02: wire toggle trigger |
| CarouselMotion | After Testimonials section (inside main) | Two sample items passed as props |
| SettingsToggle | Before closing main tag in `.motion-settings` div | No settings section existed; created wrapper div |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect keyframe property in CarouselMotion animate() call**
- **Found during:** Task 1 verification (npx tsc --noEmit)
- **Issue:** CarouselMotion scaffold used `{ translateX: [...] }` which TypeScript resolved to the `ObjectTarget<HTMLDivElement>` overload instead of the `DOMKeyframesDefinition` overload. `translateX` is not in `ObjectTarget<HTMLDivElement>`.
- **Fix:** Changed to `{ x: [...] }` — the `x` shorthand is defined in `CSSStyleDeclarationWithTransform` and correctly resolves to the DOM animate overload.
- **Files modified:** src/components/CarouselMotion.tsx
- **Commit:** 7268bca

**2. [Rule 1 - Bug] Fixed legacy imports in MobileMenuMotion and SettingsToggle**
- **Found during:** Task 2 (pre-existing in scaffold files)
- **Issue:** Both files imported from `../lib/motion` which was deleted in Wave 1 (01-01).
- **Fix:** Updated both imports to `../lib/motion-utils`.
- **Files modified:** src/components/MobileMenuMotion.tsx, src/components/SettingsToggle.tsx
- **Commit:** c1e5ecd

## Threat Model Compliance

| Threat ID | Mitigation Status |
|-----------|------------------|
| T-02-01 | DONE — aria-hidden={!isOpen} derived directly from isOpen prop |
| T-02-02 | DONE — animation.pause() on mouseenter; animation.stop() on unmount |
| T-02-03 | DONE — initial={{ x: "-100%" }} on motion.nav for correct SSR starting state |
| T-02-04 | N/A — accepted |

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| `isOpen={false}` | src/pages/index.astro | 39 | Mobile menu open/close trigger is out of Phase 01 scope (D-SCOPE-01); Phase 02 will wire the button |
| CarouselMotion items hardcoded | src/pages/index.astro | 50 | Sample items; real testimonials data wiring is in Phase 02 scope |

## Verification Results

```
npx tsc --noEmit: TypeScript: No errors found
grep "lib/motion\"" src/: NONE
grep "(window as any).Motion" src/: NONE
grep "aria-hidden" src/components/MobileMenuMotion.tsx: 2 matches
grep "aria-label" src/components/CarouselMotion.tsx: 1 match
grep "client:load" src/pages/index.astro: 3 matches
npm run build: Completed in 5.06s — 1 page(s) built
```

## Self-Check: PASSED

- CarouselMotion.tsx: exists and compiles
- MobileMenuMotion.tsx: exists and compiles
- SettingsToggle.tsx: exists and compiles
- index.astro: has 3 client:load directives
- Commits: 7268bca, c1e5ecd, fedc10f all present in git log
