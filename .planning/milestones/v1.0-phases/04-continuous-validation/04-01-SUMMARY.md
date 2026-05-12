---
phase: 04-continuous-validation
plan: "01"
subsystem: testing/ci
tags: [vitest, coverage, ci, thresholds]
requirements: [D-01, D-02, D-03]

dependency_graph:
  requires: []
  provides: [coverage-gate-95pct]
  affects: [vitest.config.ts, .github/workflows/test.yml]

tech_stack:
  added: []
  patterns: [vitest-coverage-thresholds, ci-gate-labelling]

key_files:
  created: []
  modified:
    - vitest.config.ts
    - .github/workflows/test.yml

decisions:
  - "95% threshold applied to all four coverage metrics (statements, branches, functions, lines) per D-01/D-02/D-03"
  - "Empty coverable surface (0/0) does not fail thresholds — vitest/v8 reports 0% without triggering gate per A1 in RESEARCH.md"

metrics:
  duration: "~5 minutes"
  completed: "2026-05-12"
  tasks_completed: 2
  files_modified: 2
---

# Phase 04 Plan 01: Coverage Threshold Gate at 95% Summary

**One-liner:** Vitest coverage gate raised from absent to a hard 95% threshold on statements, branches, functions, and lines; CI step label updated to reflect the new threshold.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add 95% thresholds block to vitest.config.ts | 8e3a180 | vitest.config.ts |
| 2 | Update test.yml coverage gate step name to 95% | 1315d0d | .github/workflows/test.yml |

## What Was Built

- **vitest.config.ts**: Replaced the `// thresholds removed as they are not needed` comment inside the `coverage` config block with a `thresholds` object containing `statements: 95`, `branches: 95`, `functions: 95`, `lines: 95`. All other coverage keys (`provider`, `include`, `exclude`, `reporter`) remain unchanged.
- **.github/workflows/test.yml**: Renamed the unit test step from `Unit tests (coverage gate >= 80%)` to `Unit tests (coverage gate >= 95%)`. Step `run:` content and surrounding steps unchanged. YAML remains valid.

## Verification Results

- `npm run test:unit` exits 0 — 106 tests pass across 13 test files
- `grep -E "statements:\s*95" vitest.config.ts` — 1 match (correct)
- `grep -E "branches:\s*95" vitest.config.ts` — 1 match (correct)
- `grep -E "functions:\s*95" vitest.config.ts` — 1 match (correct)
- `grep -E "lines:\s*95" vitest.config.ts` — 1 match (correct)
- `grep -c "thresholds removed as they are not needed" vitest.config.ts` — 0 (correct)
- `grep -c "coverage gate >= 95%" .github/workflows/test.yml` — 1 (correct)
- `grep -c "coverage gate >= 80%" .github/workflows/test.yml` — 0 (correct)
- YAML parse: valid

Note: Coverage table shows `0 | 0 | 0 | 0` for all files — this is expected. The `exclude` rules remove all `.astro` files and `src/assets/**` / `src/pages/**`, leaving no `.ts` utility modules in `src/**` yet. Per D-03, the empty coverable surface is acceptable; vitest/v8 does not fail thresholds at 0/0.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - both changes are fully wired (threshold enforcement in vitest.config.ts, label in test.yml).

## Threat Flags

No new security-relevant surface introduced. Changes are config-only and CI-config-only.

## Self-Check: PASSED

- vitest.config.ts exists and contains thresholds block: FOUND
- .github/workflows/test.yml exists with 95% label: FOUND
- Commit 8e3a180 (Task 1): FOUND
- Commit 1315d0d (Task 2): FOUND
- npm run test:unit exits 0: CONFIRMED
