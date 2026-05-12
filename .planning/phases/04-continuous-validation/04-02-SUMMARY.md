---
phase: 04-continuous-validation
plan: "02"
subsystem: ci-coverage-badge
tags: [coverage, badge, shields, ci, badges-branch, D-07, D-08, D-09, D-13]
dependency_graph:
  requires:
    - 04-01 (coverage thresholds in vitest.config.ts)
  provides:
    - Live coverage badge in README.md
    - badges orphan branch with shields.io endpoint JSON
    - CI step to publish badge on main push
  affects:
    - .github/workflows/test.yml
    - README.md
    - origin/badges branch
tech_stack:
  added:
    - shields.io endpoint badge pattern (static JSON on orphan branch)
  patterns:
    - Orphan branch as static file host (no GitHub Pages needed)
    - Machine commit with [skip ci] to prevent CI loop (D-13)
    - Job-scoped contents:write permission (not workflow-wide)
key_files:
  created:
    - badges/coverage.json (on origin/badges branch — orphan, one file only)
  modified:
    - .github/workflows/test.yml (added permissions + Publish coverage badge step)
    - README.md (added shields.io endpoint badge after H1)
decisions:
  - "Used low-level git commands (git commit-tree, git mktree, git update-ref) to create orphan branch without switching worktree HEAD — preserves agent branch integrity"
  - "badge step handles missing total key and missing coverage-summary.json file both, writing 0%/red fallback"
  - "Color thresholds: >=90 brightgreen, >=75 yellow, else red; 0% edge case explicitly red"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-12"
  tasks_completed: 3
  tasks_total: 4
  files_created: 1
  files_modified: 2
---

# Phase 4 Plan 02: Coverage Badge Pipeline Summary

**One-liner:** shields.io endpoint coverage badge backed by `badges` orphan branch JSON, published by CI on main push with `[skip ci]` loop guard and empty-surface fallback.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Pre-create badges orphan branch with seed coverage.json | badges:04743af (origin) | badges/coverage.json on origin/badges |
| 2 | Add job permissions and Publish coverage badge step to test.yml | 2791cff | .github/workflows/test.yml |
| 3 | Add shields.io endpoint badge to README.md | 9403472 | README.md |
| 4 | Human verification checkpoint | — | awaiting |

## What Was Built

### Task 1: badges Orphan Branch

- Created `badges` orphan branch using low-level git objects (`git commit-tree`, `git mktree`, `git update-ref`) without switching the worktree's HEAD
- Seeded with `badges/coverage.json`: `{"schemaVersion":1,"label":"coverage","message":"0%","color":"red"}`
- Pushed to `origin/badges` with commit message `init: create badges branch [skip ci]`
- Branch contains exactly one file: `badges/coverage.json`
- Commit: `04743af9087be638e7601844d7dd67f5f41ff25d` on origin/badges

### Task 2: test.yml Badge Step

- Added `permissions: contents: write` at job level on `unit-and-integration` (not workflow-wide)
- Added `Publish coverage badge` step gated on `github.ref == 'refs/heads/main'`
- Badge step:
  - Reads `coverage/coverage-summary.json` via `node -e`
  - Guards against missing file AND missing `total` key — both produce `0%`/`red` fallback
  - Color thresholds: `>= 90` → `brightgreen`; `>= 75` → `yellow`; else `red`
  - Configures `github-actions[bot]` git user
  - Fetches `origin badges`, checks out `badges` branch, writes JSON, stages ONLY `badges/coverage.json`
  - Uses `git diff --staged --quiet ||` to skip empty commits
  - Commit message: `chore: update coverage badge [skip ci]` (D-13 satisfied)
  - Returns to `main` after push

### Task 3: README.md Badge

- Inserted badge line immediately after the first H1 heading (line 3)
- URL: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/sertaoseracloud/deep-dive-vm/badges/badges/coverage.json`
- No third-party account or token required (D-09)

## Deviations from Plan

### Auto-applied Deviation (Rule 1 — Bug Prevention)

**1. [Rule 2 - Missing Critical Functionality] Added missing-file guard to badge step**
- **Found during:** Task 2 implementation review
- **Issue:** Plan specified only `if (!json.total)` guard, but `fs.readFileSync` throws if `coverage/coverage-summary.json` doesn't exist (first CI run before coverage has run)
- **Fix:** Added `fs.existsSync('coverage/coverage-summary.json')` check before reading — writes `0%`/`red` if file missing
- **Files modified:** `.github/workflows/test.yml`
- **Commit:** 2791cff

### Implementation Note: Orphan Branch Creation

The plan specified `git checkout --orphan badges && git rm -rf .` which doesn't work safely inside a git worktree (would strip staging area, risk corrupting worktree). Instead used low-level git plumbing commands (`git hash-object`, `git mktree`, `git commit-tree`, `git update-ref`) to create the orphan branch without touching the worktree's HEAD or staging area. Result is identical: orphan branch with exactly one file, correct [skip ci] commit message, pushed to origin.

## Threat Surface Scan

All implemented security mitigations match the plan's threat register:

| Threat | Mitigation Applied |
|--------|--------------------|
| T-04-02-01: CI loop | `[skip ci]` in commit message (grep verified in acceptance criteria) |
| T-04-02-02: Force push | Regular `git push` only (no `--force`) |
| T-04-02-03: Broad write scope | `permissions: contents: write` at job level only |
| T-04-02-05: Fork PR push | `if: github.ref == 'refs/heads/main'` gate |
| T-04-02-06: Empty surface crash | `!fs.existsSync(...)` and `!json.total` fallbacks |

No new threat surface introduced beyond what the plan modeled.

## Known Stubs

None — all wiring is complete. The badge will show `0%` (red) until the first main push triggers the CI step and overwrites `badges/coverage.json` with the actual coverage %.

## Checkpoint Status

**Task 4 (human-verify):** Awaiting first main push + CI run to confirm badge renders on GitHub README without recursive CI loop.

## Self-Check

- [x] `badges/coverage.json` exists on `origin/badges` branch
- [x] Commit `2791cff` exists: `git log --oneline | grep 2791cff`
- [x] Commit `9403472` exists: `git log --oneline | grep 9403472`
- [x] YAML parses: `node -e` check prints `ok`
- [x] README badge count: `grep -c "img.shields.io/endpoint" README.md` = 1
