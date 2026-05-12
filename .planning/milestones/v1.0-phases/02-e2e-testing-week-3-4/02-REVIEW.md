---
phase: "02"
plan: "01"
status: issues_found
depth: standard
files_reviewed: 5
files_reviewed_list:
  - tests/e2e/journeys.spec.ts
  - tests/e2e/accessibility.spec.ts
  - .github/workflows/test.yml
  - src/pages/index.astro
  - playwright.config.ts
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
date: 2026-05-11
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-11T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

This phase introduced E2E tests for critical user journeys and keyboard accessibility, split the CI
`e2e` job into blocking (Chromium) and informational (cross-browser) legs, and made two production
changes to `src/pages/index.astro`: skip link placement and `tabindex="-1"` on `<main>`.

Three blockers were found:

1. The skip link has no CSS styling to make it visually hidden when unfocused — it renders inline
   above the UrgencyBar, breaking the page visually in production.
2. The CI cross-browser job installs all browsers but runs only `firefox`, `webkit`, and `mobile`
   projects; however the `mobile` project in `playwright.config.ts` maps to "iPhone 13" which is a
   WebKit device — so `--project=mobile` will attempt to use the WebKit binary already installed,
   but the test command omits `--project=chromium` which is correct. The real blocker is that
   `e2e-cross-browser` does **not** depend on `e2e-chromium`, so a failing Chromium run does not
   gate cross-browser — they race in parallel off `unit-and-integration`. This means a broken build
   can have "informational" cross-browser results reported before the blocking Chromium result
   arrives, misleading the PR check summary.
3. The sticky-CTA mobile visibility test sets a 375px viewport **before** `page.goto`, scrolls by
   500 px, then asserts `toBeVisible()`. The component uses `display: none` at viewports wider than
   720 px and `display: flex` below 720 px via a media query — it never toggles on scroll; it is
   always visible at 375 px after first paint. The scroll is therefore a no-op and the test would
   also pass if the CTA were hidden (e.g. because someone added `visibility: hidden` on mobile) — it
   does not actually confirm the intended behaviour of the sticky bar appearing after scroll.

Five warnings cover fragile CSS-class selectors, a vacuous array-length assertion, the risk that the
`continue-on-error` flag on the cross-browser job silently masks infrastructure failures, an
accessibility assertion that may pass vacuously due to the focus-visible check landing on the skip
link instead of the next element, and missing `webServer` startup ordering in CI.

---

## Critical Issues

### CR-01: Skip link has no CSS — renders visible above UrgencyBar in production

**File:** `src/pages/index.astro:31`

**Issue:** The skip link `<a href="#main" class="skip-link">` is placed as the first child of the
`<Layout>` slot (which renders inside `<body>`). The `Layout.astro` global styles contain no rule
for `.skip-link`. There is no `skip-link` CSS anywhere in the codebase (confirmed by grep). A
properly implemented skip link must be visually hidden when not focused (commonly via
`position: absolute; transform: translateY(-100%)` or `clip`) and become visible on `:focus`. As
written the link renders as a normal inline anchor at the very top of the page — above the urgency
bar — visible to all sighted users, breaking the visual layout.

**Fix:** Add a global skip-link style in `src/layouts/Layout.astro` (inside the `<style is:global>`
block):

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 9999;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
  transition: top 0.1s;
}

.skip-link:focus {
  top: 0;
}
```

Alternatively the style can live in a `<style>` block inside `index.astro` using `:global(.skip-link)`.

---

### CR-02: CI cross-browser job runs in parallel with — not after — the blocking Chromium job

**File:** `.github/workflows/test.yml:53-74`

**Issue:** Both `e2e-chromium` (line 31) and `e2e-cross-browser` (line 53) declare
`needs: unit-and-integration`. They are therefore siblings that run concurrently. If the Chromium
run fails and marks the PR as "failed", the cross-browser run has already started (or finished) and
its `continue-on-error: true` report is surfaced as a green check. GitHub PR required-status-check
configuration typically gates on named jobs; if `e2e-chromium` is the required check, the
cross-browser job completing first with green can give reviewers a false sense of passing E2E before
the blocking result lands. More concretely: if `e2e-chromium` itself is never listed as a required
status check (the workflow file does not show branch protection rules), neither job gates the merge.

The intended design — cross-browser only starts when Chromium passes — requires:

```yaml
e2e-cross-browser:
  needs: e2e-chromium   # ← was: unit-and-integration
  continue-on-error: true
```

**Fix:** Change `needs` on `e2e-cross-browser` from `unit-and-integration` to `e2e-chromium`.

---

### CR-03: Sticky CTA mobile visibility test is vacuous — does not detect regressions

**File:** `tests/e2e/journeys.spec.ts:94-99`

**Issue:** The test sets a 375 px viewport and scrolls 500 px before asserting visibility. The
`StickyCta.astro` component uses a CSS media query (`@media (max-width: 720px) { .sticky-cta {
display: flex; } }`). At 375 px the element is already `display: flex` from the first paint — the
scroll makes no difference. More critically, `toBeVisible()` in Playwright checks that the element
is in the DOM, has non-zero dimensions, and is not hidden (`display:none`, `visibility:hidden`,
`opacity:0`). It does NOT check that it is inside the visible viewport. This test would pass even if
the sticky CTA were scrolled completely off screen (e.g., pinned to `bottom: -200px`) or if it were
obscured by a full-page overlay. It will also pass even when the element has `display: none` in the
CSS if a JavaScript `show()` call is missing — because the media query on a 375 px Playwright
viewport already sets it to `display: flex` without any scroll trigger.

**Fix:** To meaningfully assert the sticky CTA's mobile behaviour, assert that it is
`toBeInViewport()` (not just visible in DOM) and verify it does not obscure content. Alternatively,
confirm the element's `display` computed style rather than relying on `toBeVisible()`:

```ts
test("sticky CTA is visible on mobile viewport (375px wide)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  const stickyCta = page.locator("div.sticky-cta");
  // The element should be in the visible viewport (fixed, bottom: 0)
  await expect(stickyCta).toBeInViewport();
  // Confirm it is not hidden by computed style
  const display = await stickyCta.evaluate((el) =>
    getComputedStyle(el).display
  );
  expect(display).toBe("flex");
});
```

---

## Warnings

### WR-01: Test selectors couple to CSS implementation classes, not semantic roles

**File:** `tests/e2e/journeys.spec.ts:18, 25, 32, 88`

**Issue:** The CTA and sticky CTA tests use CSS class selectors (`a.btn.primary.massive`,
`a.btn.ghost`, `a.btn.nav-cta`, `div.sticky-cta`). These classes are presentational, generated by
the `Button.astro` component's internal `classList` logic. Any visual refactor — e.g. renaming
`massive` to `hero-size`, removing `.btn` in favour of a custom element, or changing the wrapper
from `div` to `aside` — will silently break these tests with a "locator not found" failure that has
nothing to do with the CTA's functional correctness.

**Fix:** Prefer ARIA-role or `data-testid` selectors for test stability:
```ts
// In Button.astro, add: <a ... data-testid={testId} ...>
// In Hero.astro, add: data-testid="hero-primary-cta" to the primary Button
const primaryCta = page.getByTestId("hero-primary-cta");
// Or use ARIA:
const primaryCta = page.getByRole("link", { name: /Quero ser Arquiteto/ });
```

---

### WR-02: Tab-order test assertion on `focused.length` is always true — vacuous guard

**File:** `tests/e2e/accessibility.spec.ts:37`

**Issue:** The test presses Tab 6 times and collects results in `focused[]`. After the loop,
`expect(focused.length).toBeGreaterThanOrEqual(3)` is asserted. However `focused` is built with a
fixed-count `for` loop (`for (let i = 0; i < 6; i++)`), so `focused.length` is always exactly `6`
regardless of page content. The length check can never fail — it tests the loop counter, not the
page. The actual meaningful assertion — that anchor elements are present — is on line 40 (`anchorCount >= 2`), but the length guard on line 37 provides false confidence.

**Fix:** Remove the vacuous length assertion and keep only the meaningful assertions:
```ts
// Remove: expect(focused.length).toBeGreaterThanOrEqual(3);
// The anchor count and "none" checks are the real signal.
expect(anchorCount).toBeGreaterThanOrEqual(2);
expect(focused).not.toContain("none");
```

---

### WR-03: Focus-visible test may land on skip link, not the "NavBar brand link" it intends

**File:** `tests/e2e/accessibility.spec.ts:86-95`

**Issue:** The test comment says "Tab once to move focus to skip link / Tab again to move to the
next interactive element (NavBar brand link)". The second Tab is expected to land on the NavBar
brand `<a href="#top">`. However, the actual tab order depends on DOM position. In `index.astro`
the skip link is followed by `<UrgencyBar />` before `<NavBar />`. If `UrgencyBar` renders any
focusable element (e.g. a close button), Tab 2 will land there, not on the NavBar brand link. The
test only asserts `outlineStyle !== "none"` — it does not confirm which element is focused. This
means the test can pass even if the NavBar brand link itself has `outline: none` (a common
mistake), so long as UrgencyBar's element has a visible outline.

**Fix:** Assert focus is on the expected element by identity:
```ts
await page.keyboard.press("Tab"); // skip link
await page.keyboard.press("Tab"); // next interactive element
const focusedHref = await page.evaluate(
  () => (document.activeElement as HTMLAnchorElement)?.getAttribute("href") ?? ""
);
expect(focusedHref).toBe("#top"); // NavBar brand link
// Then assert outline on that confirmed element
```
Also verify `UrgencyBar` has no focusable children, or account for them in the Tab sequence.

---

### WR-04: `continue-on-error: true` on the job level swallows infrastructure failures

**File:** `.github/workflows/test.yml:56`

**Issue:** `continue-on-error: true` set at the **job** level (not step level) means that if the
cross-browser job fails due to infrastructure reasons — e.g. the `npx playwright install
--with-deps` step times out, the build step fails, or the runner runs out of disk — the overall
workflow still reports success. This makes it impossible to distinguish "Firefox is flaky on this
feature" from "the entire cross-browser runner crashed before running a single test."

**Fix:** Move `continue-on-error: true` to only the test step itself, not the job:

```yaml
e2e-cross-browser:
  runs-on: ubuntu-latest
  needs: e2e-chromium
  steps:
    - ...
    - name: E2E tests — Firefox, WebKit, mobile (informational)
      continue-on-error: true          # ← only the test step, not the job
      run: npx playwright test --project=firefox --project=webkit --project=mobile
```

---

### WR-05: No `webServer` start is part of CI e2e jobs — tests could hit a cold server

**File:** `.github/workflows/test.yml:34-51, 53-74`

**Issue:** Both e2e CI jobs run `npm run build` followed immediately by `npx playwright test`.
Playwright's `webServer` block in `playwright.config.ts` is configured to run `npm run preview`
with `reuseExistingServer: !process.env.CI` — which is `false` in CI (since `CI=true` is set). This
means Playwright will attempt to start `npm run preview` automatically as part of the test run.
However, there is no explicit `npm run preview` step in the workflow; Playwright starts it
internally. If the preview server fails to start within Playwright's default timeout (60 s), all
tests fail with a misleading connection error rather than a clear server startup error. There is
also no port-conflict guard — if a previous job left the port open on a shared runner, the new
preview may fail to bind.

**Fix:** Add an explicit preview server startup step with a readiness probe before running tests:

```yaml
- run: npm run build
- name: Start preview server
  run: npm run preview &
  env:
    CI: true
- name: Wait for server to be ready
  run: npx wait-on http://localhost:4321/deep-dive-vm/ --timeout 30000
- name: E2E tests — Chromium (blocking)
  run: npx playwright test --project=chromium
  env:
    CI: true
```

---

## Info

### IN-01: Anchor scroll tests do not verify actual viewport scroll position

**File:** `tests/e2e/journeys.spec.ts:44-82`

**Issue:** The 5 scroll tests call `document.querySelector("#id")?.scrollIntoView()` via
`page.evaluate()` then assert `toBeInViewport()`. The `?.` optional chaining means that if a
section ID does not exist in the DOM (e.g. due to a template refactor renaming `#metodo` to
`#method`), the `scrollIntoView()` call is silently skipped, `scrollIntoView` is never called, and
the assertion may still pass if the element happens to be near the top of the page. A missing
section ID produces no test failure — only a vacuous pass.

**Fix:** Assert the element exists before scrolling:
```ts
const section = page.locator("#metodo");
await expect(section).toBeAttached(); // fails loudly if ID is missing
await section.scrollIntoViewIfNeeded();
await expect(section).toBeInViewport();
```

---

### IN-02: `UrgencyBar` position before skip link in DOM ordering

**File:** `src/pages/index.astro:32-33`

**Issue:** The slot order in `index.astro` is: skip-link → UrgencyBar → NavBar → main. The
`UrgencyBar` renders between the skip link and the NavBar. If `UrgencyBar` ever gains a focusable
element (a dismiss button is a common pattern), it will appear second in tab order — between the
skip link and the NavBar brand link — which the accessibility tests do not account for. This is an
architectural fragility rather than a current bug, but it is worth noting while the tab-order tests
are being established.

**Fix:** If `UrgencyBar` needs to be dismissable, ensure it uses `aria-hidden` or `tabindex="-1"`
on its dismiss control, or update the accessibility tests to account for any focusable UrgencyBar
children.

---

### IN-03: `playwright.config.ts` `workers: 1` in CI serialises all tests globally

**File:** `playwright.config.ts:8`

**Issue:** `workers: process.env.CI ? 1 : undefined` forces single-worker execution in CI. With
`fullyParallel: true` on line 4, this means tests are queued but only one runs at a time. For 5
test files across multiple projects this is acceptable, but as the test suite grows this will cause
CI runtimes to balloon. The `workers: 1` setting is commonly used to avoid port conflicts with
`webServer`, but Playwright's built-in `webServer` block already handles this. If each CI job
launches its own `preview` server, workers could be increased to speed up runs.

**Fix (low urgency):** Consider `workers: process.env.CI ? 2 : undefined` once the test suite
grows, and verify that the preview server can handle concurrent connections.

---

_Reviewed: 2026-05-11T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
