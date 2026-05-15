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
