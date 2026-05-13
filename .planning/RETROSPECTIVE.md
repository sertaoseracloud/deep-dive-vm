# Project Retrospective

## Milestone: v1.0 — Testing & SEO Optimization

**Shipped:** 2026-05-12
**Phases:** 4 | **Plans:** 10

### What Was Built

- Vitest unit + integration suite — 106 tests covering all Astro components, content collection schemas, and route generation with Zod validation
- Playwright E2E — home page journeys, keyboard navigation (skip links, tab flow), 3-browser matrix (Chromium, Firefox, WebKit + mobile viewports)
- SEO optimization — Lighthouse SEO 100, Performance 91, Accessibility 96; JSON-LD structured data, WebP images, sitemap, heading hierarchy enforcement
- Continuous validation CI — 95% coverage gate, shields.io live badge from `badges` orphan branch, weekly Lighthouse cron (Sunday midnight UTC), LHCI filesystem persistence to `lhci-results` branch

### What Worked

- **GSD discuss → plan → execute workflow**: Locked decisions early (filesystem LHCI, `[skip ci]` convention) prevented rework during execution
- **Code review gate**: Caught 3 critical issues (CI loop risk, over-privileged permissions, unbounded main branch bloat) before phase was marked complete
- **Wave-based execution**: Phase 4 ran all 4 plans across 2 waves, detecting file overlap (04-01 + 04-02 both modify test.yml) and serializing correctly
- **Verifier agent**: Re-ran after CR fixes and accepted D-12 override (lhci-results vs main) with documented rationale — no false-positive gap

### What Was Inefficient

- **LHCI persistence decision flip**: Originally planned SQLite, then switched to filesystem in discuss-phase; the CONTEXT.md change forced a full replan of 04-04 (extra loop)
- **VERIFICATION.md stale after CR fixes**: Items 12/13 referenced "push to main" after CR-03 changed it to `lhci-results` — required re-verification pass
- **gsd-code-fixer spawn rejected mid-session**: Code fixes had to be applied in a subsequent session; continuity breaks cost context

### Patterns Established

- `.lighthouseci/` should never be committed to main — orphan branch is the right pattern for binary/JSON audit artifacts
- Machine commits MUST include `[skip ci]` — make this a D-13-style hard rule in all future CI-writing phases
- Phase 4 "continuous validation" is a reusable phase type: coverage gate + badge + weekly audit + CI persistence

### Key Lessons

- Lock CI-interaction decisions (machine commits, permissions, loop prevention) in discuss-phase before planning — they cascade across all plans in a phase
- `github.actor != 'github-actions[bot]'` guard is cheaper to add upfront than to fix post-review
- `bc` is not guaranteed on minimal runner images — always use bash integer arithmetic for CI scripts

### Cost Observations

- Model mix: sonnet-4.6 (orchestrator + executor), opus for planner/checker
- Sessions: ~3 sessions (discuss, plan+execute, execute continuation + code review + verify + complete)
- Notable: Re-verification after code review fixes was fast (~2.5 min) because verifier context is bounded and focused

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Phases | 4 |
| Plans | 10 |
| Tests | 106 |
| Lighthouse SEO | 100 |
| Lighthouse Performance | 91 |
| Coverage gate | 95% |
| Code review findings | 7 (3 critical, 4 warning) |
| Verification score | 16/16 |
