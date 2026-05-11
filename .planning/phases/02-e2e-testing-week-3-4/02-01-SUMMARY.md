---
phase: 02-e2e-testing
plan: 01
subsystem: e2e-testing
tags: [playwright, e2e, accessibility, ci, keyboard-nav, skip-link, sticky-cta]
dependency_graph:
  requires: [01-testing-foundation]
  provides: [e2e-journeys, e2e-accessibility, e2e-multi-browser, e2e-ci-every-push]
  affects: [.github/workflows/test.yml, src/pages/index.astro]
tech_stack:
  added: []
  patterns: [page.goto("./"), toBeInViewport(), toBeAttached(), keyboard.press("Tab"), getComputedStyle]
key_files:
  created:
    - tests/e2e/journeys.spec.ts
    - tests/e2e/accessibility.spec.ts
  modified:
    - .github/workflows/test.yml
    - src/pages/index.astro
decisions:
  - "skip link must precede all nav components in DOM order to be first focusable element"
  - "tabindex=-1 on main#main allows skip link activation to move focus without adding to tab order"
  - "continue-on-error: true placed at job level (not step level) per T-02-01 threat mitigation"
metrics:
  duration: "~12 minutes"
  completed: "2026-05-11"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 2
---

# Phase 02 Plan 01: E2E User Journeys and Keyboard Accessibility Summary

**One-liner:** Playwright E2E tests for CTA hrefs, anchor scrolling, sticky CTA mobile visibility, Tab navigation order, skip link activation, and focus-visible outline; CI split into blocking Chromium + informational cross-browser jobs.

## Objective

Expand E2E coverage beyond the Phase 1 homepage baseline by adding tests for critical user journeys (CTA clicks, anchor scrolling, sticky CTA) and keyboard accessibility (Tab navigation, skip link, focus-visible). Split the monolithic CI e2e job into a blocking Chromium job and an informational cross-browser job.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Journey tests (CTA, anchor scroll, sticky CTA) | 33136a2 | tests/e2e/journeys.spec.ts, src/pages/index.astro |
| 2 | Accessibility tests (Tab nav, skip link, focus-visible) | 33136a2 | tests/e2e/accessibility.spec.ts |
| 3 | Split CI e2e job into Chromium + cross-browser | 531c6f9 | .github/workflows/test.yml |

## Tests Created

### tests/e2e/journeys.spec.ts (11 tests)

**Describe: "CTA buttons" (3 tests)**
- Hero primary CTA (`a.btn.primary.massive`) has `href="#investimento"`
- Hero ghost CTA (`a.btn.ghost` inside `header#top`) has `href="#ementa"`
- NavBar CTA (`a.btn.nav-cta`) has `href="#investimento"`

**Describe: "Anchor scrolling" (6 tests)**
- `#top` visible immediately on load
- `#metodo`, `#ementa`, `#mentor`, `#investimento`, `#faq` each scroll into viewport via `scrollIntoView()` + `toBeInViewport()`

**Describe: "Sticky CTA" (2 tests)**
- DOM presence: `div.sticky-cta` is attached and contains `a[href="#investimento"]`
- Mobile visibility: at 375×812 viewport after `scrollBy(0, 500)`, `div.sticky-cta` is visible (CSS `display:flex` triggered by `@media (max-width: 720px)`)

### tests/e2e/accessibility.spec.ts (5 tests)

**Describe: "Keyboard navigation" (2 tests)**
- Tab 6 times: collects `tagName:href|textContent` for each focused element; asserts `length >= 3`, at least 2 `A:` anchor entries, no `"none"` entries
- Skip link is the first focusable element: first Tab press focuses element with class `skip-link`

**Describe: "Skip link functionality" (2 tests)**
- `a.skip-link` has `href="#main"` and text `"Pular para o conteúdo"`
- Activating skip link (Tab + Enter) moves `document.activeElement.id` to `"main"`

**Describe: "Focus-visible" (1 test)**
- After Tab + Tab (skip link → NavBar brand link), `getComputedStyle(activeElement).outlineStyle` is not `"none"` and not `""`

## tabindex="-1" Addition

`tabindex="-1"` was added to `<main id="main">` in `src/pages/index.astro`.

**Why:** When a skip link's `href="#main"` is activated via keyboard Enter, browsers do not reliably move focus to the target element unless the target has a `tabindex` attribute. The value `-1` makes `main` programmatically focusable (so `document.activeElement` becomes `main` after activation) without inserting it into the natural Tab order. This is the standard WCAG-recommended skip link implementation pattern.

## DOM Order Fix for Skip Link

The skip link `<a href="#main" class="skip-link">` was moved to before `<UrgencyBar />` and `<NavBar />` in `index.astro`.

**Why:** The original order placed the skip link after `<NavBar />`, making the NavBar brand link (`a.brand`) the first Tab stop instead. A skip link must be the first focusable element in the DOM so keyboard users can bypass navigation immediately. This was a Rule 2 (missing critical accessibility functionality) auto-fix.

## CI Job Structure

| Job | Blocking | Browser(s) | Artifact |
|-----|----------|------------|---------|
| `e2e-chromium` | Yes (no continue-on-error) | Chromium only | `playwright-report-chromium` |
| `e2e-cross-browser` | No (`continue-on-error: true` at job level) | Firefox + WebKit + mobile (iPhone 13) | `playwright-report-cross-browser` |

Both jobs depend on `unit-and-integration`. The `lighthouse` job is unchanged.

The original monolithic `e2e` job has been removed entirely.

Triggers unchanged: `push: branches: [main]` and `pull_request: branches: [main]`.

## Flakiness Observed

No flakiness observed during local runs. The `scrollIntoView()` approach for anchor tests is deterministic and did not require retries. The focus-visible test passed reliably in headless Chromium because keyboard Tab navigation triggers `:focus-visible` in the browser engine even in headless mode.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Accessibility] Skip link DOM position corrected**
- **Found during:** Task 2 test run
- **Issue:** `a.skip-link` was rendered after `<NavBar />` in the DOM, making the NavBar brand link the first focusable element rather than the skip link. The accessibility test "skip link is the first focusable element" failed with `received: "brand"`.
- **Fix:** Moved `<a href="#main" class="skip-link">` to before `<UrgencyBar />` and `<NavBar />` in `src/pages/index.astro`.
- **Files modified:** `src/pages/index.astro`
- **Commit:** 33136a2

**2. [Rule 2 - Missing Critical Accessibility] tabindex="-1" added to main#main**
- **Found during:** Task 2 test run (anticipated in plan action notes)
- **Issue:** `main#main` had no `tabindex`, so `document.activeElement` returned `""` after skip link activation via Enter. Focus was not moved to the main landmark.
- **Fix:** Added `tabindex="-1"` to `<main id="main">` in `src/pages/index.astro`.
- **Files modified:** `src/pages/index.astro`
- **Commit:** 33136a2

## Known Stubs

None. All tests assert real rendered DOM and real hrefs from the production page.

## Threat Flags

No new trust boundary surfaces introduced. All files are test infrastructure and CI configuration only. `src/pages/index.astro` change adds only a `tabindex="-1"` attribute with no new network endpoints or auth paths.

## Final Verification

```
npx playwright test --project=chromium
PASS (30) FAIL (0)
  - tests/e2e/homepage.spec.ts: 14 tests PASS
  - tests/e2e/journeys.spec.ts: 11 tests PASS
  - tests/e2e/accessibility.spec.ts: 5 tests PASS
```

YAML valid: `npx js-yaml .github/workflows/test.yml` exits 0.

## Self-Check: PASSED

- tests/e2e/journeys.spec.ts: FOUND
- tests/e2e/accessibility.spec.ts: FOUND
- .github/workflows/test.yml: FOUND (e2e-chromium + e2e-cross-browser, no e2e job)
- src/pages/index.astro: FOUND (skip link first, main has tabindex="-1")
- Commit 33136a2: EXISTS (tasks 1 & 2)
- Commit 531c6f9: EXISTS (task 3)
