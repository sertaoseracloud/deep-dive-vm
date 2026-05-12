---
phase: 04-continuous-validation
plan: "04"
subsystem: ci-lhci-persistence
tags: [lhci, lighthouse, filesystem, persistence, ci, github-actions]
dependency_graph:
  requires: [04-01, 04-02, 04-03]
  provides: [lhci-filesystem-target, lhci-ci-commit-step]
  affects: [.lighthouserc.json, .github/workflows/test.yml, .github/workflows/lighthouse-weekly.yml]
tech_stack:
  added: []
  patterns: [filesystem-json-upload, skip-ci-commit, contents-write-permission]
key_files:
  created: []
  modified:
    - .lighthouserc.json
    - .github/workflows/test.yml
    - .github/workflows/lighthouse-weekly.yml
decisions:
  - "D-10/D-11: filesystem JSON target chosen over SQLite/lhci-server — zero new dependencies"
  - "D-12: both CI workflows commit .lighthouseci/*.json to main after each LHCI run"
  - "D-13: [skip ci] enforced in both commit messages to prevent recursive CI loops"
  - "T-04-04-05 mitigation: test.yml commit step gated on refs/heads/main to prevent PR pushes"
metrics:
  duration: "5 minutes"
  completed: "2026-05-12"
  tasks_completed: 5
  tasks_total: 5
  files_modified: 3
  files_created: 0
---

# Phase 04 Plan 04: LHCI Filesystem Persistence Summary

**One-liner:** Switched LHCI from ephemeral public storage to filesystem JSON target, wired both CI workflows to commit `.lighthouseci/*.json` to main with `[skip ci]` guard.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Switch .lighthouserc.json upload.target to filesystem | ebc2124 | .lighthouserc.json |
| 2 | Verify .gitignore does not exclude .lighthouseci | (no commit — no change needed) | .gitignore (read-only verify) |
| 3 | Add lighthouse job permissions and LHCI commit step in test.yml | 8b59ed9 | .github/workflows/test.yml |
| 4 | Add LHCI commit step to lighthouse-weekly.yml | bd9827c | .github/workflows/lighthouse-weekly.yml |
| 5 | Verify LHCI filesystem run produces .lighthouseci/manifest.json | (no commit — smoke test only) | (runtime verification) |

## Changes Made

### .lighthouserc.json
- Replaced `"target": "temporary-public-storage"` with `"target": "filesystem", "outputDir": ".lighthouseci"`
- All assertion thresholds (seo, accessibility, best-practices, performance) preserved unchanged
- No `serverBaseUrl`, `token`, or SQLite keys added

### .github/workflows/test.yml (lighthouse job)
- Added `permissions: contents: write` at job level
- Expanded `actions/checkout@v4` with `token: ${{ secrets.GITHUB_TOKEN }}` and `fetch-depth: 0`
- Inserted `Commit LHCI filesystem results` step between `npx lhci autorun` and artifact upload:
  - Gated `if: github.ref == 'refs/heads/main'` (no push on PRs — T-04-04-05 mitigation)
  - Commit message: `chore: update lhci results [skip ci]`
  - Stages only `.lighthouseci/` — never `git add .` or `git add -A`

### .github/workflows/lighthouse-weekly.yml
- Inserted `Commit LHCI filesystem results` step between `Lighthouse CI weekly audit` and artifact upload:
  - No ref-gate needed (schedule cron only fires on default branch)
  - Commit message: `chore: update lhci weekly results [skip ci]`
  - Stages only `.lighthouseci/` — never `git add .` or `git add -A`
  - Existing `permissions: contents: write` and `fetch-depth: 0` from Plan 04-03 reused

## Smoke Test Results (Task 5)

- `npm run test:unit`: exit 0 (106 tests passed)
- `npm run build`: exit 0 (1 page built in 4.33s)
- `npx lhci autorun`: ran 3 Lighthouse runs, dumped reports to `.lighthouseci/`
- `.lighthouseci/manifest.json`: EXISTS
- `.lighthouseci/` not staged (CI is canonical writer, D-12)

## Verification Results

All automated assertions passed:

```
node -e "...lighthouserc.json assertions..." → ok
node -e "...test.yml YAML assertions..."     → ok
node -e "...lighthouse-weekly.yml assertions..." → ok
grep @lhci/server|sqlite3 package.json  → Not found
grep LHCI_BUILD_TOKEN .github .lighthouserc.json → Not found
.gitignore clean of .lighthouseci/lhci.db → count: 0
```

## Decisions Made

- **D-10 satisfied:** filesystem JSON target chosen; zero new npm dependencies installed
- **D-11 satisfied:** `.lighthouserc.json` `upload.target` is `"filesystem"` with `outputDir: ".lighthouseci"`
- **D-12 satisfied:** both CI workflows commit `.lighthouseci/*.json` to main after each LHCI run
- **D-13 satisfied:** every machine commit message contains `[skip ci]` (verified via regex in plan assertions)

## Deviations from Plan

### Deviation: Worktree merge required

- **Found during:** Execution start
- **Issue:** Worktree branch `worktree-agent-ad5a0ffd184da1749` was created from commit `0c2c862` (before Plans 04-01 through 04-03 were committed to local `main`). The `depends_on: [04-01, 04-02, 04-03]` prerequisite files (updated `test.yml`, new `lighthouse-weekly.yml`, plan files) were absent from the worktree.
- **Fix:** Merged `refs/heads/main` into the worktree branch via `git merge refs/heads/main --no-edit` (fast-forward, no conflicts). This is the standard worktree initialization pattern for a stale worktree.
- **Files affected:** 18 files merged (workflow files, planning files, vitest.config.ts, README.md)
- **Rule:** Rule 3 (auto-fix blocking issue — prerequisite files missing would have prevented all tasks)

No other deviations. Plan executed as written after the merge.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes beyond what was planned. The `contents: write` permission on the `lighthouse` job in `test.yml` was planned (T-04-04-03 documented in threat model). No unplanned trust boundary changes found.

## Known Stubs

None. All changes are CI/config-only; no UI stubs or placeholder data paths.

## Self-Check: PASSED

Files exist:
- .lighthouserc.json — FOUND (modified)
- .github/workflows/test.yml — FOUND (modified)
- .github/workflows/lighthouse-weekly.yml — FOUND (modified)
- .lighthouseci/manifest.json — FOUND (smoke test artifact)

Commits exist:
- ebc2124 — Task 1 (feat: switch LHCI upload target)
- 8b59ed9 — Task 3 (feat: add LHCI commit step to test.yml)
- bd9827c — Task 4 (feat: add LHCI commit step to lighthouse-weekly.yml)
