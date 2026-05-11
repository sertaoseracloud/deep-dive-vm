---
phase: 03-seo-optimization-week-4-5
plan: "02"
subsystem: testing
tags: [vitest, seo, json-ld, heading-hierarchy, sitemap, tdd]
dependency_graph:
  requires:
    - phase: "03-01"
      provides: "@astrojs/sitemap installed and npm run build producing dist/sitemap-index.xml"
  provides:
    - "Vitest SEO suite expanded to 13 assertions (tests 11-13 added)"
    - "DIST_DIR constant for sitemap file-existence checks"
    - "tests/seo/** included in vitest.config.ts discover globs"
  affects:
    - "CI lighthouse job (npx vitest run tests/seo now runs all 13 assertions)"
    - "Wave 3 image/font optimizations (tests 11-13 serve as regression guards)"
tech_stack:
  added: []
  patterns:
    - "TDD RED->GREEN: write assertions first, observe state, commit before implementation"
    - "Append-only to existing describe block — never create new describe for same file"
    - "DIST_DIR constant pattern for dist/ file-existence assertions in SEO tests"
key_files:
  created: []
  modified:
    - "tests/seo/seo-meta.test.ts"
    - "vitest.config.ts"
key_decisions:
  - "Test 11 (JSON-LD) written as regression guard — immediately GREEN because Layout.astro already has ld+json"
  - "Test 12 (heading hierarchy) written as regression guard — immediately GREEN (one H1 in Hero, H2s in sections, no skips)"
  - "Test 13 (sitemap) written as canonical RED->GREEN marker — GREEN at write time because Wave 1 already installed sitemap and ran build"
  - "vitest.config.ts include globs extended to add tests/seo/**/*.test.ts (Rule 3: SEO tests were silently excluded from discovery)"
patterns-established:
  - "SEO test file path pattern: DIST_DIR = join(__dirname, '../../dist') for file-existence checks"
  - "JSON-LD regex: /<script[^>]+type=[\"']application\\/ld\\+json[\"'][^>]*>([\\s\\S]*?)<\\/script>/i"
  - "Heading hierarchy check: matchAll(/<(h[1-6])[\\s>]/gi) then check diff <= 1 for downward moves only"
requirements-completed:
  - seo-test-expansion
duration: ~8min
completed: "2026-05-11"
---

# Phase 03 Plan 02: Extend SEO Assertion Suite (D-06) Summary

**Three new Vitest SEO assertions for JSON-LD schema, heading hierarchy, and sitemap presence appended to the existing 10-test suite, plus vitest.config.ts fix enabling test discovery for tests/seo/**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-11T22:35:00Z
- **Completed:** 2026-05-11T22:43:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Extended `tests/seo/seo-meta.test.ts` from 10 to 13 assertions
- Added `DIST_DIR` constant alongside existing `DIST_INDEX` for file-existence checks
- Fixed `vitest.config.ts` to include `tests/seo/**/*.test.ts` in discovery (pre-existing config gap — SEO tests were silently not running under `npx vitest run tests/seo`)
- All 3 new tests are GREEN against current dist/ (Wave 1 build already satisfied all three conditions)

## TDD RED/GREEN State

| Test | Expected State | Actual State | Reason |
|------|---------------|--------------|--------|
| 11. JSON-LD parse | GREEN | GREEN | `<script type="application/ld+json">` already present in `Layout.astro` with `@context` and `@type` |
| 12. Heading hierarchy | GREEN | GREEN | Hero.astro has single H1, section headings use H2 — no skips or inversions |
| 13. Sitemap file exists | GREEN (Wave 1 built) | GREEN | `dist/sitemap-index.xml` produced by Wave 1 `npm run build` with `@astrojs/sitemap` |

Tests 1-10 (prior suite): 11 pass, 1 fail (Test 4 — `og:description` is null, **pre-existing issue** not introduced by this plan; out of scope).

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write 3 new SEO assertions — RED phase (D-06a/b/c) | 4948f35 | tests/seo/seo-meta.test.ts, vitest.config.ts |

## Files Created/Modified

- `tests/seo/seo-meta.test.ts` — Added `DIST_DIR` constant and three new `it()` blocks (assertions 11, 12, 13)
- `vitest.config.ts` — Added `"tests/seo/**/*.test.ts"` to `include` globs

## Decisions Made

- All three tests are GREEN at this stage because Wave 1 completed all prerequisite implementation work before Wave 2 tests were written. This is the correct outcome as noted in the plan — "If GREEN, that is correct — Wave 1 already made it green."
- Tests 11 and 12 serve as pure regression guards; tests 13 locks the sitemap file presence contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended vitest.config.ts include globs to add tests/seo/**/*.test.ts**
- **Found during:** Task 1 (running `npx vitest run tests/seo` to confirm test state)
- **Issue:** `vitest.config.ts` only included `tests/unit/**` and `tests/integration/**`. Running `npx vitest run tests/seo` produced "No test files found, exiting with code 1" — meaning the CI step `npx vitest run tests/seo` in `test.yml` was silently skipping all SEO tests.
- **Fix:** Added `"tests/seo/**/*.test.ts"` to the `include` array in `vitest.config.ts`
- **Files modified:** `vitest.config.ts`
- **Verification:** After fix, `npx vitest run tests/seo` discovers and runs all 13 SEO tests
- **Committed in:** 4948f35 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking — CI SEO test step was non-functional)
**Impact on plan:** Essential fix — without it, all 13 SEO tests were invisible to the test runner. No scope creep.

## Issues Encountered

- **Pre-existing Test 4 failure:** `og:description` meta tag returns null in the built HTML. This is not caused by this plan's changes. Logged as a deferred issue — Wave 3 changes to `Layout.astro` may incidentally fix it. Out of scope for this plan.

## Known Stubs

None. All three assertions are wired to real data sources (built HTML, built sitemap file).

## Threat Surface Scan

No new security-relevant surface introduced. All assertions operate on local build output (dist/) with no network access, external input, or file writes.

## Self-Check

- `tests/seo/seo-meta.test.ts` — exists, 13 `it()` blocks confirmed, `DIST_DIR` constant present
- `vitest.config.ts` — `tests/seo/**/*.test.ts` glob present in include array
- Commit `4948f35` — exists in git log
- `npx vitest run tests/seo` reports 13 tests (12 pass, 1 pre-existing fail on Test 4)
- Tests 11, 12, 13 all PASS

## Self-Check: PASSED

## Next Phase Readiness

- Wave 3 (image optimization, font loading fix) can proceed with confidence that the SEO regression suite now covers JSON-LD, heading hierarchy, and sitemap presence
- Pre-existing Test 4 (`og:description null`) should be investigated when editing `Layout.astro` in Wave 3 — likely a meta attribute ordering issue that the `extractMetaContent` regex doesn't handle

---
*Phase: 03-seo-optimization-week-4-5*
*Completed: 2026-05-11*
