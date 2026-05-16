# Phase 01: Motion Effects - Research

**Researched:** 2026-05-13  
**Domain:** Front‑end animation (JavaScript / React / Vue)  
**Confidence:** HIGH

## Summary

The project's v1.1 milestone requires adding motion effects to landing‑page components while preserving accessibility (WCAG 2.1 AA), performance, and SEO metrics. The **Motion** library (npm package `motion`) is the official successor to Framer Motion and provides a unified API for JavaScript, React, and Vue. It is actively maintained (latest 12.38.0 as of 2026‑05‑13) and ships a tree‑shakable, TypeScript‑typed bundle of ~20 KB gzipped.

Motion's core features — springs, keyframe timelines, layout transitions, scroll‑linked effects, gesture handling — cover all interaction patterns needed for the landing page (e.g., entrance fades, hover lifts, scroll reveals). The library emphasises performance (GPU‑accelerated, 120 fps) and includes accessibility guidance (reduced‑motion support via the `prefers-reduced-motion` media query and automatic respect for `aria-hidden`).

**Primary recommendation:** Adopt `motion` as the sole animation library for the project, using its React entry point (`motion/react`) for all existing React components. Complement with a small utility to globally honour reduced‑motion settings.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Animation rendering | Frontend / Client | — | Motion runs entirely in the browser; no server involvement. |
| Reduced‑motion handling | Frontend / Client | — | Implemented via CSS media query & JavaScript check in the client bundle. |
| Asset bundling (tree‑shake) | Build system (Vite/ESBuild) | — | Build step eliminates unused animation code. |
| SSR fallback (if any) | Frontend Server (SSR) | — | Motion can render on the server but animations hydrate on the client; SSR must output static markup. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| `motion` | 12.38.0 | Unified animation API for JS/React/Vue | Actively maintained, TypeScript‑typed, tree‑shakable, replaces Framer Motion. |
| `react` | *as defined by project* | UI library | Required by existing components; Motion's React entry integrates seamlessly. |
| `@astrojs/react` | *project version* | Astro integration for React | Allows React components (including Motion) inside Astro pages. |

**Installation:**
```bash
npm install motion
```

### Supporting
| Library | Version | Purpose | When to Use |
|---|---|---|---|
| `@types/motion` | bundled | Type definitions for TypeScript | Implicit with the package; no extra install needed. |

### Alternatives Considered
| Instead of | Could Use | Trade‑off |
|---|---|---|
| `motion` | `framer-motion` | Larger bundle, extra dependency; Motion is the upstream, more actively maintained fork. |
| `motion` | CSS‑only animations | No programmatic control, limited to simple effects; Motion provides spring physics & timeline composition. |
| `motion` | GSAP | Powerful but larger (~30 KB minified) and steeper learning curve; Motion already aligns with React's declarative model. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── CarouselMotion.tsx      # motion‑enhanced carousel
│   ├── MobileMenuMotion.tsx    # motion‑enabled mobile menu
│   └── SettingsToggle.tsx      # existing component, will be upgraded
└── lib/
    └── motion-utils.ts         # helper for reduced‑motion handling
```

### Pattern: Declarative Motion Components
**What:** Wrap UI fragments with `<motion.div …>` and declaratively specify `initial`, `animate`, `exit`, and `transition` props.  
**When to use:** Any UI element with entrance, hover, tap, or scroll‑linked animation.

### Anti‑Pattern to Avoid
- **Hand‑rolling CSS keyframe animations for complex choreography** – leads to duplication, hard‑to‑maintain timing, and no reduced‑motion support. Use Motion's timeline API instead.

## Common Pitfalls

### Pitfall 1: Ignoring `prefers-reduced-motion`
**What goes wrong:** Users with reduced‑motion settings experience sudden animations, violating WCAG 2.1 AA.  
**How to avoid:** Wrap animation definitions with `useReducedMotion` hook or CSS media query.

### Pitfall 2: Over‑animating critical UI paths
**What goes wrong:** Excessive animations increase CLS and affect Lighthouse performance/SEO scores.  
**How to avoid:** Limit to key visual moments. Keep animation duration ≤ 300 ms.

### Pitfall 3: Missing tree‑shaking configuration
**What goes wrong:** Unused Motion exports bloat bundle size, hurting LCP.  
**How to avoid:** Import only needed primitives (`import { animate, motion } from "motion"`).

## Code Examples (Verified)

### Simple Fade‑In Component (React)
```tsx
import { motion, useReducedMotion } from "motion/react";

export const FadeIn = ({ children }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0, y: 20 }}
      animate={reduce ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
```

## Validation Architecture

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command |
|---|---|---|---|
| MOT-01 | Motion components render without errors | unit | `vitest run src/components/**/*.test.tsx` |
| MOT-02 | Reduced‑motion preference disables animations | integration | `npm run test:reduced-motion` |
| MOT-03 | Lighthouse CLS stays ≤ 0.1 after animations | e2e | `npm run lighthouse -- --perf` |

### Sampling Rate
- **Per task commit:** Quick unit tests (`npm run test:unit`).  
- **Per wave merge:** Full suite (`npm run test`).  
- **Phase gate:** Full suite passes AND Lighthouse CLS ≤ 0.1 before verification.

## Security Domain

### Known Threat Patterns
| Pattern | Standard Mitigation |
|---|---|
| Excessive animation duration causing motion sickness | Respect `prefers-reduced-motion`, limit durations ≤ 300 ms. |
| Unvalidated animation parameters from API | Validate with `zod` before passing to Motion API. |

## Sources

- Motion npm package: https://www.npmjs.com/package/motion
- Motion docs (React): https://motion.dev/docs/react
- Motion docs (Scroll): https://motion.dev/docs/scroll
- WCAG 2.1 AA — Guideline on animations and motion preferences

## Metadata

**Research date:** 2026-05-13  
**Valid until:** 2026-06-13

---
*The planner should now create the implementation plan (tasks, wave ordering, test additions) based on this research.*
