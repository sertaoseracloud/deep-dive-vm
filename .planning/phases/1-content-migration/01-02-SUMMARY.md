---
phase: 1-content-migration
plan: 02
subsystem: infra
tags: [lighthouse, performance, seo, ci, gap-closure]

# Dependency graph
requires:
  - 01-01 (content extraction pipeline, Playwright baseline)
provides:
  - src/scripts/check-lighthouse.js — Threshold checker (SEO, FCP, LCP, CLS) reading lighthouse-report.json
  - package.json (lighthouse script) — Real Lighthouse CLI invocation, no echo stub
  - package.json (lighthouse:ci script) — Full CI pipeline: build + preview + lighthouse check
affects: [phase-1-validation, ci-gates]

# Tech tracking
tech-stack:
  added:
    - lighthouse@13.3.0 (devDependency — Lighthouse CLI for performance/SEO audits)
  patterns:
    - Threshold-gate pattern: lighthouse CLI writes JSON report; a separate Node script parses and enforces thresholds
    - CI preview pattern: lighthouse:ci chains build -> background preview -> threshold check

key-files:
  created:
    - src/scripts/check-lighthouse.js
  modified:
    - package.json (replaced echo stub; added lighthouse and lighthouse:ci scripts)
    - package-lock.json

key-decisions:
  - "Used --no-sandbox chrome flag for Windows/CI compatibility where Chrome sandbox is unavailable"
  - "check-lighthouse.js uses plain JSON.parse (no schema library) per plan spec — sufficient for reading lighthouse CLI output"
  - "Threshold check separated from CLI invocation (two-step && chain) so thresholds are independently testable"

# Metrics
duration: 10min
completed: 2026-05-11
---

# Phase 1 Plan 02: Lighthouse Gate — Gap Closure Summary

**Replaced echo-stub npm run lighthouse with a real Lighthouse CLI invocation that writes a JSON report and enforces SEO >= 90%, FCP < 1000ms, LCP < 2500ms, CLS <= 0.1 via a new ESM threshold-check script**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-05-11
- **Tasks:** 2 of 2
- **Files modified:** 3 (src/scripts/check-lighthouse.js, package.json, package-lock.json)

## Accomplishments

- Installed `lighthouse@13.3.0` as devDependency
- Created `src/scripts/check-lighthouse.js` (ESM, `"type": "module"` compatible):
  - Reads `lighthouse-report.json` from project root using `fs.readFileSync`
  - Extracts `categories.seo.score`, `audits.first-contentful-paint.numericValue`, `audits.largest-contentful-paint.numericValue`, `audits.cumulative-layout-shift.numericValue`
  - Prints labelled PASS/FAIL line per threshold (e.g., `SEO: 92% >= 90% — PASS`)
  - Exits 1 when any threshold fails or when report file is missing
- Replaced echo stub in `package.json`:
  - `lighthouse` script: real Lighthouse CLI against `http://localhost:4321/deep-dive-vm/` with `--headless --no-sandbox` and `--output json`; chains `node src/scripts/check-lighthouse.js`
  - `lighthouse:ci` script: `npm run build && npx astro preview & sleep 3 && npm run lighthouse` for CI environments

## Task Commits

1. **Task 1: Install lighthouse and write check-lighthouse.js** — `dd5bea3` (feat)
2. **Task 2: Wire package.json lighthouse script** — `5a931ab` (feat)

## Verification Results

- `node --check src/scripts/check-lighthouse.js` — exits 0 (no syntax errors)
- `node src/scripts/check-lighthouse.js` (no report file) — exits 1 with message:
  `Error: lighthouse-report.json not found at C:\Repo\landing-page\deep-dive-vm\lighthouse-report.json`
- `package.json` `lighthouse` script value: `lighthouse http://localhost:4321/deep-dive-vm/ --output json --output-path lighthouse-report.json --chrome-flags="--headless --no-sandbox" && node src/scripts/check-lighthouse.js`
- JSON.parse of package.json — valid (no trailing commas, correct nesting)
- `npm ls lighthouse` — `lighthouse@13.3.0` confirmed in devDependencies

## Lighthouse Version

- `lighthouse@13.3.0` installed. No test run was performed during execution (requires a live server per plan instructions). Actual scores will be verified when `npm run lighthouse` is invoked against a running preview.

## Deviations from Plan

None — plan executed exactly as written. The `--no-sandbox` flag was included as specified in the plan for Windows/CI compatibility.

## Known Stubs

None. The lighthouse script is fully wired. The only prerequisite for a real run is a live server on port 4321.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced beyond what was specified in the plan threat model (lighthouse CLI writes to project root; check-lighthouse.js reads that file with no user input).

## Self-Check: PASSED

| Item | Result |
|------|--------|
| src/scripts/check-lighthouse.js exists | FOUND |
| .planning/phases/1-content-migration/01-02-SUMMARY.md exists | FOUND |
| Task 1 commit dd5bea3 | FOUND |
| Task 2 commit 5a931ab | FOUND |
| node --check src/scripts/check-lighthouse.js | SYNTAX OK |
| package.json echo stub removed | ECHO-FREE OK |
