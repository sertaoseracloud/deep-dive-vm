---
phase: 03-seo-optimization-week-4-5
plan: "01"
subsystem: ci-config, astro-build
tags: [lighthouse-ci, sitemap, astro, seo, ci-gates]
dependency_graph:
  requires: []
  provides:
    - ".lighthouserc.json four-gate CI assertion block"
    - "@astrojs/sitemap integration producing dist/sitemap-index.xml"
  affects:
    - "CI lighthouse job (categories:performance gate now blocks)"
    - "CI lighthouse job (categories:accessibility promoted to error)"
    - "npm run build output (new dist/sitemap-index.xml, dist/sitemap-0.xml)"
tech_stack:
  added:
    - "@astrojs/sitemap (3.x) — build-time sitemap XML generation"
  patterns:
    - "LHCI assert syntax: [\"error\", { \"minScore\": N }] for blocking gates"
    - "Astro integrations array in defineConfig for build plugins"
key_files:
  created: []
  modified:
    - ".lighthouserc.json"
    - "astro.config.mjs"
    - "package.json"
    - "package-lock.json"
decisions:
  - "D-01: Add categories:performance gate as error at minScore 0.8 — CI now blocks on Performance < 80"
  - "D-02: Promote categories:accessibility from warn to error at minScore 0.9 — Phase 2 a11y tests passing"
  - "D-07: Manual astro.config.mjs edit chosen over npx astro add sitemap to avoid trailing-comment patcher risk (RESEARCH.md open question 2)"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-11"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
---

# Phase 03 Plan 01: Harden Lighthouse CI Gates + Install Sitemap Integration Summary

Wave 1 prerequisite — Lighthouse CI promoted to block on Performance >= 80 and Accessibility >= 90 (error), and @astrojs/sitemap installed with astro.config.mjs wired so `npm run build` emits `dist/sitemap-index.xml`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Harden Lighthouse CI assertion gates (D-01, D-02) | 6e49a29 | .lighthouserc.json |
| 2 | Install @astrojs/sitemap and wire into astro.config.mjs (D-07) | cd55df0 | package.json, package-lock.json, astro.config.mjs |

## What Was Built

### Task 1 — Lighthouse CI Gate Hardening

Updated `.lighthouserc.json` from 3 to 4 assertion entries:

- `categories:accessibility`: promoted from `"warn"` to `"error"` (D-02) — Phase 2 a11y tests all pass, skip-link implemented
- `categories:performance`: new entry `["error", { "minScore": 0.8 }]` (D-01) — CI now blocks on Performance < 80
- `categories:seo`: unchanged at `["error", { "minScore": 0.9 }]`
- `categories:best-practices`: unchanged at `["warn", { "minScore": 0.8 }]`
- `numberOfRuns: 3` and `staticDistDir: "./dist"` preserved
- `aggregationMethod` intentionally omitted (LHCI default is "optimistic" — best of 3 runs for flap protection)

### Task 2 — Sitemap Integration

- Installed `@astrojs/sitemap` via `npm install @astrojs/sitemap` (added to `dependencies`)
- Rewrote `astro.config.mjs` manually (per RESEARCH.md — `npx astro add sitemap` not used to avoid trailing-comment patcher conflict)
- Final `astro.config.mjs` imports `sitemap from '@astrojs/sitemap'` and declares `integrations: [sitemap()]`
- All three existing config values preserved: `site: 'https://sertaoseracloud.github.io'`, `base: '/deep-dive-vm'`, `outDir: 'dist'`
- `npm run build` exits 0 and produces `dist/sitemap-index.xml` and `dist/sitemap-0.xml`

## Verification Results

```
categories:performance: ["error",{"minScore":0.8}]  ✓
categories:accessibility: ["error",{"minScore":0.9}] ✓
categories:seo: ["error",{"minScore":0.9}]           ✓
categories:best-practices: ["warn",{"minScore":0.8}] ✓
@astrojs/sitemap in dependencies: true               ✓
sitemap import in astro.config.mjs: true             ✓
integrations: [sitemap()] in astro.config.mjs: true  ✓
site/base/outDir preserved: true                     ✓
dist/sitemap-index.xml: true                         ✓
dist/index.html: true                                ✓
```

## Deviations from Plan

None — plan executed exactly as written. Manual edit of `astro.config.mjs` was the plan-specified approach (not `npx astro add sitemap`), matching the decision in RESEARCH.md open question 2 resolution.

## Known Stubs

None. All artifacts are fully wired and functional.

## Threat Surface Scan

No new security-relevant surface introduced beyond what was documented in the plan's threat model:
- `dist/sitemap-index.xml` exposes public URL structure — acceptable for a public landing page (T-03-01-03, accepted)
- `@astrojs/sitemap` is a build-time devDependency from the official Astro team (T-03-01-02, accepted)

## Self-Check: PASSED

- `.lighthouserc.json` — verified via node one-liner, 4 assertion entries confirmed
- `astro.config.mjs` — verified via node string checks, all values present
- `package.json` — @astrojs/sitemap in dependencies confirmed
- `dist/sitemap-index.xml` — existsSync confirmed after `npm run build`
- `dist/index.html` — existsSync confirmed (no regression)
- Task 1 commit `6e49a29` — exists
- Task 2 commit `cd55df0` — exists
