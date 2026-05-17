---
phase: 08-multi-lp-scaffold
plan: "03"
subsystem: documentation
tags: [howto, documentation, developer-experience, scaffold, lp-lite]
dependency_graph:
  requires:
    - src/pages/deep-dive-ec2/index.astro (live example — created in plan 08-01)
    - public/ec2-og.png (OG placeholder — created in plan 08-01)
    - tests/e2e/ec2-coming-soon.spec.ts (E2E analog — created in plan 08-02)
    - tests/seo/seo-meta.test.ts (SEO test analog — test 16 created in plan 08-02)
    - src/data/courses.ts (courses array pattern)
  provides:
    - HOWTO-new-landing-page.md (developer checklist at repo root)
  affects:
    - Developer onboarding for new LP creation
    - Future Claude agents adding new landing pages
tech_stack:
  added: []
  patterns:
    - 7-step numbered checklist with runnable commands
    - Anti-patterns section derived from Phase 8 implementation pitfalls
    - Live-example references to in-repo files (not pseudocode)
key_files:
  created:
    - HOWTO-new-landing-page.md
  modified: []
decisions:
  - "Headings without backticks to satisfy plan verification script (## 1. Create src/pages/ prefix match)"
  - "sharp script uses ESM import with fileURLToPath/__dirname pattern — matches ec2-og.png and hub-og.png generation scripts"
  - "Pitfall 1 (DIST_INDEX reuse) documented prominently in Step 5 with CRITICAL label — highest risk of silent false positive"
  - "No LHCI config instructions per RESEARCH Q6 — coming-soon pages out of scope for Lighthouse audits"
metrics:
  duration: "~20 minutes"
  completed: "2026-05-17"
  tasks_completed: 1
  files_created: 1
  files_modified: 0
---

# Phase 8 Plan 03: HOWTO-new-landing-page.md Summary

HOWTO-new-landing-page.md — 7-step runnable checklist for adding LP-lite pages, referencing EC2 route as live in-repo proof, documenting four anti-patterns from Phase 8 implementation.

## What Was Built

Created `HOWTO-new-landing-page.md` at the repository root. The document is a numbered,
runnable checklist covering the full lifecycle from file creation to live deployment.

### Content Overview

**7 steps:**

1. `src/pages/[slug]/index.astro` — copy EC2 page, substitute 5 Layout props, critical
   constraints on `ogImage` leading slash, `noindex`/`jsonLd` omission
2. `src/data/courses.ts` — append `{ title, description, url, status: 'coming-soon' }`;
   hub renders automatically
3. `public/[slug]-og.png` — sharp ESM script template (1200×630, `fit: 'cover'`,
   `position: 'top'`); verify command; delete-after-use instruction
4. `tests/e2e/[slug]-coming-soon.spec.ts` — copy `ec2-coming-soon.spec.ts`, substitute
   paths; relative `./[slug]/` URL requirement for Playwright baseURL
5. `tests/seo/seo-meta.test.ts` — append `it()` block; CRITICAL warning against
   reusing module-level `DIST_INDEX`/`html` (Pitfall 1 — silent false positive)
6. Local validation — exact commands: `npm run build`, `npx playwright test`, `npx vitest run`,
   full suite `npm run test:all && npx playwright test`
7. Deploy checklist — files to stage, CNAME verification command, HTTP 200 curl check,
   no LHCI config changes needed

**Live Example table:** Maps each step to its concrete in-repo file (EC2 analog).

**Anti-patterns section:** Documents 4 pitfalls verified during Phase 8 implementation.

## Deviations from Plan

None — plan executed exactly as written.

Minor: headings were initially written with backticks (e.g., `## 1. Create \`src/pages/\``)
which caused the plan's automated verification script to fail on prefix match. Backticks
removed from headings — cosmetic adjustment, no content change.

## Verification

```
node -e "..." → OK 8248 bytes / ALL CHECKS PASSED
```

All 17 required terms present in the document. Size within 2000-15000 byte bounds.

## Known Stubs

None. This plan delivers documentation only — no data-flow or rendering stubs.

## Threat Flags

None. Documentation file — no network endpoints, auth paths, or trust boundaries introduced.

## Self-Check

- [x] `HOWTO-new-landing-page.md` exists at repo root
- [x] Commit `698b7ec` exists in git log
- [x] No unexpected file deletions
- [x] All 7 required headings present
- [x] EC2 live example referenced throughout
- [x] Four anti-patterns documented
- [x] No LHCI config instructions included
- [x] STATE.md not modified
- [x] ROADMAP.md not modified

## Self-Check: PASSED
