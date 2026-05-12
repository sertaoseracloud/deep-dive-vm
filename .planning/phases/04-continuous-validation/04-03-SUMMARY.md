---
phase: 04-continuous-validation
plan: "03"
subsystem: infra
tags: [lighthouse, ci, cron, github-actions, weekly]

requires:
  - phase: 04-continuous-validation
    provides: "Phase context, patterns map, and LHCI configuration baseline"

provides:
  - "Weekly Lighthouse CI workflow scaffold at .github/workflows/lighthouse-weekly.yml"
  - "Sunday midnight UTC cron trigger (D-04) with workflow_dispatch manual trigger"
  - "Build + lhci autorun job independent of push/PR gate (D-05, D-06)"
  - "workflow-level contents:write permission ready for Plan 04-04 filesystem commit step"

affects:
  - 04-continuous-validation plan-04 (04-04 extends this workflow with commit step)

tech-stack:
  added: []
  patterns:
    - "Standalone weekly cron workflow separate from push/PR gating CI"
    - "fetch-depth:0 checkout pre-wired for future git push capability"

key-files:
  created:
    - .github/workflows/lighthouse-weekly.yml
  modified: []

key-decisions:
  - "Scaffold only — omit commit step per plan instruction; Plan 04-04 owns that step"
  - "Workflow-level permissions:contents:write set now to avoid a second PR in 04-04"
  - "fetch-depth:0 and token: ${{ secrets.GITHUB_TOKEN }} on checkout pre-wired for 04-04 git push"

patterns-established:
  - "Weekly cron workflow pattern: schedule + workflow_dispatch, no push/PR triggers"
  - "Artifact upload with if:always() and retention-days:30 for lighthouse reports"

requirements-completed: [D-04, D-05, D-06]

duration: 8min
completed: 2026-05-12
---

# Phase 04 Plan 03: Weekly Lighthouse Audit Workflow Summary

**GitHub Actions weekly cron scaffold triggering Lighthouse CI on Sunday midnight UTC, independent of push/PR gate, with contents:write permission and fetch-depth:0 pre-wired for Plan 04-04 filesystem commit integration**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-12T08:10:00Z
- **Completed:** 2026-05-12T08:18:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `.github/workflows/lighthouse-weekly.yml` with Sunday midnight UTC cron (D-04)
- Workflow runs standalone: npm ci → npm run build → npx lhci autorun (D-05) with no push/PR triggers (D-06)
- Workflow-level `permissions: contents: write` and `fetch-depth: 0` pre-wired for Plan 04-04's filesystem commit step
- All 106 unit tests still pass (config-only addition, no source changes)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create .github/workflows/lighthouse-weekly.yml** - `3f4a75e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `.github/workflows/lighthouse-weekly.yml` - Weekly Lighthouse CI workflow: cron + workflow_dispatch triggers, single job with checkout/setup-node/npm ci/npm run build/lhci autorun/upload-artifact

## Decisions Made

- Scaffold only (no commit step): Plan 04-03 explicitly defers the `Commit LHCI filesystem results` step to Plan 04-04, which also owns the `.lighthouserc.json` upload.target change to `filesystem`
- Workflow-level permissions vs job-level: only one job in this workflow, so workflow-level `contents: write` is equivalent and simpler (per T-04-03-01 acceptance in threat model)
- Pre-wired `fetch-depth: 0` and `token: ${{ secrets.GITHUB_TOKEN }}` on checkout: avoids a second file-modification PR in 04-04 and does not affect this plan's behavior

## Deviations from Plan

None — plan executed exactly as written. The PATTERNS.md shows the full target file (including commit step), but the PLAN.md explicitly instructs to omit that step. PLAN.md takes precedence.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required for this workflow scaffold. Plan 04-04 will require verifying `secrets.GITHUB_TOKEN` scope when the commit step is added.

## Threat Surface Scan

No new trust boundaries introduced beyond what the plan's threat model already documents:
- `permissions: contents: write` at workflow level is accepted (T-04-03-01)
- No new external inputs — cron trigger is GitHub-internal

## Next Phase Readiness

- Plan 04-04 can directly extend `.github/workflows/lighthouse-weekly.yml` by inserting the `Commit LHCI filesystem results` step after the `Lighthouse CI weekly audit` step
- `.lighthouserc.json` `upload.target` change to `filesystem` is also Plan 04-04's responsibility
- `workflow_dispatch` is available for manual end-to-end testing before cron fires

---
*Phase: 04-continuous-validation*
*Completed: 2026-05-12*
