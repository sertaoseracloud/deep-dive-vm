# Project: Landing Page Deep Dive

## What This Is

A content-driven landing page built with Astro, with a fully automated testing and SEO quality pipeline. The project implements TDD methodology across unit, integration, and E2E test layers, with continuous Lighthouse audits, a live coverage badge, and weekly SEO health monitoring in CI.

## Core Value

Provably high-quality static pages — every push is validated by 106 tests, a 95% coverage gate, and Lighthouse scores (SEO 100, Performance 91, Accessibility 96).

## Requirements

### Validated (v1.0)

- ✓ Unit test coverage >= 95% for src/components — v1.0 (106 tests, 95% gate enforced in CI)
- ✓ Integration tests pass for all content collection types — v1.0 (Zod schema, route generation)
- ✓ E2E tests cover home page and critical user flows — v1.0 (Playwright: Chromium, Firefox, WebKit)
- ✓ Lighthouse SEO score >= 90 in CI — v1.0 (SEO 100, Performance 91, Accessibility 96)
- ✓ All new features developed with TDD (tests written first) — v1.0
- ✓ Accessibility audit passes — v1.0 (Lighthouse accessibility 96)

### Active (v1.3)

- [ ] Reestruturação de rota Astro (base → /, landing → /deep-dive-vm/)
- [ ] Hub Linktree em / com foto, bio, redes e cards de cursos
- [ ] Open Graph para preview social (WhatsApp/Instagram)
- [ ] Scaffold documentado para novas landing pages

### Out of Scope

- Mobile app — web-first approach, static site
- Video chat — not applicable to landing page

## Technology Stack

- Astro (static site generator, `base: '/deep-dive-vm/'`)
- Vitest 3.2.4 + @vitest/coverage-v8 (unit/integration, 95% threshold gate)
- Playwright (E2E: Chromium, Firefox, WebKit, mobile viewports)
- Zod (content schema validation)
- @lhci/cli (Lighthouse CI, filesystem target)
- GitHub Actions (CI: push + PR + weekly cron)

## Current Milestone: v1.3 Multi-LP Platform

**Goal:** Transformar o site em uma plataforma multi-landing-page com hub Linktree na raiz e cada curso em sua própria rota.

**Target features:**
- Reestruturação de rota: remover `base: '/deep-dive-vm/'`, landing atual migra para `/deep-dive-vm/` (URL preservada)
- Hub Linktree em `/` com foto + bio + redes sociais + cards de cursos
- Open Graph otimizado para preview no WhatsApp/Instagram (social-first)
- Scaffold documentado para adicionar novas landing pages

## Current State

v1.2 shipped (2026-05-16) — Fases 3-5 completas (Animation Polish: motion critique → animation implementation → quality audit). v1.0 enviado (2026-05-12) com pipeline completo de testes e SEO.

## Key Decisions

| Decision | Outcome | Milestone |
|----------|---------|-----------|
| Vitest over Jest | No transform config needed for Astro components | v1.0 ✓ Good |
| LHCI filesystem target (not SQLite) | Zero extra deps, works without server | v1.0 ✓ Good |
| `lhci-results` orphan branch for LHCI JSON | Avoids unbounded main branch bloat | v1.0 ✓ Good |
| `[skip ci]` in all machine commits | No CI loops from badge/LHCI pushes | v1.0 ✓ Good |
| 95% coverage on empty .astro surface | Gate passes 0/0 trivially; surface grows over time | v1.0 — Pending |

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
*Last updated: 2026-05-16 — v1.3 milestone started*
