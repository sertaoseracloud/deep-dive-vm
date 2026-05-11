# Phase 4: Continuous Validation - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Enforce quality gates automatically: raise test coverage threshold to 95%, add a weekly scheduled Lighthouse audit, surface coverage results via a static badge, and persist LHCI score history in a SQLite database committed to the repo root. No new feature development — this phase is entirely CI/CD and configuration changes.

</domain>

<decisions>
## Implementation Decisions

### Coverage Threshold
- **D-01:** Raise `thresholds` in `vitest.config.ts` from 80% → 95% on **all four metrics**: `statements`, `branches`, `functions`, `lines`.
- **D-02:** The gate is **hard** (CI fails if below 95%). The existing `--coverage` flag in `test:unit` already exits non-zero when thresholds aren't met — raising the number keeps this behavior.
- **D-03:** Do NOT add utility modules first. Raise to 95% as-is. The `.astro` exclusion means the coverable surface is currently thin; the gate will still enforce quality as the surface grows.

### Weekly Lighthouse
- **D-04:** Add a **new** GitHub Actions workflow file (e.g., `.github/workflows/lighthouse-weekly.yml`) with a `schedule: cron: '0 0 * * 0'` (Sunday midnight UTC).
- **D-05:** The weekly job runs **`npm run build && npx lhci autorun`** — same as the push workflow (build fresh from source, then audit). No dependency on the live deployed URL.
- **D-06:** The weekly job is separate from `test.yml` — does not gate pushes, runs independently on schedule.

### Coverage Visibility
- **D-07:** Add a **shields.io coverage badge** to the README. Generated from `coverage/coverage-summary.json` (produced by `@vitest/coverage-v8`'s JSON reporter, already configured).
- **D-08:** Badge is hosted as a **static JSON file committed to a `badges` branch** in this repo, readable by shields.io endpoint pattern. CI step writes the badge JSON after coverage runs and commits/pushes to the `badges` branch.
- **D-09:** No Codecov or third-party account required.

### LHCI Score Persistence
- **D-10:** Run a **local LHCI SQLite server**. The `lhci.db` file lives in the **repo root** of `main` (user's choice — note: binary file grows over time; consider adding `lhci.db` to `.gitignore` if history becomes unwieldy).
- **D-11:** Change `upload.target` in `.lighthouserc.json` from `"temporary-public-storage"` to `"lhci"` pointing at the local SQLite server.
- **D-12:** CI starts the LHCI server, runs `npx lhci autorun`, and the server commits `lhci.db` back to main. (Implementation detail: the executor should evaluate whether this is feasible in stateless CI or if a simpler approach like LHCI's built-in `--config.upload.target=filesystem` JSON output is more practical.)

### Claude's Discretion
- Badge branch name (`badges` or `gh-pages`) — pick whichever doesn't conflict with existing GitHub Pages setup.
- Whether the weekly workflow also uploads an artifact (the LHCI report) for additional reference.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CI Configuration
- `.github/workflows/test.yml` — Existing CI workflow. The weekly workflow must mirror the lighthouse job's steps without conflicting.
- `.lighthouserc.json` — LHCI gate configuration. `upload.target` must be changed for SQLite persistence.

### Coverage Configuration
- `vitest.config.ts` — Thresholds to raise from 80% → 95%. Coverage reporters already configured (text, json, html).
- `coverage/coverage-summary.json` — Output of v8 JSON reporter. The badge CI step reads this file to extract the overall statement % for the badge.

### Project Requirements
- `.planning/REQUIREMENTS.md` — Validation & Monitoring section: SEO score thresholds, coverage minimums.
- `.planning/ROADMAP.md` — Phase 4 scope: coverage enforcement + SEO health monitoring.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/test.yml` `lighthouse` job (lines ~55–72): Template for the weekly workflow. Copy and adapt with `schedule:` trigger instead of `push:`/`pull_request:`.
- `coverage/coverage-summary.json`: Already produced by `npm run test:unit` via `@vitest/coverage-v8`. Contains `total.statements.pct` — the field to read for the badge.

### Established Patterns
- All CI jobs use `actions/checkout@v4`, `actions/setup-node@v4 (node 22, cache npm)`, `npm ci` — the weekly workflow must follow the same pattern.
- LHCI artifacts currently use `retention-days: 30` — the `lighthouse-weekly.yml` should also specify retention for its artifacts.

### Integration Points
- The `badges` branch must be created before the first CI run writes to it.
- `lhci.db` in the repo root requires the LHCI server to be running locally during CI — the executor should research whether `@lhci/cli` supports a filesystem JSON target as a simpler alternative to SQLite server.

</code_context>

<specifics>
## Specific Ideas

- The weekly cron job should run on **Sunday midnight UTC** (`cron: '0 0 * * 0'`).
- Badge JSON format compatible with shields.io endpoint badge: `{ "schemaVersion": 1, "label": "coverage", "message": "95%", "color": "brightgreen" }`.
- LHCI SQLite: user explicitly chose `lhci.db` in repo root (not a dedicated branch). Planner should flag the binary growth concern and offer the filesystem JSON alternative as a de-risk if SQLite proves impractical in CI.

</specifics>

<deferred>
## Deferred Ideas

- Codecov integration for PR diff annotations — out of scope; user chose static badge instead.
- Auditing the live deployed URL (`https://mentoria.sertaoseracloud.com/deep-dive-vm/`) — out of scope; weekly job uses build-fresh approach.
- Extending artifact retention to 90 days — superseded by SQLite persistence decision.

</deferred>

---

*Phase: 4-continuous-validation*
*Context gathered: 2026-05-11*
