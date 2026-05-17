---
phase: 07-hub-page
plan: "02"
subsystem: hub-page-render
tags: [astro, hub, linktree, open-graph, accessibility, ssg]
dependency_graph:
  requires:
    - Layout.astro ogImage and noindex props (07-01)
    - src/data/social-links.ts (07-01)
    - src/data/courses.ts (07-01)
    - src/components/ui/SocialIcon.astro (07-01)
    - public/hub-og.png (07-01)
  provides:
    - src/pages/index.astro as full Linktree hub
    - HUB-01 mentor identity section (photo, h1, bio)
    - HUB-02 course cards (active + coming-soon)
    - HUB-03 social icon links (4 networks, data-driven)
    - HUB-04 Open Graph with hub-og.png
  affects:
    - dist/index.html (full hub HTML output)
tech_stack:
  added: []
  patterns:
    - Data-driven rendering via src/data/ static arrays in Astro pages
    - Conditional template rendering (coming-soon vs active course cards)
    - CSS custom property tokens from Layout.astro applied in scoped style block
    - prefers-reduced-motion media query clearing transitions and transforms
key_files:
  created: []
  modified:
    - src/pages/index.astro
decisions:
  - "Hub uses #conteudo-principal as main id (distinct from LP's #main to avoid anchor conflicts)"
  - "No <a> element rendered for coming-soon cards — defensive pointer-events:none CSS rule included for future-proofing"
  - "url prop uses literal string (not Astro.url) for exact canonical control per D-06"
  - "Social icons wrapped in role=list/listitem div for semantic list without native <ul> styling constraints"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-17"
  tasks_completed: 1
  tasks_total: 1
  files_created: 0
  files_modified: 1
---

# Phase 7 Plan 02: Hub Page Render Summary

**One-liner:** Full Linktree-style hub rewrite of index.astro — mentor photo, h1, bio, 4 data-driven social icon links, 2 course cards with badges, OG tags, skip-link, reduced-motion support, and removal of noindex.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Rewrite src/pages/index.astro as Linktree hub | `3b0ae61` | src/pages/index.astro |

## Verification Results

- `npm run build` exits 0
- `dist/index.html` contains `<h1>Cláudio Filipe Lima Raposo</h1>`
- `dist/index.html` og:image content contains `hub-og.png`
- `dist/index.html` og:url is `https://mentoria.sertaoseracloud.com/`
- `dist/index.html` has NO `<meta name="robots" content="noindex">`
- `dist/index.html` has exactly 4 elements with `class="social-icon-link"`
- `dist/index.html` has exactly 2 elements with class containing `course-card`
- `dist/index.html` has `id="conteudo-principal"` and `href="#conteudo-principal"`
- `dist/deep-dive-vm/index.html` intact — LP not regressed (verified: has og:image, no hub-og.png, no noindex)
- All 13 source assertions passed (no slot="head", no noindex, correct props, correct imports, bio text, loading="eager", reduced-motion block)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `public/hub-og.png`: Placeholder image carried from plan 01 (claudio1.png resized). User must replace with branded 1200x630 OG image before first production deploy.
- `src/data/social-links.ts` WhatsApp URL: `https://wa.me/PLACEHOLDER` — intentional per T-07-01 threat model and D-03 decision. Resolves when user substitutes real phone number.

## Threat Flags

None — all threats addressed per T-07-05 through T-07-08:
- T-07-05 (external anchors): All social links have `rel="noopener noreferrer"` and `target="_blank"` — verified by count assertion.
- T-07-06 (coming-soon card): No `<a>` rendered for coming-soon cards; defensive `pointer-events: none` CSS included.
- T-07-07 (indexability): noindex meta fully removed; hub is now indexable as intended per D-07.
- T-07-08 (package installs): No package installs in this plan.

## Self-Check: PASSED

- `src/pages/index.astro` — FOUND (modified, 282 insertions)
- Commit `3b0ae61` — verified in git log
- `dist/index.html` — FOUND, all assertions pass
- `dist/deep-dive-vm/index.html` — FOUND, LP regression check passed
