# Roadmap: Testing & SEO Optimization

## Milestones

- ✅ **v1.0 Testing & SEO Optimization** — Phases 1-4 (shipped 2026-05-12)
- 🔄 **v1.2 Quality Audit** — Phase 5 (in progress)

## Phases

<details>
<summary>✅ v1.0 Testing & SEO Optimization (Phases 1-4) — SHIPPED 2026-05-12</summary>

- [x] Phase 1: Testing Foundation (1/1 plans) — completed 2026-05-11
- [x] Phase 2: E2E Testing (1/1 plans) — completed 2026-05-11
- [x] Phase 3: SEO Optimization (4/4 plans) — completed 2026-05-11
- [x] Phase 4: Continuous Validation (4/4 plans) — completed 2026-05-12

</details>

### Phase 5: Quality Audit

**Goal:** All v1.2 animations pass technical quality gates — 60fps performance, full reduced-motion compliance, and CLS within budget — verified by impeccable audit

**Requirements:** QUAL-01, QUAL-02, QUAL-03

**Plans:** 3 plans (sequential — each gate must pass before advancing)

Plans:

**Wave 1**
- [ ] 05-01-PLAN.md — QUAL-01: will-change audit + impeccable detect (manual inspection of 5 animation files)

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 05-02-PLAN.md — QUAL-02: Playwright reduced-motion compliance tests for [data-reveal], [data-stagger], .hero-stagger-item, motion.span

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 05-03-PLAN.md — QUAL-03: Lighthouse CLS gate against local build (numericValue <= 0.1)

Cross-cutting constraints:
- Each gate must pass before the next begins (D-PLAN-02)
- Gate decisions are pass/fail — no partial credit

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. Testing Foundation | v1.0 | 1/1 | Complete | 2026-05-11 |
| 2. E2E Testing | v1.0 | 1/1 | Complete | 2026-05-11 |
| 3. SEO Optimization | v1.0 | 4/4 | Complete | 2026-05-11 |
| 4. Continuous Validation | v1.0 | 4/4 | Complete | 2026-05-12 |
| 5. Quality Audit | v1.2 | 0/3 | In Progress | — |
