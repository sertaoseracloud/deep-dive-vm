# Project: Landing Page Deep Dive

## What This Is

Uma landing page orientada a conteúdo construída com Astro, com pipeline automatizado de testes, qualidade de animações (impeccable framework) e SEO. O projeto implementa TDD em camadas de testes unitários, integração e E2E, com auditorias Lighthouse contínuas, badge de cobertura, monitoramento semanal de SEO em CI, e animações polidas com reduced-motion compliance total.

## Current State (after v1.2)

**Stack:** Astro + React (motion@12.38.0), TypeScript, Vitest 3.2.4, Playwright, impeccable@2.1.9
**Tests:** 180 unitários + E2E suite (motion-accessibility, axe-core, cross-browser)
**Quality gates:** Lighthouse SEO 100, Performance 91, Accessibility 96, CLS 0
**Animations:** Hero stagger, 8 section reveals, SettingsToggle spring/fade, bonus/pricing stagger

## Requirements

### Validated

- ✓ Unit test coverage >= 95% — v1.0
- ✓ Integration tests pass for all content collection types — v1.0
- ✓ E2E tests cover home page and critical user flows — v1.0
- ✓ Lighthouse SEO score >= 90 (SEO 100, Performance 91, Accessibility 96) — v1.0
- ✓ Motion effects em CarouselMotion, MobileMenuMotion, SettingsToggle com motion@12.38.0 — v1.1
- ✓ Hero Section fade-in, NavBar sticky + active section detection — v1.1
- ✓ Pricing Card hover elevation, Button CTA hover lift — v1.1
- ✓ 136+ testes unitários + E2E WCAG 2.1 AA — v1.1
- ✓ CRIT-01: Impeccable critique com P0/P1/P2 gap inventory — v1.2
- ✓ ANIM-01: Hero staggered entrance (headline, lede, CTA sequenciais) — v1.2
- ✓ ANIM-02: Scroll-triggered reveals em 8 seções — v1.2
- ✓ ANIM-04: SettingsToggle spring indicator + fade label — v1.2
- ✓ ANIM-05: Stagger em bonus cards e pricing feature list — v1.2
- ✓ QUAL-01: 60fps — sem layout thrashing, will-change escopado — v1.2
- ✓ QUAL-03: CLS ≤ 0.1 (CLS = 0) — v1.2

### Active (next milestone candidates)

- [ ] ANIM-03 close: easing tokens em Button.astro, NavBar.astro, SettingsToggle.tsx:123 (P1 gaps de v1.2)
- [ ] QUAL-02 fix: locator aria-label "Ativar animações" no teste E2E SettingsToggle (Group 2)
- [ ] Parallax depth no Hero — múltiplas camadas com velocidades diferentes
- [ ] Page transition animations entre seções ao clicar nos links da NavBar
- [ ] Scroll progress indicator

### Out of Scope

- Mobile app — web-first approach, PWA works well
- Video chat integration — use external tools
- Mudança de biblioteca de animação — motion@12.38.0 permanece
- Animações que exijam dados externos ou APIs
- Confetti / celebration animation — depende de dados externos (checkout event)

## Key Decisions

| Decisão | Rationale | Status |
|---------|-----------|--------|
| motion@12.38.0 (não framer-motion) | API unificada DOM + React | ✓ Good |
| prefers-reduced-motion sempre substitui localStorage | Segurança de acessibilidade | ✓ Good |
| client:visible (não client:load) para HeroMotion | Hidratação lazy no viewport | ✓ Good |
| CSS + IntersectionObserver para componentes Astro (sem React) | Sem overhead JS em componentes server | ✓ Good |
| data-* attributes como bridge IO→CSS | Declarativo e testável | ✓ Good |
| MotionConfig reducedMotion="user" por componente + hook dual-path | MotionConfig não propaga globalmente | ✓ Good |
| impeccable critique como input (não redesign) | Design visual inviolável | ✓ Good |
| D-AUDIT-01: QUAL-01 gate = manual inspection | impeccable v2.1.9 detecta só tipografia | ✓ Good |
| D-AUDIT-03: Lighthouse contra localhost | CLS confiável sem spoofing de URL | ✓ Good |
| HeroMotion dual-path: Children.map + querySelectorAll | Single-child em produção com Hero.astro | ✓ Good |

## Milestones

### ✅ v1.0 Testing & SEO Optimization (Shipped: 2026-05-12)

4 phases, 10 plans — full test pipeline + CI

### ✅ v1.1 Motion Effects Implementation (Shipped: 2026-05-15)

2 phases, 6 plans — motion@12.38.0, hero animations, pricing hover

### ✅ v1.2 Animation Polish (Shipped: 2026-05-16)

3 phases, 11 plans — impeccable critique→animate→audit, stagger, reveals, quality gates

## Context

**Last shipped:** v1.2 Animation Polish (2026-05-16)
**Known tech debt:** ANIM-03 P1 easing gaps (Button, NavBar, SettingsToggle), QUAL-02 E2E locator mismatch
**Next step:** `/gsd:new-milestone` para definir próximo milestone

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-16 after v1.2 milestone*
