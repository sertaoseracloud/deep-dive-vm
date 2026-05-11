---
phase: 1-content-migration
plan: 01
subsystem: infra
tags: [astro, gray-matter, remark, sharp, playwright, pixelmatch, markdown, content-extraction]

# Dependency graph
requires: []
provides:
  - src/content/*.md — 12 Markdown files with title/description/cta_text/cta_link frontmatter
  - src/scripts/extract.js — automated Node extraction pipeline (sections + home + images)
  - public/images/*.webp — 3 optimised WebP image assets
  - playwright.config.ts — Playwright config targeting Chromium with /deep-dive-vm base path
  - tests/visual.test.ts — Pixel-perfect visual regression tests with baseline screenshots
  - tests/seo.test.ts — SEO meta tag and frontmatter schema validation tests
affects: [phase-2, phase-3, astro-content, seo-audit, visual-regression]

# Tech tracking
tech-stack:
  added:
    - gray-matter@4.0.3 (frontmatter parsing/stringify)
    - remark@15.0.1 (Markdown processing)
    - remark-gfm@4.0.1 (GFM support)
    - rehype-remark@10.0.1 (HTML to Markdown via rehype/remark pipeline)
    - rehype-parse@9.0.1 (HTML fragment parsing)
    - unified@11.0.5 (processor pipeline)
    - sharp@0.34.5 (image optimisation, WebP/AVIF)
    - playwright@1.59.1 / @playwright/test@1.59.1 (visual regression testing)
    - pixelmatch@7.2.0 (pixel-level image diffing)
  patterns:
    - Content-First Extraction pattern — extract.js runs before Astro build
    - Frontmatter-driven SEO — title/description/cta_text/cta_link written per component
    - HTML-to-Markdown via unified pipeline (rehype-parse → rehype-remark → remark-stringify)
    - Sharp WebP conversion with quality:85 for all PNG/JPEG source assets
    - Playwright baseURL with trailing slash to handle Astro /deep-dive-vm base path

key-files:
  created:
    - src/scripts/extract.js
    - playwright.config.ts
    - src/content/home.md
    - src/content/hero.md
    - src/content/pricing.md
    - src/content/curriculum.md
    - src/content/bonuses.md
    - src/content/faq.md
    - src/content/forwho.md
    - src/content/mentor.md
    - src/content/method.md
    - src/content/painpoints.md
    - src/content/testimonials.md
    - src/content/trustband.md
    - public/images/claudio1.webp
    - public/images/claudio2.webp
    - public/images/marcelo.webp
    - tests/visual.test.ts
    - tests/seo.test.ts
    - tests/visual.test.ts-snapshots/home-baseline-chromium-win32.png
    - tests/visual.test.ts-snapshots/hero-viewport-chromium-win32.png
  modified:
    - package.json (added 9 dependencies, 4 npm scripts)
    - package-lock.json

key-decisions:
  - "Used rehype-remark + unified pipeline instead of remark-html-to-md (does not exist on npm registry)"
  - "Playwright baseURL set to http://localhost:4321/deep-dive-vm/ (trailing slash required for correct URL resolution with Astro base path)"
  - "Frontmatter validation uses inline string checks (zod not installed) per threat model T-01 pattern"
  - "Image optimisation integrated into extract.js (not a separate step) for atomic execution"
  - "Visual regression baselines committed to repository for deterministic CI comparison"

patterns-established:
  - "Pattern: extract.js as pre-build Node script for content pipeline"
  - "Pattern: playwright.config.ts webServer with reuseExistingServer for local development"
  - "Pattern: goto('./') for Playwright navigation when baseURL has a sub-path"

requirements-completed: [REQ-01]

# Metrics
duration: 35min
completed: 2026-05-11
---

# Phase 1 Plan 01: Content Migration — Extraction Pipeline Summary

**Automated Node pipeline extracts 11 Astro section components + home page to 12 Markdown files with locked frontmatter schema, converts 3 PNG assets to WebP, and validates with 5 passing Playwright tests (3 SEO + 2 visual regression)**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-05-11T07:20:00Z
- **Completed:** 2026-05-11T07:55:00Z
- **Tasks:** 3 of 3
- **Files modified:** 22

## Accomplishments

- Installed 9 new packages (gray-matter, remark, remark-gfm, rehype-remark, rehype-parse, unified, sharp, playwright, pixelmatch)
- Wrote `src/scripts/extract.js` that reads all `.astro` section components, converts HTML to Markdown via unified/rehype pipeline, builds frontmatter (title, description, cta_text, cta_link), validates strings against injection patterns, and writes `src/content/<name>.md`
- Generated 12 Markdown content files — all 12 pass frontmatter field presence check
- Optimised 3 PNG images (claudio1, claudio2, marcelo) to WebP (quality 85) in `public/images/`
- Created Playwright test suite: 3 SEO tests (meta description, OG tags, CTA links, frontmatter schema) + 2 visual regression tests with committed baselines — all 5 pass
- Astro site builds cleanly (`npx astro build` completed in 4.9s, 0 errors)

## Task Commits

1. **Task 1: Install dependencies and scaffold** - `a5b28d5` (chore)
2. **Task 2: Content extraction and Markdown generation** - `880e1fc` (feat)
3. **Task 3: Visual regression and SEO validation** - `0179475` (feat)

## Files Created/Modified

- `src/scripts/extract.js` — Full extraction pipeline: components → Markdown + image optimisation
- `playwright.config.ts` — Playwright config for Chromium targeting `/deep-dive-vm` base path
- `src/content/home.md` — Home page with Layout-level frontmatter (title from index.astro props)
- `src/content/hero.md` — Hero section: title from `<h1>`, description from `<p>`
- `src/content/pricing.md` — Pricing section: cta_text/cta_link from Button component
- `src/content/{bonuses,curriculum,faq,forwho,mentor,method,painpoints,testimonials,trustband}.md` — Remaining section extracts
- `public/images/{claudio1,claudio2,marcelo}.webp` — WebP-optimised images
- `tests/visual.test.ts` — Pixel-perfect visual regression (maxDiffPixelRatio: 0.001)
- `tests/seo.test.ts` — SEO tag validation + frontmatter schema check
- `tests/visual.test.ts-snapshots/*.png` — Committed baselines for Chromium/win32
- `package.json` — Added 9 dependencies, 4 npm scripts (extract, test:extract, test:visual, lighthouse)

## Decisions Made

- **rehype-remark vs remark-html-to-md**: `remark-html-to-md` does not exist on the npm registry (404). Used the equivalent `rehype-parse → rehype-remark → remark-stringify` unified pipeline which achieves the same HTML-to-Markdown conversion.
- **Frontmatter validation**: Inline string length + injection pattern checks instead of zod (threat model T-01 compliant without adding a dependency).
- **Image optimisation in extract.js**: Integrated into the extraction script for atomic one-command execution (`npm run extract`), rather than a separate asset script.
- **Playwright baseURL trailing slash**: `http://localhost:4321/deep-dive-vm/` (with trailing slash) is required so `goto('./')` resolves to the correct page — without trailing slash, `goto('/')` replaces the entire path.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] remark-html-to-md does not exist on npm**
- **Found during:** Task 1 (npm install)
- **Issue:** `npm install remark-html-to-md` returned 404 — package not found on npm registry
- **Fix:** Installed equivalent pipeline: `rehype-parse + rehype-remark + unified` which converts HTML to Markdown through the remark AST, achieving the same result
- **Files modified:** package.json, package-lock.json
- **Verification:** `node -e "import('rehype-remark').then(() => console.log('OK'))"` passes; all content files produced correctly
- **Committed in:** a5b28d5 (Task 1 commit)

**2. [Rule 1 - Bug] Playwright URL resolution with Astro base path**
- **Found during:** Task 3 (running SEO tests)
- **Issue:** With `baseURL: 'http://localhost:4321/deep-dive-vm'` (no trailing slash), `goto('/')` resolves to `http://localhost:4321/` (root, returns 404) instead of `http://localhost:4321/deep-dive-vm/` (the actual page)
- **Fix:** Changed baseURL to `http://localhost:4321/deep-dive-vm/` (trailing slash) and all `goto('/')` calls to `goto('./')` so URL resolution produces the correct base path
- **Files modified:** playwright.config.ts, tests/seo.test.ts, tests/visual.test.ts
- **Verification:** All 5 Playwright tests pass
- **Committed in:** 0179475 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were necessary for correctness. No scope creep — equivalent tooling used where specified package unavailable.

## Issues Encountered

- `remark-html-to-md` package specified in RESEARCH.md does not exist on npm — replaced with the `unified` pipeline equivalent (see deviation 1 above).
- Playwright webServer automatically starts `npm run preview`, but if a server is already running on port 4321, `reuseExistingServer: true` correctly detects and reuses it — no port conflict encountered.

## Known Stubs

- `trustband.md` — title extracted as "trustband" (fallback to filename) because TrustBand.astro has no explicit `<h1>` or `eyebrow` prop; body content is correctly extracted. Title should be manually reviewed.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: injection | src/scripts/extract.js | Frontmatter string values from untrusted HTML are validated inline (length + injection pattern check) per threat model T-01; no external validator used |

## User Setup Required

None — no external service configuration required. Running `npm run extract` re-generates all content files. Running `npx playwright test` requires the site to be built (`npm run build`) and previewed (`npm run preview`) first.

## Next Phase Readiness

- All 12 content Markdown files are in `src/content/` with correct 4-field frontmatter schema
- WebP images are in `public/images/` ready for Astro image references
- Playwright test baselines committed — visual regression CI-ready
- SEO tests confirm all required meta tags are present in the rendered HTML
- Blockers for next phase: none

---
*Phase: 1-content-migration*
*Completed: 2026-05-11*
