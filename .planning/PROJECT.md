# Project: Landing Page Deep Dive

## What This Is

A multi-landing-page platform built with Astro, with a fully automated testing and SEO quality pipeline. The hub at `mentoria.sertaoseracloud.com/` presents the mentor's identity and links to course landing pages. Each course lives at its own route (`/deep-dive-vm/`, `/deep-dive-ec2/`, etc.). The project implements TDD methodology across unit, integration, and E2E test layers, with continuous Lighthouse audits, a live coverage badge, and weekly SEO health monitoring in CI.

## Core Value

Provably high-quality multi-LP platform — every push is validated by 115 tests, a 95% coverage gate, and Lighthouse scores. Hub optimized for social sharing (rich OG previews on WhatsApp/Instagram/LinkedIn).

## Current State

**v1.4 in progress (2026-05-17)** — Python para Neurodivergentes LP. Adicionando terceiro curso à plataforma com LP completa (Hero, Público-alvo, Módulos, Pricing) em `/deep-dive-python-neurodivergentes/`.

**v1.3 shipped (2026-05-17)** — Multi-LP Platform complete. Hub live at `mentoria.sertaoseracloud.com/`, LP at `/deep-dive-vm/`, EC2 coming-soon at `/deep-dive-ec2/`. 115/115 tests green.

## Requirements

### Validated (v1.0)

- ✓ Unit test coverage >= 95% for src/components — v1.0 (106 tests, 95% gate enforced in CI)
- ✓ Integration tests pass for all content collection types — v1.0 (Zod schema, route generation)
- ✓ E2E tests cover home page and critical user flows — v1.0 (Playwright: Chromium, Firefox, WebKit)
- ✓ Lighthouse SEO score >= 90 in CI — v1.0 (SEO 100, Performance 91, Accessibility 96)
- ✓ All new features developed with TDD (tests written first) — v1.0
- ✓ Accessibility audit passes — v1.0 (Lighthouse accessibility 96)

### Validated (v1.3)

- ✓ Reestruturação de rota Astro (base → /, landing → /deep-dive-vm/) — v1.3 Phase 6
- ✓ Hub Linktree em / com foto, bio, redes e cards de cursos — v1.3 Phase 7
- ✓ Open Graph para preview social (WhatsApp/Instagram) — v1.3 Phase 7
- ✓ Scaffold documentado para novas landing pages — v1.3 Phase 8

### Active (v1.4)

- [ ] LP completa Python para Neurodivergentes em /deep-dive-python-neurodivergentes/
- [ ] Hub card ativo para o curso Python (sem "Em breve")
- [ ] OG image python-neurodivergentes-og.png + meta tags completas
- [ ] E2E + SEO tests para a nova LP

### Out of Scope

- Mobile app — web-first approach, static site
- Video chat — not applicable to landing page
- Subdomínios por curso — complexidade de DNS desnecessária
- SSR ou API routes — não necessário para site estático

## Technology Stack

- Astro (static site generator, file-based routing, sem `base`)
- Vitest 3.2.4 + @vitest/coverage-v8 (unit/integration, 95% threshold gate)
- Playwright (E2E: Chromium, mobile viewports)
- Zod (content schema validation)
- @lhci/cli (Lighthouse CI, filesystem target)
- GitHub Actions (CI: push + PR + weekly cron, Node 22)

## Key Decisions

| Decision | Outcome | Milestone |
|----------|---------|-----------|
| Vitest over Jest | No transform config needed for Astro components | v1.0 ✓ Good |
| LHCI filesystem target (not SQLite) | Zero extra deps, works without server | v1.0 ✓ Good |
| `lhci-results` orphan branch for LHCI JSON | Avoids unbounded main branch bloat | v1.0 ✓ Good |
| `[skip ci]` in all machine commits | No CI loops from badge/LHCI pushes | v1.0 ✓ Good |
| File-based routing sem `base` | Astro nativo, sem gambiarra de config | v1.3 ✓ Good |
| social-links.ts como data file separado | Configurável sem alterar código de componente | v1.3 ✓ Good |
| courses.ts como fonte única de cursos | Hub renderiza automaticamente ao adicionar novo curso | v1.3 ✓ Good |
| LP-lite pattern para coming-soon pages | EC2 como prova de conceito do scaffold | v1.3 ✓ Good |

## Tech Debt

- WhatsApp social link desabilitado — aguarda número E.164 real (configura em `src/data/social-links.ts`)
- LHCI performance gate 80%: score local 72% — pré-existente, não é regressão v1.3
- `motion-accessibility.spec.ts`: 7 falhas pré-existentes (price-cta/hamburger não implementados)

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Current State

---
*Last updated: 2026-05-17 — v1.3 shipped*
