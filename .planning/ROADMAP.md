# Roadmap: Motion Effects Implementation (v1.1)

## Milestones

- ✅ **v1.0 Testing & SEO Optimization** — Shipped 2026-05-12
- ✅ **v1.1 Motion Effects Implementation** — Complete 2026-05-15

## Phases

<details>
<summary>✅ v1.1 Motion Effects Implementation (Phase 1) — Complete (3/3 plans)</summary>

- [x] Plan 01-01: Install motion@12.38.0 and create motion-utils.ts (MOTION_STORAGE_KEY, useMotionEnabled, setMotionEnabled, isMotionSupported, applyFallback)
- [x] Plan 01-02: Rewrite CarouselMotion, MobileMenuMotion, SettingsToggle with motion/react; wire into index.astro with client:load
- [x] Plan 01-03: Full test suite — Vitest unit tests (renderHook hook coverage), Playwright E2E axe-core spec, Lighthouse CI CLS/TBT budget

</details>

<details>
<summary>🔲 v1.1 Motion Effects Implementation (Phase 2) — Page Integration & Remaining Animations</summary>

**Goal:** Complete the remaining v1.1 motion scope deferred by D-SCOPE-01: wire the MobileMenuMotion trigger, connect real testimonials to CarouselMotion, style SettingsToggle visibly, and implement Hero Section, Pricing Cards, and NavBar motion effects.

**Depends on:** Phase 1

- [ ] Plan 02-01: Integration loose ends — MobileMenuMotion trigger button, real testimonials in CarouselMotion, SettingsToggle styling
- [ ] Plan 02-02: Hero Section animations — parallax scroll, fade-in on scroll, CTA hover states
- [ ] Plan 02-03: Pricing Cards hover effects and NavBar sticky/active state animations

</details>
