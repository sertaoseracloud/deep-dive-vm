---
phase: 2-pilot-migration
plan: 01
subsystem: testing
tags: [playwright, pixelmatch, pngjs, visual-regression, baseline-screenshots]

# Dependency graph
requires:
  - phase: 1-content-migration
    provides: tests/visual.test.ts with toMatchSnapshot tests, playwright config, npm scripts

provides:
  - tests/baselines/legacy/pilot-slugs.js — shared PILOT_SECTIONS config (slug → sectionId map)
  - src/scripts/capture-baselines.js — one-shot Playwright scraper for legacy baseline PNGs
  - tests/visual.test.ts (extended) — pixelmatch comparison loop for 5 pilot sections
  - .planning/phases/2-pilot-migration/02-01-SIGN-OFF.md — sign-off checklist awaiting user validation

affects: [phase-3, visual-regression]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pixelmatch direct Buffer comparison for pre-captured external baselines (not toMatchSnapshot)"
    - "section-element screenshot via Playwright locator for single-page sites (page.locator('#id').screenshot())"
    - "fileURLToPath(new URL('.', import.meta.url)) for Windows-safe ESM path resolution"

key-files:
  created:
    - tests/baselines/legacy/pilot-slugs.js
    - src/scripts/capture-baselines.js
    - .planning/phases/2-pilot-migration/02-01-SIGN-OFF.md
  modified:
    - tests/visual.test.ts
    - package.json

key-decisions:
  - "LEGACY_BASE_URL is user-supplied at runtime — not stored in code or committed to git"
  - "Pilot slugs ship as placeholders (hero, pricing, curriculum, bonuses, faq) sourced from src/pages/index.astro section IDs; user must replace with actual GSC top-5 before running scraper"
  - "pixelmatch with MAX_DIFF_RATIO=0.001 used for pilot section comparisons instead of toMatchSnapshot; Phase 1 toMatchSnapshot tests are preserved unchanged"
  - "Baseline PNGs are committed artifacts — tests/visual.test.ts throws a remediation message (not a skip) when a baseline is absent"
  - "Scraper navigates once to LEGACY_BASE_URL then screenshots each section by locator to avoid repeated navigation and overlay-dismissal per slug"

patterns-established:
  - "Section-element pixelmatch pattern: capture section via locator, decode with pngjs, compare with pixelmatch, save diff PNG to test-results/ on failure"
  - "Windows-safe ESM imports: fileURLToPath(new URL('.', import.meta.url)) instead of import.meta.url.pathname directly"

requirements-completed: [REQ-01]

# Metrics
duration: ~30min
completed: 2026-05-11
---

# Phase 2 Plan 01: Pilot Migration Baseline Infrastructure Summary

**Playwright scraper and pixelmatch comparison harness for 5 pilot sections using section-element screenshots against legacy baseline PNGs, with shared pilot-slugs.js config and sign-off checklist.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-05-11
- **Completed:** 2026-05-11
- **Tasks:** 3 (Tasks 1 and 2 fully automated; Task 3 is a human-verify checkpoint with sign-off checklist committed)
- **Files modified:** 5

## Accomplishments

- Created `tests/baselines/legacy/pilot-slugs.js` exporting PILOT_SECTIONS (5 entries mapping human-readable slug names to CSS section IDs)
- Created `src/scripts/capture-baselines.js` — standalone Node ESM script that validates LEGACY_BASE_URL, navigates once to the legacy site, hides overlays/countdowns, and screenshots each section element; exits cleanly with usage instructions when LEGACY_BASE_URL is unset
- Extended `tests/visual.test.ts` with a pixelmatch comparison loop over PILOT_SECTIONS — each section captured via `page.locator(sectionId).screenshot()`, decoded with pngjs, compared against the committed legacy baseline PNG; diff images saved to `test-results/` on failure
- Added `"capture:baselines"` npm script to `package.json`
- Written `02-01-SIGN-OFF.md` — structured sign-off checklist with prerequisite steps, automated validation tables (build, test:visual, lighthouse:ci), per-section status grid, and manual spot-check items

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pilot slugs config and legacy baseline scraper** — `1a39476` (feat)
2. **Task 2: Extend visual.test.ts with legacy baseline pixelmatch comparisons** — `6d17d45` (feat)
3. **Task 3: Sign-off checklist** — `b066117` (docs)

**Plan metadata:** *(this commit)*

## Files Created/Modified

- `tests/baselines/legacy/pilot-slugs.js` — ESM module exporting PILOT_SECTIONS array; placeholder slugs (hero→#top, pricing→#investimento, curriculum→#ementa, bonuses→#bonus, faq→#faq)
- `src/scripts/capture-baselines.js` — one-shot Playwright scraper; validates LEGACY_BASE_URL, hides sticky/fixed overlays, screenshots section elements, saves to tests/baselines/legacy/
- `tests/visual.test.ts` — extended with pixelmatch pilot loop; Phase 1 toMatchSnapshot tests preserved unchanged
- `package.json` — added `"capture:baselines": "node src/scripts/capture-baselines.js"` script
- `.planning/phases/2-pilot-migration/02-01-SIGN-OFF.md` — sign-off checklist awaiting user completion

## Decisions Made

- **LEGACY_BASE_URL is runtime-only:** The legacy site URL is not committed to code. It is passed via environment variable at scraper invocation time (`LEGACY_BASE_URL=<url> node src/scripts/capture-baselines.js` or `node --env-file .env src/scripts/capture-baselines.js`). The scraper validates URL syntax (non-http(s) schemes rejected) per threat T-02-01.
- **Placeholder slugs by design:** Exact GSC top-5 data was not available at plan time (decision D-01/D-02). PILOT_SECTIONS ships with placeholder entries sourced from confirmed `src/pages/index.astro` section IDs. User must replace with real GSC data before running the scraper.
- **pixelmatch over toMatchSnapshot for pilot sections:** Playwright's snapshot system manages its own PNG registry. Baseline PNGs captured from an external legacy site must live outside that registry to prevent `--update-snapshots` from overwriting them (RESEARCH.md Pitfall 5). Direct pixelmatch over `fs.readFileSync` baselines is immune to snapshot updates.
- **Committed PNGs as source of truth:** Baseline PNGs are tracked in git (not generated on CI). When absent, tests fail with a clear remediation message. This is intentional — the visual contract is explicit, not auto-generated.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Before the visual regression tests can pass, the user must complete these steps:

1. **Optionally edit pilot slugs:** Replace placeholders in `tests/baselines/legacy/pilot-slugs.js` with actual GSC top-5 section slugs if available. Confirm the `sectionId` values match the live legacy page's `<section id="...">` attributes.
2. **Capture legacy baselines:** Run the scraper with the production URL:
   ```
   LEGACY_BASE_URL=<your-legacy-url> node src/scripts/capture-baselines.js
   ```
   Or with a .env file: `node --env-file .env src/scripts/capture-baselines.js`
3. **Verify 5 PNGs created:** `ls tests/baselines/legacy/*.png`
4. **Commit baseline PNGs:**
   ```
   git add tests/baselines/legacy/*.png
   git commit -m "chore(phase-2): commit legacy baseline PNGs for pilot sections"
   ```
5. **Run the full validation chain:**
   ```
   npm run build
   npm run test:visual
   npm run lighthouse:ci
   ```
6. **Complete 02-01-SIGN-OFF.md:** Fill in test results, complete manual browser spot-check, and mark the sign-off as APPROVED.

Note: `npm run test:visual` will fail with a clear remediation message for each missing baseline PNG until step 4 is complete. This is intentional — the test cannot self-heal.

## Known Stubs

- `tests/baselines/legacy/pilot-slugs.js` — PILOT_SECTIONS contains placeholder slugs (hero, pricing, curriculum, bonuses, faq). These are valid section IDs on the generated Astro page but may not correspond to the actual GSC top-5 sections. **User must confirm or replace before running the scraper.** This is documented in the file header and in 02-01-SIGN-OFF.md prerequisites.
- `tests/baselines/legacy/*.png` — No baseline PNGs are committed yet. The scraper must be run by the user with `LEGACY_BASE_URL` set. Tests will fail with a remediation message until PNGs are committed.

## Next Phase Readiness

- Phase 3 (Full Migration) depends on Phase 2 sign-off being marked APPROVED in `02-01-SIGN-OFF.md`.
- The pixelmatch comparison pattern and pilot-slugs.js config established here are reusable for additional sections in Phase 3.
- Blocker: User must run `capture-baselines.js`, commit PNGs, run `npm run test:visual` and `npm run lighthouse:ci`, complete the manual spot-check, and mark `02-01-SIGN-OFF.md` as APPROVED before Phase 3 begins.

## Self-Check: PASSED

- `1a39476` exists in git log (Task 1: pilot-slugs.js + capture-baselines.js + package.json script)
- `6d17d45` exists in git log (Task 2: visual.test.ts extended with pixelmatch + pngjs.d.ts type shim)
- `b066117` exists in git log (Task 3: 02-01-SIGN-OFF.md written)
- `tests/baselines/legacy/pilot-slugs.js` created
- `src/scripts/capture-baselines.js` created
- `tests/visual.test.ts` extended with pixelmatch pilot loop
- `package.json` updated with `capture:baselines` script
- `.planning/phases/2-pilot-migration/02-01-SIGN-OFF.md` created

---
*Phase: 2-pilot-migration*
*Completed: 2026-05-11*
