---
phase: 1-content-migration
verified: 2026-05-11T12:00:00Z
status: gaps_found
score: 2/4 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Pixel-perfect visual regression tests show ≤0.1% difference between legacy pages and generated pages."
    status: partial
    reason: >-
      Visual regression tests exist and use maxDiffPixelRatio: 0.001, and baseline
      snapshots are committed. However the tests compare the generated site against
      itself (Playwright toMatchSnapshot creates its own baseline on first run).
      The tests/baselines/ directory exists but is empty — no legacy page screenshots
      are present. The PLAN explicitly required comparing generated pages against
      baseline screenshots of the legacy page. This is a self-referential regression
      guard for future drift, not a migration fidelity check against the original.
    artifacts:
      - path: "tests/visual.test.ts"
        issue: "Compares page to its own Playwright-generated snapshot, not a captured legacy baseline"
      - path: "tests/baselines/"
        issue: "Directory exists but is empty — no legacy page baselines committed"
    missing:
      - "Capture legacy page screenshots (pre-migration) and commit to tests/baselines/"
      - "Update visual.test.ts to load baseline from tests/baselines/ and compare via pixelmatch"
      - "Or explicitly document that 'baseline = initial render' is the accepted interpretation and add an override"

  - truth: "Lighthouse audit reports meet SEO thresholds (meta description, title, structured data)."
    status: failed
    reason: >-
      The npm run lighthouse script is a stub: it runs `echo 'Lighthouse: requires a
      running server. Run: npx lighthouse http://localhost:4321'` and exits 0. No
      Lighthouse binary is executed, no report is generated, no thresholds are
      evaluated. The success criterion (Lighthouse SEO score ≥ 90%, FCP < 1s,
      LCP < 2.5s, CLS ≤ 0.1) is completely unverified. The seo.test.ts file checks
      title, meta description, og:title, H1 visibility, and CTA link — but does not
      check canonical tags, structured data (JSON-LD), or performance metrics.
    artifacts:
      - path: "package.json"
        issue: "lighthouse script is an echo stub, not a real lighthouse invocation"
    missing:
      - "Install lighthouse CLI (npm install -D lighthouse)"
      - "Replace echo stub with: lighthouse http://localhost:4321/deep-dive-vm/ --output json --output-path lighthouse-report.json --chrome-flags='--headless' && node scripts/check-lighthouse.js"
      - "Add scripts/check-lighthouse.js that reads the JSON report and fails if SEO < 90 or Perf thresholds unmet"
      - "Or run lighthouse audit manually and commit the report, documenting the score"
---

# Phase 1: Content Migration Verification Report

**Phase Goal:** Create an automated pipeline that extracts legacy content from Astro components, converts it to Markdown with the required frontmatter schema (title, description, cta_text, cta_link), optimises assets, and validates the migration through visual-regression and SEO tests.
**Verified:** 2026-05-11T12:00:00Z
**Status:** gaps_found
**Score:** 2/4 must-haves verified
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                 | Status        | Evidence                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------- |
| 1   | All legacy page content is available as Markdown files with correct frontmatter fields                | VERIFIED  | 12 `.md` files in `src/content/`; programmatic check confirms all 4 fields present in every file |
| 2   | All image assets are present in public/images folder in WebP or AVIF format                           | VERIFIED  | 3 WebP files confirmed (`claudio1.webp` 21 KB, `claudio2.webp` 22 KB, `marcelo.webp` 43 KB) |
| 3   | Visual regression tests show ≤0.1% difference between legacy pages and generated pages                | PARTIAL  | Test code and baselines exist but compare page to itself — no legacy baselines in tests/baselines/ |
| 4   | Lighthouse audit reports meet SEO thresholds (meta description, title, structured data)               | FAILED  | `npm run lighthouse` is an echo stub; no Lighthouse binary is invoked; no report exists      |

**Score:** 2/4 truths verified

---

### Required Artifacts

| Artifact                          | Expected                                  | Status    | Details                                                              |
| --------------------------------- | ----------------------------------------- | --------- | -------------------------------------------------------------------- |
| `src/content/*.md`                | 12 Markdown pages with required frontmatter | VERIFIED | All 12 files present; all contain title, description, cta_text, cta_link |
| `public/images/*.{webp,avif}`     | Optimized image assets                    | VERIFIED  | 3 `.webp` files; no AVIF (only source PNGs were available — acceptable) |
| `src/scripts/extract.js`          | Node extraction & conversion script       | VERIFIED  | 304-line substantive implementation; not a stub                      |
| `playwright.config.ts`            | Visual regression test configuration      | VERIFIED  | Valid Playwright config targeting Chromium with correct baseURL       |
| `tests/visual.test.ts`            | Pixel-perfect visual regression tests     | PARTIAL   | Code exists with 0.001 threshold; baselines are self-generated, not legacy |
| `tests/seo.test.ts`               | SEO meta tag and frontmatter schema validation | VERIFIED | Checks title, meta description, og:title, H1, CTA link, frontmatter fields |
| `tests/baselines/`                | Legacy page baseline screenshots          | MISSING   | Directory exists but is empty                                        |
| Lighthouse report                 | Automated SEO/performance audit           | MISSING   | `npm run lighthouse` is an echo stub                                 |

---

### Key Link Verification

| From                    | To                    | Via                              | Status    | Details                                                              |
| ----------------------- | --------------------- | -------------------------------- | --------- | -------------------------------------------------------------------- |
| `src/scripts/extract.js` | `src/content/*.md`   | `fs.writeFileSync(outPath, ...)` | WIRED    | Lines 186, 231 — writes `.md` files with gray-matter stringified frontmatter |
| `src/scripts/extract.js` | `public/images/*.webp` | `sharp().toFormat('webp', ...)`  | WIRED    | Line 262 — converts PNG to WebP at quality:85 and writes to public/images/ |
| `playwright tests`       | generated site        | `page.goto('./')`                | WIRED    | Both test files use `page.goto('./')` with correct baseURL           |
| `playwright tests`       | legacy baselines      | `pixelmatch` comparison          | NOT_WIRED | tests/baselines/ is empty; no legacy → generated comparison path    |
| `npm run lighthouse`     | SEO thresholds        | lighthouse CLI                   | NOT_WIRED | Script is `echo` stub; no CLI invocation, no threshold evaluation    |

---

### Data-Flow Trace (Level 4)

Not applicable to this phase — the artifacts are content files and test infrastructure, not dynamic-rendering UI components.

---

### Behavioral Spot-Checks

| Behavior                                          | Command                                                                           | Result                                                | Status |
| ------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| extract.js is substantive (not stub)              | File size and content inspection                                                   | 304 lines, full implementation with 5 named functions | PASS   |
| All 12 content files have 4 frontmatter fields    | `node -e` programmatic check via gray-matter                                      | All 12 files: OK                                      | PASS   |
| WebP images are real files (non-zero)             | File size check                                                                   | 21 KB / 22 KB / 43 KB                                 | PASS   |
| Baseline snapshots are real files                 | File size check                                                                   | 2.4 MB / 404 KB                                       | PASS   |
| `npm run lighthouse` invokes lighthouse           | Read script from package.json                                                     | `echo '...'` stub, exits 0 unconditionally            | FAIL   |
| Legacy baselines present for visual comparison    | `ls tests/baselines/`                                                             | Directory empty                                       | FAIL   |

---

### Probe Execution

No probe scripts declared or present (`scripts/*/tests/probe-*.sh` not found). Step 7c: SKIPPED.

---

### Requirements Coverage

| Requirement | Description                                          | Status        | Evidence                                                                                          |
| ----------- | ---------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| REQ-01 (1.1) | Extract all landing-page copy and convert to Markdown | SATISFIED    | 12 `.md` files generated from 11 section components + index.astro                                |
| REQ-01 (1.2) | Frontmatter: title, description, ctaText, ctaLink    | PARTIAL       | Schema uses `cta_text`/`cta_link` (snake_case) vs REQUIREMENTS spec of `ctaText`/`ctaLink` (camelCase); also `seoMeta`, `slug`, `layout` fields from REQ-1.2 are absent |
| REQ-01 (1.3) | Preserve heading hierarchy and content density       | NEEDS HUMAN   | Markdown body is generated but visual fidelity requires human spot-check                          |
| REQ-01 (2.3) | Optimize images to WebP/AVIF; generate srcsets       | PARTIAL       | WebP conversion done; no `srcset` generated; no AVIF variant produced                            |
| REQ-01 (3.x) | SEO: canonical tags, meta tags, JSON-LD, sitemap     | NOT SATISFIED | seo.test.ts checks title/description/og:title; canonical, JSON-LD, sitemap not verified          |
| REQ-01 (5.3) | Visual diff — pixel-perfect is a must-pass check     | BLOCKED       | Visual test compares against self, not against legacy page                                        |

Note: The PLAN `requirements` field lists only REQ-01. REQUIREMENTS.md contains many more requirements (REQ 2-6) assigned to later phases — those are out of scope for phase 1 but partially covered here.

---

### Anti-Patterns Found

| File                        | Line  | Pattern                            | Severity | Impact                                                                         |
| --------------------------- | ----- | ---------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `package.json`              | 16    | `lighthouse` script is `echo` stub | BLOCKER  | Truth 4 (Lighthouse SEO thresholds) cannot be verified; gate never fails       |
| `tests/baselines/`          | —     | Empty directory                    | BLOCKER  | Legacy comparison baseline is missing; visual regression covers no migration fidelity |
| `src/content/trustband.md`  | 2     | `title: trustband` (filename fallback) | WARNING | Fallback title is the component filename; SUMMARY flags this as known stub requiring manual review |

No `TBD`, `FIXME`, or `XXX` markers found in phase files.

---

### Human Verification Required

#### 1. Visual Fidelity of Generated Pages

**Test:** Open a generated Astro page in a browser and compare it visually side-by-side with the legacy landing page.
**Expected:** Headings, bold text, lists, and content density match the original with zero semantic drift.
**Why human:** The `htmlFragmentToMarkdown` pipeline uses `rehype-remark`, which can lose formatting nuances. Automated text comparison cannot assess visual hierarchy fidelity.

#### 2. CTA Link Validity for Pricing Section

**Test:** Navigate to the pricing section and click the CTA button.
**Expected:** Link `https://pay.hotmart.com/...` navigates to the real Hotmart payment page (the URL was extracted as a placeholder with `...`).
**Why human:** `pricing.md` has `cta_link: 'https://pay.hotmart.com/...'` — the `...` suggests the URL was not fully extracted. A broken payment link would directly harm conversion.

#### 3. trustband.md Title Quality

**Test:** Confirm whether "trustband" as the page title is acceptable or whether a meaningful title should be assigned manually.
**Expected:** Title reflects the component's semantic purpose (trust signals / company logos section).
**Why human:** The SUMMARY explicitly flags this as a known stub requiring manual review.

---

### Gaps Summary

Two blockers prevent the phase goal from being fully achieved:

**Blocker 1 — Lighthouse stub (Truth 4 FAILED):** The `npm run lighthouse` script is a one-line echo command that always exits 0. No Lighthouse audit is ever executed, no SEO score is measured, and the success criterion of "Lighthouse SEO score ≥ 90%, FCP < 1s, LCP < 2.5s" is entirely unverified. This must be replaced with a real lighthouse invocation and threshold check.

**Blocker 2 — Visual regression tests compare against self, not legacy (Truth 3 PARTIAL):** The plan's stated requirement is to compare generated pages against legacy page baselines. The `tests/baselines/` directory is empty. Playwright's `toMatchSnapshot` stores its own baseline on first run and regresses against that — meaning the test always passes on first run and only catches future regressions. The migration fidelity assertion (generated page matches the legacy page) is never made. This is not pixel-perfect diff against the original; it is a self-referential snapshot.

These two blockers mean the validation gate of the pipeline (the "V" in extract → convert → optimise → validate) is incomplete. The extraction and optimisation portions (truths 1 and 2) are fully implemented and substantive.

---

_Verified: 2026-05-11T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
