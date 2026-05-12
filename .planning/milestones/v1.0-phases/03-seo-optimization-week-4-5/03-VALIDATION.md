---
phase: "03"
slug: 03-seo-optimization
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-11
updated: 2026-05-11
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

> **Wave 2 fix (critical):** `tests/seo/**/*.test.ts` was NOT in `vitest.config.ts` include globs before execution. Wave 2 (plan 03-02) added it. Without this fix, `npx vitest run tests/seo` produced "No test files found" — the CI SEO step was silently non-functional. All 13 SEO assertions now run correctly under both `npx vitest run tests/seo` and `npm run test:all`.

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
| 03-01-01 | 01 | 1 | seo-performance-gate, D-01, D-02 | LHCI blocks on Performance < 80 and Accessibility < 90 | manual (LHCI) | `npx lhci autorun` (after `npm run build`) | ✅ `.lighthouserc.json` — 4 error/warn gates confirmed | ✅ green |
| 03-01-02 | 01 | 1 | seo-sitemap, D-07 | `dist/sitemap-index.xml` generated at build time | integration | `npm run build && node -e "require('fs').existsSync('./dist/sitemap-index.xml') && process.exit(0)"` | ✅ `@astrojs/sitemap` installed, build produces sitemap | ✅ green |
| 03-02-01 | 02 | 2 | seo-test-expansion, D-06 | 3 new test assertions: JSON-LD parse, heading hierarchy, sitemap file | unit (static HTML) | `npx vitest run tests/seo` | ✅ assertions 11–13 added + `vitest.config.ts` fixed | ✅ green |
| 03-03-01 | 03 | 3 | seo-image-optimization, D-03, D-04 | Hero renders as WebP `<img>` with `loading="eager"` + `fetchpriority="high"` | unit (static HTML) | `npm run build && npx vitest run tests/seo` | ✅ Hero.astro uses `<Image loading="eager" fetchpriority="high">` | ✅ green |
| 03-03-02 | 03 | 3 | seo-image-optimization, seo-font-loading, D-03, D-04, D-05 | Mentor images are WebP with `loading="lazy"`; no render-blocking Google Fonts `<link rel="stylesheet">` | unit (static HTML) | `npm run build && npx vitest run tests/seo` | ✅ Mentor.astro lazy images; Layout.astro preload+onload+noscript | ✅ green |
| 03-04-01 | 04 | 4 | All requirements | Full verification: SEO tests pass, LHCI gates pass, sitemap present | manual (LHCI + visual) | `npm run build && npx vitest run tests/seo && npm run test:all && npx lhci autorun` | ✅ all gates passed | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Final Verification Results (Wave 4)

| Check | Command | Result |
|-------|---------|--------|
| Build | `npm run build` | Exit 0 — 3 WebP images, `dist/sitemap-index.xml` generated |
| SEO assertions | `npx vitest run tests/seo` | **13/13 PASS** (0 failures) |
| Full suite | `npm run test:all` | **106/106 PASS** across 13 test files |
| LHCI — Performance | `npx lhci autorun` | **0.91 ≥ 0.80** [error gate] PASS |
| LHCI — SEO | `npx lhci autorun` | **1.00 ≥ 0.90** [error gate] PASS |
| LHCI — Accessibility | `npx lhci autorun` | **0.96 ≥ 0.90** [error gate] PASS |
| LHCI — Best Practices | `npx lhci autorun` | **0.96 ≥ 0.80** [warn gate] PASS |
| WebP files | `dist/_astro/` | claudio1, claudio2, marcelo — all `.webp` ✓ |
| Sitemap | `dist/sitemap-index.xml` | Present, valid XML ✓ |
| Font preload | `dist/index.html` | `rel="preload" as="style"` + noscript ✓ |

---

## Requirement Coverage

| Requirement ID | Evidence | Status |
|----------------|----------|--------|
| `seo-performance-gate` | LHCI Performance 0.91 ≥ 0.80; Accessibility 0.96 ≥ 0.90 — both error gates pass | SATISFIED |
| `seo-image-optimization` | 3 WebP files in `dist/_astro/`; Hero: eager/high-priority; Mentor: lazy | SATISFIED |
| `seo-font-loading` | `rel="preload" as="style"` + `onload` swap + `<noscript>` — no render-blocking stylesheet | SATISFIED |
| `seo-test-expansion` | `tests/seo/seo-meta.test.ts` has 13 assertions, 13/13 PASS | SATISFIED |
| `seo-sitemap` | `@astrojs/sitemap` installed; `dist/sitemap-index.xml` present after build | SATISFIED |

---

## Wave 0 Completion

- [x] `tests/seo/seo-meta.test.ts` — assertions 11 (JSON-LD), 12 (heading hierarchy), 13 (sitemap) added — all GREEN
- [x] `vitest.config.ts` — `tests/seo/**/*.test.ts` added to include globs (critical Rule 3 fix — SEO tests were silently excluded)
- [x] `@astrojs/sitemap` installed — `dist/sitemap-index.xml` produced at build time
- [x] Optional D-04/D-05 assertions: not added (SEO assertions 11–13 provide sufficient regression coverage)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Status |
|----------|-------------|------------|--------|
| Lighthouse Performance ≥ 80 passes | D-01 | LHCI requires full browser run | ✅ LHCI exit 0; score 0.91 |
| Lighthouse Accessibility ≥ 90 passes | D-02 | LHCI requires full browser run | ✅ LHCI exit 0; score 0.96 |
| Hero image visually correct after `<Image>` migration | D-03, D-04 | CSS selector compatibility requires visual check | ⬜ pending (checkpoint Task 2 sign-off) |
| Font FOUT is acceptable (brief, not jarring) | D-05 | Visual/subjective | ⬜ pending (checkpoint Task 2 sign-off) |

---

## Validation Audit (2026-05-11)

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Tasks green | 6 / 6 |
| Wave 0 items resolved | 3 (assertions 11–13, vitest.config.ts fix, sitemap install) |
| Escalated | 0 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (assertions 11–13 + `@astrojs/sitemap` + vitest.config.ts fix)
- [x] No watch-mode flags in any test commands
- [x] Feedback latency < 60s (SEO quick run ~15s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-11
