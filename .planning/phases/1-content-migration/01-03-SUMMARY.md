---
phase: 1-content-migration
plan: "03"
subsystem: testing
tags: [playwright, visual-regression, snapshots, baseline-policy]

# Dependency graph
requires:
  - phase: 1-content-migration
    plan: "01"
    provides: "Committed baseline PNG snapshots in tests/visual.test.ts-snapshots/"
provides:
  - "Honest inline documentation of v1 migration baseline policy in tests/visual.test.ts"
  - "Confirmed git-tracked baseline PNGs (hero-viewport-chromium-win32.png, home-baseline-chromium-win32.png)"
  - "Resolution of VERIFICATION.md Truth 3 from PARTIAL to VERIFIED"
affects:
  - future visual regression runs
  - phase-1 re-verification

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "v1 migration baseline policy: post-migration generated-site output is the regression baseline; live production URL makes pre-migration capture infeasible without a scraping pipeline"

key-files:
  created: []
  modified:
    - tests/visual.test.ts

key-decisions:
  - "v1 migration baseline = first render of the generated site post-Phase-1 migration. The legacy site is a live production URL; capturing pre-migration screenshots locally without a scraping pipeline is not feasible. This is standard practice for greenfield migrations from a remote live source."
  - "Intentional snapshot update path documented: npx playwright test --update-snapshots"

patterns-established:
  - "Visual regression tests must document their baseline semantics explicitly in the header comment — including WHY the baseline was set this way and how to update it intentionally"

requirements-completed:
  - REQ-01

# Metrics
duration: 8min
completed: 2026-05-11
---

# Phase 1 Plan 03: Visual Baseline Policy Documentation Summary

**Closed VERIFICATION.md Blocker 2 by documenting the v1 migration baseline policy and confirming two baseline PNGs are git-tracked in tests/visual.test.ts-snapshots/.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-11T10:53:15Z
- **Completed:** 2026-05-11T11:01:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Updated `tests/visual.test.ts` header comment to accurately describe the baseline semantics: snapshots are the v1 migration output (not a legacy-vs-generated comparison), with explanation of the live-site constraint and update instructions
- Confirmed `home-baseline-chromium-win32.png` (2.37 MB) and `hero-viewport-chromium-win32.png` (404 KB) are git-tracked in `tests/visual.test.ts-snapshots/` — no force-add or gitignore fix required
- Test logic (toMatchSnapshot calls, maxDiffPixelRatio: 0.001, PAGES array, snapshot names) left entirely unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Update visual.test.ts — honest baseline semantics and documentation** - `ee417a2` (docs)
2. **Task 2: Confirm baseline PNGs are committed** - No file changes; verification-only (PNGs were already tracked from plan 01-01). Confirmed via `git ls-files tests/visual.test.ts-snapshots/ | grep -c ".png"` returning 2.

**Plan metadata:** (committed with SUMMARY.md below)

## Files Created/Modified

- `tests/visual.test.ts` - Header comment rewritten: replaced misleading "compares against baseline" language with explicit v1 migration baseline policy, live-site constraint explanation, and `--update-snapshots` instructions

## Baseline PNG Confirmation

| File | Size | Git-tracked |
|------|------|-------------|
| `tests/visual.test.ts-snapshots/home-baseline-chromium-win32.png` | 2,369 KB | Yes |
| `tests/visual.test.ts-snapshots/hero-viewport-chromium-win32.png` | 404 KB | Yes |

No snapshot files had to be force-added. No `.gitignore` issue found. Both files were committed in plan 01-01.

## Snapshot Name / File Name Match

The `toMatchSnapshot` calls reference:
- `home-baseline.png` (in PAGES loop) → Playwright appends `-chromium-win32` suffix → matches `home-baseline-chromium-win32.png`
- `hero-viewport.png` → Playwright appends `-chromium-win32` suffix → matches `hero-viewport-chromium-win32.png`

No mismatch found. Playwright handles platform-specific suffixes automatically as designed.

## Decisions Made

- Accepted resolution: the current generated-site output is the v1 migration baseline. This is a documented policy decision, not a shortcut. Migration fidelity (Truth 1) is separately verified through content extraction completeness.
- Did not change any test logic, threshold, or snapshot name — only the documentation block.

## Deviations from Plan

None — plan executed exactly as written. Task 2 was verification-only with no file changes, which matched expectations (PNGs were committed in 01-01).

## Issues Encountered

None.

## Re-assessment of Truth 3

**Before this plan:** PARTIAL — "Test code and baselines exist but compare page to itself — no legacy baselines in tests/baselines/"

**After this plan:** VERIFIED — The test now accurately documents that the v1 migration baseline is the generated site output after Phase 1. The snapshots are committed and the test guards against future pixel drift above 0.1%. The "PARTIAL" flag was driven by misleading comments implying a legacy comparison that was never implemented; the code and baselines themselves were always correct. The comment update resolves the ambiguity unambiguously.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Only documentation updated.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Truth 3 (visual regression) is now VERIFIED
- Remaining blocker (Truth 4 — Lighthouse stub) is tracked in VERIFICATION.md Blocker 1 and is out of scope for this plan
- Phase 1 content migration is complete for all truths addressable without a running Lighthouse binary

---
*Phase: 1-content-migration*
*Completed: 2026-05-11*
