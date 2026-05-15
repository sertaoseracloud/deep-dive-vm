# Phase 02 — Validation Architecture

## Requirement → Test Map

| Req ID | Behavior | Test Type | Location | Automated Command |
|--------|----------|-----------|----------|-------------------|
| MOT-01 | MobileMenuMotion opens on hamburger click | unit | tests/unit/components/MobileMenuMotion.test.tsx | npx vitest run tests/unit/components/MobileMenuMotion.test.tsx |
| MOT-01 | CarouselMotion renders real testimonial data | unit | tests/unit/components/CarouselMotion.test.tsx | npx vitest run tests/unit/components/CarouselMotion.test.tsx |
| MOT-01 | SettingsToggle visual toggle renders | unit | tests/unit/components/SettingsToggle.test.ts | npx vitest run tests/unit/components/SettingsToggle.test.ts |
| MOT-01 | HeroMotion renders without crash | unit | tests/unit/components/HeroMotion.test.tsx | npx vitest run tests/unit/components/HeroMotion.test.tsx |
| MOT-02 | MobileMenuMotion respects prefers-reduced-motion | unit | tests/unit/components/MobileMenuMotion.test.tsx | npx vitest run |
| MOT-02 | HeroMotion respects prefers-reduced-motion | unit | tests/unit/components/HeroMotion.test.tsx | npx vitest run |
| MOT-03 | CLS ≤ 0.1 after scroll animations | e2e/perf | lighthouserc.cjs | npm run test:perf |
| MOT-03 | TBT < 50ms after hydration | e2e/perf | lighthouserc.cjs | npm run test:perf |
| WCAG-01 | NavBar hamburger has aria-expanded | e2e | tests/e2e/motion-accessibility.spec.ts | npm run test:axe |
| WCAG-02 | Pricing Cards have focus-visible outline | e2e | tests/e2e/motion-accessibility.spec.ts | npm run test:axe |
| WCAG-03 | Hero is visible with JS disabled | manual | n/a | npm run build && disable JS in browser |

## Sampling Rate

- Por commit de task: `npx vitest run tests/unit`
- Por merge de wave: `npm run test` (suite completa)
- Phase gate: `npm run test` + `npm run test:axe` + `npm run build` (Lighthouse CI opcional se servidor dev estiver rodando)
