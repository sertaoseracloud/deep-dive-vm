---
phase: 08-multi-lp-scaffold
plan: "02"
subsystem: testing
tags: [playwright, vitest, axe-core, e2e, seo, open-graph, ec2, wcag]

dependency_graph:
  requires:
    - phase: 08-01
      provides: src/pages/deep-dive-ec2/index.astro, public/ec2-og.png, dist/deep-dive-ec2/index.html
    - phase: 07-hub-page
      provides: tests/e2e/hub.spec.ts (structure template), tests/seo/seo-meta.test.ts (tests 1-15)
  provides:
    - tests/e2e/ec2-coming-soon.spec.ts (7 Playwright tests — SCAFF-01 CI gate)
    - tests/seo/seo-meta.test.ts test 16 (og:image ec2-og.png verification)
  affects:
    - CI pipeline (ec2-coming-soon.spec.ts auto-discovered by glob tests/e2e/**/*.spec.ts)
    - SEO coverage (test 16 gates ec2-og.png continuity on every build)

tech-stack:
  added: []
  patterns:
    - E2E spec mirroring hub.spec.ts — 3 describe blocks (load/accessibility/responsive)
    - SEO test with local path variables inside it() — never reuse module-level DIST_INDEX/html
    - Pitfall 1 guard — local ec2IndexPath + ec2Html prevent silent false positive

key-files:
  created:
    - tests/e2e/ec2-coming-soon.spec.ts
  modified:
    - tests/seo/seo-meta.test.ts (test 16 appended)
    - playwright.config.ts (baseURL updated from /deep-dive-vm/ to / for multi-LP support)
    - src/layouts/Layout.astro (brought from phase 07 — ogImage prop support)
    - src/pages/deep-dive-ec2/index.astro (brought from phase 08-01)
    - astro.config.mjs (brought from phase 07 — no base, no sitemap filter)

key-decisions:
  - "playwright.config.ts baseURL changed from http://localhost:4321/deep-dive-vm/ to http://localhost:4321/ — required for multi-LP routing; ec2-coming-soon.spec.ts uses page.goto('./deep-dive-ec2/')"
  - "Test 16 declares its own ec2IndexPath and ec2Html locally inside it() — never reuses module-level DIST_INDEX or html (Pitfall 1 guard from RESEARCH.md)"
  - "Prerequisite artifacts (phase 07-08) brought from worktree-impeccable-teach via git checkout — worktree was based on main which lacked these changes"

patterns-established:
  - "New LP E2E spec: copy ec2-coming-soon.spec.ts, substitute route slug and copy strings"
  - "New LP SEO test: copy test 16 pattern, declare local path/html variables inside it()"

requirements-completed: [SCAFF-01]

duration: ~20min
completed: 2026-05-17
---

# Phase 08 Plan 02: Multi-LP Scaffold (Tests) Summary

**Playwright E2E spec (7 tests) and Vitest SEO test 16 locking SCAFF-01 CI gate for /deep-dive-ec2/ with axe-core WCAG 2.0 A/AA and og:image continuity checks.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-05-17T15:15:00Z
- **Completed:** 2026-05-17T15:30:00Z
- **Tasks:** 2
- **Files modified:** 2 (created/modified test files) + 10 (prerequisite artifacts from phases 07-08)

## Accomplishments

- Created `tests/e2e/ec2-coming-soon.spec.ts` with 3 describe blocks and 7 tests: HTTP 200, h1 "Deep Dive EC2" visible, badge "EM BREVE" visible, back-link `href="/"`, skip-link `#conteudo-principal`, axe-core WCAG2A/AA critical=0, mobile 375x812 no overflow
- Appended test 16 to `tests/seo/seo-meta.test.ts` verifying `dist/deep-dive-ec2/index.html` og:image contains `ec2-og.png` using LOCAL variables (Pitfall 1 guard)
- Updated `playwright.config.ts` baseURL from `/deep-dive-vm/` to `/` enabling proper multi-LP navigation
- Brought prerequisite artifacts from `worktree-impeccable-teach` (phases 07-08 work missing from this worktree)

## Task Commits

1. **Task 1: Create tests/e2e/ec2-coming-soon.spec.ts** - `bfc8178` (feat)
2. **Task 2: Append test 16 to tests/seo/seo-meta.test.ts** - `52118b1` (feat)

## Files Created/Modified

- `tests/e2e/ec2-coming-soon.spec.ts` — New Playwright spec, 3 describe blocks, 7 tests covering SCAFF-01
- `tests/seo/seo-meta.test.ts` — Test 16 appended: ec2 og:image verification with local path variables
- `playwright.config.ts` — baseURL updated to `http://localhost:4321/` for multi-LP routing
- `src/layouts/Layout.astro` — ogImage prop support (phase 07, brought from impeccable-teach)
- `src/pages/deep-dive-ec2/index.astro` — EC2 LP-lite page (phase 08-01, brought from impeccable-teach)
- `src/pages/index.astro` — Hub page (phase 07, brought from impeccable-teach)
- `src/pages/deep-dive-vm/index.astro` — Reorganized LP (phase 07, brought from impeccable-teach)
- `astro.config.mjs` — No base, no sitemap filter (phase 07, brought from impeccable-teach)
- `public/ec2-og.png` — OG placeholder 1200x630 (phase 08-01, brought from impeccable-teach)
- `public/hub-og.png` — Hub OG image (phase 07, brought from impeccable-teach)
- `src/data/courses.ts` — EC2 entry (phase 07, brought from impeccable-teach)
- `src/data/social-links.ts` — Social links data (phase 07, brought from impeccable-teach)
- `src/components/ui/SocialIcon.astro` — Social icon component (phase 07, brought from impeccable-teach)

## Decisions Made

- **playwright.config.ts baseURL change:** Changed from `http://localhost:4321/deep-dive-vm/` to `http://localhost:4321/`. Required because `page.goto("./deep-dive-ec2/")` with the old baseURL would navigate to `/deep-dive-vm/deep-dive-ec2/` (wrong URL). Multi-LP support requires baseURL at the root.
- **Test 16 local variables:** `ec2IndexPath` and `ec2Html` declared inside the `it()` block — never reusing module-level `DIST_INDEX` (points to deep-dive-vm) or `html` (loaded from DIST_INDEX in beforeAll). This follows Pitfall 1 from RESEARCH.md to prevent silent false positives.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree missing phase 07-08 prerequisite artifacts**

- **Found during:** Task 1 setup
- **Issue:** This worktree was created from `main`, which did not contain the work from phases 07-08 (Layout.astro with ogImage prop, EC2 page, hub page, courses.ts, astro.config.mjs without base/sitemap filter, etc.). The tests require these files to build and pass.
- **Fix:** Used `git checkout worktree-impeccable-teach -- <files>` to bring 10 prerequisite files. Also updated `playwright.config.ts` baseURL from `/deep-dive-vm/` to `/` (multi-LP routing requirement).
- **Files modified:** playwright.config.ts, astro.config.mjs, src/layouts/Layout.astro, src/pages/index.astro, src/pages/deep-dive-ec2/index.astro, src/pages/deep-dive-vm/index.astro, src/data/courses.ts, src/data/social-links.ts, src/components/ui/SocialIcon.astro, public/ec2-og.png, public/hub-og.png
- **Verification:** `npm run build` exits 0; `dist/deep-dive-ec2/index.html` generated with og:image=ec2-og.png
- **Committed in:** bfc8178 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Necessary prerequisite acquisition. No scope creep — files came from the plan's intended source branch.

## Issues Encountered

None beyond the prerequisite artifact gap documented above.

## Known Stubs

None. All test assertions target real built output.

## Threat Flags

None. Test files only — no new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- `tests/e2e/ec2-coming-soon.spec.ts`: EXISTS
- `tests/seo/seo-meta.test.ts` contains test 16: VERIFIED (line 186)
- `ec2IndexPath` local variable in test 16: VERIFIED (not reusing DIST_INDEX)
- `ec2Html` local variable in test 16: VERIFIED (not reusing module html)
- Commit bfc8178: EXISTS (Task 1)
- Commit 52118b1: EXISTS (Task 2)
- Playwright chromium 7/7 tests pass: VERIFIED
- Vitest 16/16 tests pass: VERIFIED

## Next Phase Readiness

- SCAFF-01 fully gated: HTTP 200, h1, badge, back-link, skip-link, axe WCAG2A/AA, mobile, og:image
- Pattern established for future LPs: copy ec2-coming-soon.spec.ts + test 16 pattern
- Phase 08-03 (HOWTO-new-landing-page.md) can proceed — all referenced artifacts exist

---
*Phase: 08-multi-lp-scaffold*
*Completed: 2026-05-17*
