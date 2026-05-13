# Phase 4: Continuous Validation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11 (updated 2026-05-12)
**Phase:** 4-continuous-validation
**Areas discussed:** Coverage threshold, Weekly Lighthouse, Coverage visibility, LHCI score persistence, LHCI persistence path (update), Machine-commit loop prevention

---

## Coverage Threshold

| Option | Description | Selected |
|--------|-------------|----------|
| Raise to 95% as-is | Bump thresholds now; empty surface = 100%, no false failures | ✓ |
| Add utility modules first | Extract shared logic into .ts files before raising | |
| Keep 80%, add trend | Don't change threshold; add reporting to show direction | |

**User's choice:** Raise to 95% as-is (recommended)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hard gate — CI fails if below 95% | Existing behavior preserved, exits non-zero | ✓ |
| Advisory — report but don't block | Useful if aspirational during active development | |

**User's choice:** Hard gate (CI fails)

---

| Option | Description | Selected |
|--------|-------------|----------|
| All four: statements, branches, functions, lines | Strictest signal | ✓ |
| Statements + branches only | Most meaningful metrics | |
| Lines only | Simplest metric | |

**User's choice:** All four metrics at 95%

---

## Weekly Lighthouse

| Option | Description | Selected |
|--------|-------------|----------|
| Scheduled cron workflow | New workflow, `cron: '0 0 * * 0'`, Sunday midnight UTC | ✓ |
| Per-push is sufficient | Existing lighthouse job satisfies weekly requirement | |
| Manual dispatch trigger | `workflow_dispatch` on existing lighthouse job | |

**User's choice:** Add dedicated scheduled cron workflow

---

| Option | Description | Selected |
|--------|-------------|----------|
| Build fresh from source | `npm run build && npx lhci autorun` — consistent with CI | ✓ |
| Audit live deployed URL | Run against https://mentoria.sertaoseracloud.com/deep-dive-vm/ | |

**User's choice:** Build fresh from source

---

## Coverage Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions artifacts only | Keep as-is, view in Actions tab | |
| Add coverage badge to README | shields.io badge from coverage-summary.json | ✓ |
| Codecov integration | Third-party, PR diff annotations, CODECOV_TOKEN required | |

**User's choice:** Add coverage badge to README

---

| Option | Description | Selected |
|--------|-------------|----------|
| Static shields.io badge from coverage-summary.json | No secrets, committed to badges branch | ✓ |
| Gist-based badge | GIST_TOKEN required, doesn't pollute branches | |

**User's choice:** Static badge committed to `badges` branch

---

## LHCI Score Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Extend GitHub artifact retention to 90 days | Simple, 3 months of history | |
| LHCI SQLite server on a branch | Web UI, richer history, more setup | |
| Keep 30 days (current) | Minimal, spot checks only | |

**User's choice:** LHCI SQLite server — but committed to main repo root (not a dedicated branch)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated lhci-data branch | History accumulates, doesn't pollute main | |
| Committed to main repo root | Simpler, but binary grows in git history | ✓ |

**User's choice:** Committed to main repo root

**Notes:** Potential concern flagged — binary `lhci.db` grows indefinitely in main. Planner should evaluate filesystem JSON target as a lighter alternative and flag this to the user during planning.

---

## Claude's Discretion

- Badge branch name: `badges` or `gh-pages` — pick whichever doesn't conflict with GitHub Pages setup
- Whether the weekly workflow also uploads an artifact (the LHCI report) for additional reference

## Deferred Ideas

- Codecov integration for PR diff annotations (out of scope — user chose static badge)
- Auditing the live deployed URL (out of scope — build-fresh approach chosen)
- Extending artifact retention to 90 days (superseded by SQLite persistence decision)

---

## [Update 2026-05-12] LHCI Persistence Path

| Option | Description | Selected |
|--------|-------------|----------|
| filesystem JSON | `upload.target: "filesystem"`, `.lighthouseci/` output. Zero extra deps. | ✓ |
| SQLite server | `@lhci/server` + `sqlite3` + `LHCI_BUILD_TOKEN` + `lhci.db` in repo. | |

**User's choice:** filesystem JSON (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| `.lighthouseci/` committed to main | Simple, no extra branch. | ✓ |
| Dedicated `lhci-history` branch | Clean main, requires orphan branch pre-creation. | |

**User's choice:** `.lighthouseci/` in main

**Notes:** Supersedes original D-10/D-11/D-12 SQLite decisions. Eliminates all Wave 0 SQLite dependencies.

---

## [Update 2026-05-12] Machine-Commit Loop Prevention

| Option | Description | Selected |
|--------|-------------|----------|
| `[skip ci]` in commit message | Native GitHub Actions support. Zero config changes. | ✓ |
| Branch filter in test.yml | Requires workflow edits, doesn't cover all cases. | |
| Separate bot PAT | Secret management overhead. | |

**User's choice:** `[skip ci]` in commit message — hard rule (D-13)

**Notes:** Mandatory for all machine commits: badge JSON to `badges` branch, LHCI JSON to `main`. Prevents infinite CI loops.
