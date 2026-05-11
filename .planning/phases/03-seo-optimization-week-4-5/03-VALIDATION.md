---
phase: "03"
slug: 03-seo-optimization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-11
---

# Phase 03 — Validation Strategy (SEO Optimization)

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run (SEO tests)** | `npx vitest run tests/seo` |
| **Full suite command** | `npm run test:all && npm run build && npx lhci autorun` |
| **Estimated runtime** | ~15 seconds (SEO quick run) / ~3 minutes (full with LHCI) |

> **Note:** `tests/seo/seo-meta.test.ts` is NOT in `vitest.config.ts` include globs. It runs exclusively via `npx vitest run tests/seo` — never `npm run test:unit` or `npm run test:all`.

---

## Sampling Rate

- **After every task commit:** `npx vitest run tests/seo`
- **After every plan wave:** `npm run build && npx vitest run tests/seo`
- **Before `/gsd-verify-work`:** Full suite green + `npx lhci autorun` green
- **Max feedback latency:** ~15 seconds (SEO quick run)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | seo-performance-gate, D-01, D-02 | LHCI blocks on Performance < 80 and Accessibility < 90 | manual (LHCI) | `npx lhci autorun` (runs after `npm run build`) | ✅ `.lighthouserc.json` edit | ⬜ pending |
| 03-01-02 | 01 | 1 | seo-sitemap, D-07 | `dist/sitemap-index.xml` generated at build time | integration | `npm run build && node -e "require('fs').existsSync('./dist/sitemap-index.xml') && process.exit(0)"` | ❌ Wave 0 — install `@astrojs/sitemap` | ⬜ pending |
| 03-02-01 | 02 | 2 | seo-test-expansion, D-06 | 3 new test assertions: JSON-LD parse, heading hierarchy, sitemap file | unit (static HTML) | `npx vitest run tests/seo` | ❌ Wave 0 — add assertions 11–13 | ⬜ pending |
| 03-03-01 | 03 | 3 | seo-image-optimization, D-03, D-04 | Hero renders as WebP `<img>` with `loading="eager"` + `fetchpriority="high"` | unit (static HTML) | `npm run build && npx vitest run tests/seo` | ✅ existing `Hero.test.ts` (img present; loading/fetchpriority optional) | ⬜ pending |
| 03-03-02 | 03 | 3 | seo-image-optimization, seo-font-loading, D-03, D-04, D-05 | Mentor images are WebP with `loading="lazy"`; no render-blocking Google Fonts `<link rel="stylesheet">` | unit (static HTML) | `npm run build && npx vitest run tests/seo` | ✅ existing tests pass (font and image assertions optional) | ⬜ pending |
| 03-04-01 | 04 | 4 | All requirements | Full verification: SEO tests pass, LHCI gates pass, sitemap present | manual (LHCI + visual) | `npm run build && npx vitest run tests/seo && npx lhci autorun` | ✅ (verification run) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/seo/seo-meta.test.ts` — append assertions 11 (JSON-LD), 12 (heading hierarchy), 13 (sitemap presence). Write RED first, confirm RED state, then implement fixes.
- [ ] Install `@astrojs/sitemap`: `npm install @astrojs/sitemap` — required before `npm run build` can produce `dist/sitemap-index.xml`
- [ ] Optionally add to `tests/unit/components/Hero.test.ts`: assert `loading="eager"` and `fetchpriority="high"` on the hero `<img>` (D-04 regression guard)
- [ ] Optionally add to `tests/seo/seo-meta.test.ts`: assert absence of `rel="stylesheet"` Google Fonts `<link>` (D-05 regression guard)

> The 3 new assertions (D-06) are the only hard Wave 0 gaps. D-04 and D-05 test coverage is optional but recommended for regression safety.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lighthouse Performance ≥ 80 passes | D-01 | LHCI requires a full browser run against built static site; not automatable in unit tests | `npm run build && npx lhci autorun` — check exit code 0 |
| Lighthouse Accessibility ≥ 90 passes | D-02 | Same as above | `npm run build && npx lhci autorun` — check exit code 0 |
| Hero image visually correct after `<Image>` migration | D-03, D-04 | CSS selector compatibility (`.hero-portrait-wrap img`) must be visually verified | `npm run preview` → open browser → confirm hero portrait renders at correct size |
| Font FOUT is acceptable (brief, not jarring) | D-05 | Visual/subjective; no automated metric | `npm run preview` → open browser → reload → confirm font flash is brief |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (all tasks have verify commands)
- [ ] Wave 0 covers all MISSING references (assertions 11–13 + `@astrojs/sitemap`)
- [ ] No watch-mode flags in any test commands
- [ ] Feedback latency < 60s (SEO quick run ~15s)
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 completes

**Approval:** pending
