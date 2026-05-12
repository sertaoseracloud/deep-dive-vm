# Phase 4: Continuous Validation - Context

**Gathered:** 2026-05-12 (updated)
**Status:** Ready for planning

<domain>
## Phase Boundary

Enforce quality gates automatically: raise test coverage threshold to 95%, add a weekly scheduled Lighthouse audit, surface coverage results via a static badge, and persist LHCI score history as filesystem JSON committed to the repo root. No new feature development — this phase is entirely CI/CD and configuration changes.

</domain>

<decisions>
## Implementation Decisions

### Coverage Threshold
- **D-01:** Raise `thresholds` in `vitest.config.ts` from removed → 95% on **all four metrics**: `statements`, `branches`, `functions`, `lines`.
- **D-02:** The gate is **hard** (CI fails if below 95%). The existing `--coverage` flag in `test:unit` already exits non-zero when thresholds aren't met — adding the thresholds at 95% keeps this behavior.
- **D-03:** Do NOT add utility modules first. Raise to 95% as-is. The `.astro` exclusion means the coverable surface is currently thin; the gate will still enforce quality as the surface grows.

### Weekly Lighthouse
- **D-04:** Add a **new** GitHub Actions workflow file (`.github/workflows/lighthouse-weekly.yml`) with `schedule: cron: '0 0 * * 0'` (Sunday midnight UTC).
- **D-05:** The weekly job runs **`npm run build && npx lhci autorun`** — same as the push workflow (build fresh from source, then audit). No dependency on the live deployed URL.
- **D-06:** The weekly job is separate from `test.yml` — does not gate pushes, runs independently on schedule.

### Coverage Visibility
- **D-07:** Add a **shields.io coverage badge** to the README. Generated from `coverage/coverage-summary.json` (produced by `@vitest/coverage-v8`'s JSON reporter, already configured).
- **D-08:** Badge is hosted as a **static JSON file committed to a `badges` branch** in this repo, readable by shields.io endpoint pattern. CI step writes the badge JSON after coverage runs and commits/pushes to the `badges` branch.
- **D-09:** No Codecov or third-party account required.

### LHCI Score Persistence
- **D-10:** Use **`filesystem` JSON target** for LHCI uploads. Output dir: `.lighthouseci/`. Zero extra dependencies — no `@lhci/server`, no `sqlite3`, no `LHCI_BUILD_TOKEN` secret needed.
- **D-11:** Change `upload.target` in `.lighthouserc.json` from `"temporary-public-storage"` to `"filesystem"` and add `upload.outputDir: ".lighthouseci"`.
- **D-12:** CI commits `.lighthouseci/*.json` files to `main` after each LHCI run. History is browsable via git log.

### Machine Commit Loop Prevention
- **D-13:** **`[skip ci]` is MANDATORY** in every machine commit message that writes generated files (badge JSON to `badges` branch, LHCI JSON to `main`). Failure to include `[skip ci]` causes infinite CI loop. All plans and executor tasks in this phase MUST enforce this convention.

### Claude's Discretion
- Badge branch name (`badges` or `gh-pages`) — pick whichever doesn't conflict with existing GitHub Pages setup.
- Whether the weekly workflow also uploads an artifact (the LHCI report) for additional reference.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CI Configuration
- `.github/workflows/test.yml` — Existing CI workflow. The weekly workflow must mirror the lighthouse job's steps without conflicting.
- `.lighthouserc.json` — LHCI gate configuration. `upload.target` must be changed to `"filesystem"` with `outputDir: ".lighthouseci"`.

### Coverage Configuration
- `vitest.config.ts` — Thresholds currently removed; must be added at 95% on all four metrics. Coverage reporters already configured (text, json, html).
- `coverage/coverage-summary.json` — Output of v8 JSON reporter. The badge CI step reads this file to extract the overall statement % for the badge.

### Project Requirements
- `.planning/REQUIREMENTS.md` — Validation & Monitoring section: SEO score thresholds, coverage minimums.
- `.planning/ROADMAP.md` — Phase 4 scope: coverage enforcement + SEO health monitoring.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/test.yml` `lighthouse` job (lines ~76–97): Template for the weekly workflow. Copy and adapt with `schedule:` trigger instead of `push:`/`pull_request:`.
- `coverage/coverage-summary.json`: Already produced by `npm run test:unit` via `@vitest/coverage-v8`. Contains `total.statements.pct` — the field to read for the badge.

### Established Patterns
- All CI jobs use `actions/checkout@v4`, `actions/setup-node@v4 (node 22, cache npm)`, `npm ci` — the weekly workflow must follow the same pattern.
- LHCI artifacts currently use `retention-days: 30` — the `lighthouse-weekly.yml` should also specify retention for its artifacts.

### Integration Points
- The `badges` branch must be created before the first CI run writes to it (orphan branch pre-created as Wave 0 requirement).
- `.lighthouseci/` will accumulate JSON files on every CI run — add to `.gitignore` only the transient lock files if any; the result JSON files themselves must be committed.

</code_context>

<specifics>
## Specific Ideas

- The weekly cron job should run on **Sunday midnight UTC** (`cron: '0 0 * * 0'`).
- Badge JSON format compatible with shields.io endpoint badge: `{ "schemaVersion": 1, "label": "coverage", "message": "95%", "color": "brightgreen" }`.
- LHCI filesystem target config in `.lighthouserc.json`: `"upload": { "target": "filesystem", "outputDir": ".lighthouseci" }`.
- D-13 machine commit example: `git commit -m "ci: update coverage badge [skip ci]"`.

</specifics>

<deferred>
## Deferred Ideas

- Codecov integration for PR diff annotations — out of scope; user chose static badge instead.
- Auditing the live deployed URL (`https://mentoria.sertaoseracloud.com/deep-dive-vm/`) — out of scope; weekly job uses build-fresh approach.
- Extending artifact retention to 90 days — superseded by filesystem JSON persistence decision.
- SQLite LHCI server with dashboard UI — deferred; filesystem JSON target chosen for simplicity (no `@lhci/server`, no `sqlite3`, no `LHCI_BUILD_TOKEN`).

</deferred>

---

*Phase: 4-continuous-validation*
*Context gathered: 2026-05-12*
