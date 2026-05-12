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

### Active (next milestone)

- [ ] (add requirements for next milestone here)

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

## Current State

v1.0 shipped (2026-05-12) — 4 phases, 10 plans complete. Live coverage badge from `badges` branch. Weekly Lighthouse cron active. LHCI JSON persisted to `lhci-results` orphan branch. All 6 acceptance criteria satisfied.

## Key Decisions

| Decision | Outcome | Milestone |
|----------|---------|-----------|
| Vitest over Jest | No transform config needed for Astro components | v1.0 ✓ Good |
| LHCI filesystem target (not SQLite) | Zero extra deps, works without server | v1.0 ✓ Good |
| `lhci-results` orphan branch for LHCI JSON | Avoids unbounded main branch bloat | v1.0 ✓ Good |
| `[skip ci]` in all machine commits | No CI loops from badge/LHCI pushes | v1.0 ✓ Good |
| 95% coverage on empty .astro surface | Gate passes 0/0 trivially; surface grows over time | v1.0 — Pending |

---
*Last updated: 2026-05-12 after v1.0 milestone*
