# Phase 02 — Validation Architecture

## Requirement → Test Map

| Req ID | Behavior | Test Type | Location | Automated Command |
|--------|----------|-----------|----------|-------------------|
| MOT-01 | MobileMenuMotion opens on hamburger click | unit | tests/unit/components/MobileMenuMotion.test.tsx | npx vitest run tests/unit/components/MobileMenuMotion.test.tsx |
| MOT-01 | CarouselMotion renders real testimonial data | unit | tests/unit/components/CarouselMotion.test.tsx | npx vitest run tests/unit/components/CarouselMotion.test.tsx |
| MOT-01 | SettingsToggle visual toggle renders | unit | tests/unit/components/SettingsToggle.test.ts | npx vitest run tests/unit/components/SettingsToggle.test.ts |
| MOT-01 | HeroMotion renders without crash | unit | tests/unit/components/HeroMotion.test.tsx | npx vitest run tests/unit/components/HeroMotion.test.tsx |
| MOT-02 | MobileMenuMotion respects prefers-reduced-motion (no-motion path) | unit | tests/unit/components/MobileMenuMotion.noMotion.test.tsx | npx vitest run tests/unit/components/MobileMenuMotion.noMotion.test.tsx |
| MOT-02 | HeroMotion respects prefers-reduced-motion (MotionConfig passthrough) | unit | tests/unit/components/HeroMotion.test.tsx | npx vitest run tests/unit/components/HeroMotion.test.tsx |
| MOT-03 | CLS <= 0.1 after scroll animations | e2e/perf | lighthouserc.cjs | npm run test:perf |
| MOT-03 | TBT < 50ms after hydration | e2e/perf | lighthouserc.cjs | npm run test:perf |
| WCAG-01 | NavBar hamburger has aria-expanded | e2e | tests/e2e/homepage.spec.ts + tests/e2e/motion-accessibility.spec.ts | npx playwright test |
| WCAG-02 | Pricing Cards have focus-visible outline | e2e | tests/e2e/motion-accessibility.spec.ts | npx playwright test tests/e2e/motion-accessibility.spec.ts |
| WCAG-03 | Hero is visible with JS disabled | manual | n/a | npm run build && disable JS in browser |

## Sampling Rate

- Por commit de task: `npx vitest run tests/unit`
- Por merge de wave: `npm run test` (suite completa)
- Phase gate: `npm run test` + `npm run test:axe` + `npm run build` (Lighthouse CI opcional se servidor dev estiver rodando)

## Validation Audit 2026-05-15

| Metric | Count |
|--------|-------|
| Gaps found | 5 (4 MISSING + 2 PARTIAL) |
| Resolved automated | 5 |
| Escalated | 0 |

### Gap Resolution Details

| Gap | Status Before | Status After | File |
|-----|---------------|--------------|------|
| CarouselMotion renders testimonials (MOT-01) | MISSING | COVERED | tests/unit/components/CarouselMotion.test.tsx (created) |
| SettingsToggle render test (MOT-01) | PARTIAL (type-only) | COVERED | tests/unit/components/SettingsToggle.test.ts (expanded) |
| MobileMenuMotion prefers-reduced-motion (MOT-02) | MISSING | COVERED | tests/unit/components/MobileMenuMotion.noMotion.test.tsx (created) |
| HeroMotion prefers-reduced-motion (MOT-02) | MISSING | COVERED | tests/unit/components/HeroMotion.test.tsx (expanded) |
| Pricing Card focus-visible outline (WCAG-02) | MISSING | COVERED | tests/e2e/motion-accessibility.spec.ts (created) |

Post-audit unit test count: 136 tests / 20 files — all green.