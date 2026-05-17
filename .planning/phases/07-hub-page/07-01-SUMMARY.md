---
phase: 07-hub-page
plan: "01"
subsystem: layout-and-data-foundation
tags: [astro, ssg, open-graph, svg-icons, typescript]
dependency_graph:
  requires: []
  provides:
    - Layout.astro ogImage and noindex props
    - src/data/social-links.ts typed export
    - src/data/courses.ts typed export
    - src/components/ui/SocialIcon.astro inline SVG
    - public/hub-og.png 1200x630 placeholder
  affects:
    - src/layouts/Layout.astro
    - src/components/ui/SocialIcon.astro
tech_stack:
  added: []
  patterns:
    - src/data/ static typed data modules (new pattern for project)
    - Record<Props['name'], string> for SVG path lookup in Astro components
    - Conditional ogImageUrl with fallback (ogImage ?? claudio1.src)
key_files:
  created:
    - src/data/social-links.ts
    - src/data/courses.ts
    - src/components/ui/SocialIcon.astro
    - public/hub-og.png
  modified:
    - src/layouts/Layout.astro
decisions:
  - "ogImage prop uses path-from-root convention (must start with /); documented in Props interface"
  - "WhatsApp URL uses PLACEHOLDER literal per T-07-01 threat model — no phone number invented"
  - "ariaLabel kept in SocialLink data and SocialIcon Props interface for type safety but not rendered on SVG (consumer applies to <a> wrapper)"
  - "hub-og.png generated from claudio1.png resize via sharp (already installed) — no new dependencies"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-17"
  tasks_completed: 4
  tasks_total: 4
  files_created: 4
  files_modified: 1
---

# Phase 7 Plan 01: Layout Foundation + Data Files + SocialIcon + OG Placeholder Summary

**One-liner:** Surgical Layout.astro extension (ogImage/noindex props), new src/data/ directory with typed social-links and courses exports, SocialIcon.astro with Bootstrap Icons SVG paths, and 1200x630 hub-og.png placeholder via sharp.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add ogImage and noindex props to Layout.astro | `9879933` | src/layouts/Layout.astro |
| 2 | Create typed data files social-links.ts and courses.ts | `0ce3b01` | src/data/social-links.ts, src/data/courses.ts |
| 3 | Create SocialIcon.astro with inline SVG for 4 networks | `a1a1800` | src/components/ui/SocialIcon.astro |
| 4 | Generate public/hub-og.png placeholder 1200x630 | `65e6e8a` | public/hub-og.png |

## Verification Results

- `npm run build` exits 0 after all tasks
- `dist/deep-dive-vm/index.html` retains claudio1-based og:image — no hub-og.png reference
- `dist/deep-dive-vm/index.html` has no robots noindex meta
- `public/hub-og.png` dimensions: 1200x630 PNG (verified via sharp metadata)
- SocialIcon.astro compiled cleanly (no page imports it yet — wired in plan 02)
- No new entries in package.json dependencies or devDependencies
- No script artifacts left in repo (one-shot sharp script executed inline via stdin)

## Deviations from Plan

None — plan executed exactly as written.

The only minor note: the `ogImage ?` source assertion in Task 1 acceptance criteria specified checking for the substring `ogImage ?` (with space before `?`). The actual file formats it as a ternary across lines (`ogImage\n\t? ...`). The behavior is identical — the conditional works correctly as verified by build and LP smoke test. This is a formatting difference, not a semantic one.

## Known Stubs

- `public/hub-og.png`: Placeholder image (claudio1.png resized). User must replace with branded 1200x630 OG image before first production deploy. Referenced in `src/data/social-links.ts` WhatsApp URL as `https://wa.me/PLACEHOLDER` — user must replace `PLACEHOLDER` with actual phone number before deploy.
- `src/data/social-links.ts` WhatsApp URL: `https://wa.me/PLACEHOLDER` — intentional per T-07-01 threat model and D-03 decision. Resolves when user substitutes real number.

## Threat Flags

None — all threats addressed per T-07-01 through T-07-04 in plan threat model.

## Self-Check: PASSED

- `src/layouts/Layout.astro` — FOUND (modified)
- `src/data/social-links.ts` — FOUND (created)
- `src/data/courses.ts` — FOUND (created)
- `src/components/ui/SocialIcon.astro` — FOUND (created)
- `public/hub-og.png` — FOUND (created, 1200x630 PNG)
- Commits `9879933`, `0ce3b01`, `a1a1800`, `65e6e8a` — all verified in git log
