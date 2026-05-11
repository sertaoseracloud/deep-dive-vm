# Phase 2 Pilot Migration — Sign-Off Checklist

**Plan:** 02-01
**Phase:** 2-pilot-migration
**Status:** AWAITING USER VALIDATION

---

## Prerequisites (Complete these before running automated checks)

- [ ] **Edit pilot-slugs.js:** Replace placeholder slugs in `tests/baselines/legacy/pilot-slugs.js`
      with your actual GSC top-5 sections (or confirm placeholders are correct)
- [ ] **Confirm legacy section IDs:** Inspect the live legacy page source to verify that
      `<section id="...">` values match the `sectionId` fields in `pilot-slugs.js`
      (`#top`, `#investimento`, `#ementa`, `#bonus`, `#faq`)
- [ ] **Capture legacy baselines:** Run the scraper with your legacy URL:
      ```
      LEGACY_BASE_URL=<your-legacy-url> node src/scripts/capture-baselines.js
      ```
      Or with a .env file: `node --env-file .env src/scripts/capture-baselines.js`
- [ ] **Verify 5 PNGs created:** `ls tests/baselines/legacy/*.png` shows 5 files
- [ ] **Commit PNGs to git:**
      ```
      git add tests/baselines/legacy/*.png
      git commit -m "chore(phase-2): commit legacy baseline PNGs for pilot sections"
      ```

---

## Automated Validation

Run this sequence and fill in the results:

### Step 1 — Build
```bash
npm run build
```
Expected: No build errors. Astro site builds cleanly.

| Check | Result | Notes |
|-------|--------|-------|
| `npm run build` | `[ ] PASS  [ ] FAIL` | |

### Step 2 — Visual Regression Tests
```bash
npm run test:visual
```
Expected: All 7 tests pass (2 Phase 1 toMatchSnapshot + 5 pilot pixelmatch tests).

| Check | Result | Notes |
|-------|--------|-------|
| `npm run test:visual` | `[ ] PASS  [ ] FAIL` | |
| `visual diff — home` | `[ ] PASS  [ ] FAIL` | Phase 1 test — must remain passing |
| `visual diff — hero section visible` | `[ ] PASS  [ ] FAIL` | Phase 1 test — must remain passing |
| `visual diff (legacy baseline) — hero` | `[ ] PASS  [ ] FAIL` | pixelmatch vs #top |
| `visual diff (legacy baseline) — pricing` | `[ ] PASS  [ ] FAIL` | pixelmatch vs #investimento |
| `visual diff (legacy baseline) — curriculum` | `[ ] PASS  [ ] FAIL` | pixelmatch vs #ementa |
| `visual diff (legacy baseline) — bonuses` | `[ ] PASS  [ ] FAIL` | pixelmatch vs #bonus |
| `visual diff (legacy baseline) — faq` | `[ ] PASS  [ ] FAIL` | pixelmatch vs #faq |

### Step 3 — Lighthouse CI
```bash
npm run lighthouse:ci
```
Expected: All thresholds pass (FCP < 1s, LCP < 2.5s, CLS <= 0.1, SEO >= 90%).

| Check | Threshold | Result | Actual Score |
|-------|-----------|--------|--------------|
| `npm run lighthouse:ci` | All pass | `[ ] PASS  [ ] FAIL` | |
| First Contentful Paint (FCP) | < 1s | `[ ] PASS  [ ] FAIL` | |
| Largest Contentful Paint (LCP) | < 2.5s | `[ ] PASS  [ ] FAIL` | |
| Cumulative Layout Shift (CLS) | <= 0.1 | `[ ] PASS  [ ] FAIL` | |
| SEO Score | >= 90% | `[ ] PASS  [ ] FAIL` | |

---

## Pilot Sections Summary

| Section | Slug | CSS ID | Legacy Baseline | Visual Diff | Lighthouse | Manual Check |
|---------|------|--------|-----------------|-------------|------------|--------------|
| Hero | hero | #top | `[ ] CAPTURED` | `[ ] PASS  [ ] FAIL` | N/A | `[ ] OK  [ ] ISSUE` |
| Pricing | pricing | #investimento | `[ ] CAPTURED` | `[ ] PASS  [ ] FAIL` | N/A | `[ ] OK  [ ] ISSUE` |
| Curriculum | curriculum | #ementa | `[ ] CAPTURED` | `[ ] PASS  [ ] FAIL` | N/A | `[ ] OK  [ ] ISSUE` |
| Bonuses | bonuses | #bonus | `[ ] CAPTURED` | `[ ] PASS  [ ] FAIL` | N/A | `[ ] OK  [ ] ISSUE` |
| FAQ | faq | #faq | `[ ] CAPTURED` | `[ ] PASS  [ ] FAIL` | N/A | `[ ] OK  [ ] ISSUE` |

---

## Manual Browser Spot-Check

Open `http://localhost:4321/deep-dive-vm/` (after `npm run preview`) in Chromium.
Compare each pilot section side-by-side with the legacy page.

- [ ] **Hero (#top):** Text content matches legacy. Images load. Layout is correct.
- [ ] **Pricing (#investimento):** Price, CTA text, and button match legacy.
- [ ] **Curriculum (#ementa):** Course items and structure match legacy.
- [ ] **Bonuses (#bonus):** Bonus items and images match legacy.
- [ ] **FAQ (#faq):** Questions and answers match legacy.

**Issues noted during spot-check:**
> (describe any visual issues here, or write "None")

---

## Known Limitations

- The 0.001 (0.1%) diff threshold may be too strict if the legacy page has dynamic content
  (countdown timers, chat widgets, animated elements). Threshold can be adjusted in
  `tests/visual.test.ts` MAX_DIFF_RATIO if needed.
- Pilot section IDs in `pilot-slugs.js` are placeholders sourced from `src/pages/index.astro`.
  If the legacy site uses different CSS IDs, the scraper will skip those sections with a warning —
  update `sectionId` in `pilot-slugs.js` to match the legacy page before re-running.
- The visual diff test requires baseline PNGs to be committed to git. If a baseline is missing,
  the test throws a remediation message with the exact command to run.

---

## Decision

- [ ] **APPROVED** — All automated tests pass and manual spot-check finds no blocking issues.
      Proceed to Phase 3 (Full Migration).
- [ ] **BLOCKED** — Gap closure required. Issues found:
      > (describe issues here)

---

*To approve: reply "approved" to Claude.*
*To report issues: describe the visual failures and Claude will create gap closure tasks.*
