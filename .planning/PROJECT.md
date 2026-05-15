# Project: Landing Page Deep Dive

## What This Is

A content-driven landing page built with Astro, with a fully automated testing and SEO quality pipeline. The project implements TDD methodology across unit, integration, and E2E test layers, with continuous Lighthouse audits, a live coverage badge, and weekly SEO health monitoring in CI.

## Current Milestone: v1.2 Animation Polish

**Goal:** Elevar a qualidade das animações da landing page usando o framework impeccable (critique → animate → audit) sem alterar o design visual estabelecido.

**Target features:**
- Critique impeccable focada em motion — inventário de gaps de animação P0/P1
- Stagger de entrada orquestrado no Hero (headline, lede, CTA sequenciais)
- Scroll-triggered reveals nas seções de conteúdo (Método, Ementa, Pricing, FAQ)
- Easing padronizado com cubic-bezier tokens do DESIGN.md
- SettingsToggle com transição animada de estado
- Stagger coordenado em listas e cards dentro das seções
- Auditoria técnica de animação (60fps, reduced-motion, CLS ≤ 0.1)

**Constraints:**
- NÃO alterar cores, tipografia, layout ou identidade visual
- Animações servem o design estabelecido — não o redefinem

## Milestones

## v1.0 Testing & SEO Optimization (Ship-Date: 2026-05-12)

- ✓ Unit test coverage >= 95%
- ✓ Integration tests pass for all content collection types
- ✓ E2E tests cover home page and critical user flows
- ✓ Lighthouse SEO score >= 90 (SEO 100, Performance 91, Accessibility 96)

## v1.1 Motion Effects Implementation (Ship-Date: 2026-05-15)

- ✓ Motion effects em CarouselMotion, MobileMenuMotion, SettingsToggle com motion@12.38.0
- ✓ Hero Section fade-in (whileInView), NavBar sticky + active section detection
- ✓ Pricing Card hover elevation, Button CTA hover lift
- ✓ 136 testes unitários + E2E coverage (WCAG 2.1 AA)

## v1.2 Animation Polish (In progress)

- Critique impeccable de motion
- Animações de entrada orquestradas e scroll-triggered reveals
- Quality gate: 60fps, reduced-motion, CLS ≤ 0.1

## Key Decisions

- Use motion@12.38.0 (não framer-motion) — API unificada DOM + React
- prefers-reduced-motion sempre substitui localStorage unconditionally
- client:visible (não client:load) para islands React no Hero
- CSS + IntersectionObserver para componentes Astro (sem React) — D-SCOPE-02-C
- data-* attributes como bridge entre IntersectionObserver e CSS declarativo

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
*Last updated: 2026-05-15*