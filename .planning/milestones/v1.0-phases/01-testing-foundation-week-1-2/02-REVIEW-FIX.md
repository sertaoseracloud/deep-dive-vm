---
phase: "01"
fixed_at: "2026-05-11T14:57:00Z"
review_path: .planning/phases/01-testing-foundation-week-1-2/02-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-11T14:57:00Z
**Source review:** `.planning/phases/01-testing-foundation-week-1-2/02-REVIEW.md`
**Iteration:** 1

**Summary:**

- Findings in scope: 8 (CR-01, CR-02, CR-03, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 8
- Skipped: 0

**Verification:** All 30 Playwright e2e tests pass on Chromium after fixes.

---

## Fixed Issues

### CR-01: Skip link has no CSS (visible to all sighted users)

**Files modified:** `src/layouts/Layout.astro`
**Commit:** `90bb2b6`
**Applied fix:** Added `.skip-link` and `.skip-link:focus` rules to the global `<style is:global>` block. The skip link is now positioned absolutely at `top: -100%` (off-screen), revealed to `top: 0` on `:focus`. Uses CSS custom properties `--abismo-profundo` and `--nucleo-eletrico` matching the project design tokens.

---

### CR-02: e2e-cross-browser job must run AFTER e2e-chromium, not concurrently

**Files modified:** `.github/workflows/test.yml`
**Commit:** `a500488`
**Applied fix:** Changed `needs: unit-and-integration` to `needs: e2e-chromium` on the `e2e-cross-browser` job, enforcing the Chromium gate before cross-browser runs.

Note: WR-04 was fixed in the same commit (same file) — see WR-04 entry below.

---

### CR-03: Sticky CTA test is vacuous (scroll irrelevant, toBeVisible insufficient)

**Files modified:** `tests/e2e/journeys.spec.ts`, `src/components/layout/StickyCta.astro`
**Commit:** `c6ed7da`
**Applied fix:** Rewrote the mobile sticky CTA visibility test to:

1. Use `toBeInViewport()` instead of `toBeVisible()` (which ignores CSS display:none via media query).
2. Assert `getComputedStyle(el).display !== "none"` to verify the media query is active.
3. Assert the CTA contains a valid `a[href]` link.
4. Updated the locator to `[data-testid="sticky-cta"]` (see WR-01).

Note: WR-01 was also committed in this same batch (same files touched).

---

### WR-01: CTA selectors coupled to internal CSS classes

**Files modified:** `tests/e2e/journeys.spec.ts`, `src/components/ui/Button.astro`, `src/components/sections/Hero.astro`, `src/components/layout/NavBar.astro`, `src/components/layout/StickyCta.astro`
**Commit:** `c6ed7da`
**Applied fix:**

- Added optional `testid?: string` prop to `Button.astro`; renders as `data-testid={testid}` on the `<a>` element.
- Added `testid="hero-cta-primary"` to the primary Hero CTA, `testid="hero-cta-ghost"` to the ghost CTA, `testid="nav-cta"` to NavBar CTA.
- Added `data-testid="sticky-cta"` directly to the `StickyCta.astro` wrapper `<div>`.
- Updated all CTA locators in `journeys.spec.ts` to use `[data-testid="..."]` selectors, decoupling tests from internal CSS class names.

---

### WR-02: Tab-order assertion always true (fixed loop count)

**Files modified:** `tests/e2e/accessibility.spec.ts`
**Commit:** `01e8b8a`
**Applied fix:** Rewrote the focused-elements array from `string[]` to `Array<{ tag: string; text: string }>` objects. Replaced the vacuous `focused.length >= 3` check (always 6) with:

- Assert no element has tag `"NONE"` (no focus lost to body).
- Filter by `f.tag === "A"` and assert `>= 2` anchor elements received focus.
- Assert no consecutive elements have the same `text` value (no stuck focus).

---

### WR-03: Focus-visible test lands on wrong element (ambiguous Tab stop)

**Files modified:** `tests/e2e/accessibility.spec.ts`
**Commit:** `01e8b8a`
**Applied fix:** Added an assertion that `document.activeElement?.tagName === "A"` immediately after the second Tab press, before checking the outline style. This guarantees the test is verifying a real navigation anchor's focus ring, not the body or an unexpected element.

---

### WR-04: continue-on-error at job level swallows infra failures

**Files modified:** `.github/workflows/test.yml`
**Commit:** `a500488`
**Applied fix:** Removed `continue-on-error: true` from the `e2e-cross-browser` job level; added it only to the specific test step (`npx playwright test --project=firefox --project=webkit --project=mobile`). Infrastructure steps (npm ci, build, playwright install) now correctly fail the job on error.

---

### WR-05: No readiness probe for preview server in CI

**Files modified:** `playwright.config.ts`
**Commit:** `d4538a1`
**Applied fix:** Added `timeout: 60 * 1000` to the `webServer` configuration block, giving the preview server up to 60 seconds to become ready before Playwright begins test execution.

---

## Skipped Issues

None — all findings were fixed.

---

## Post-fix Verification

```
npx playwright test tests/e2e/ --project=chromium
PASS (30) FAIL (0)
Time: 23212ms
```

All 30 tests pass with zero failures after applying all 8 fixes.

---

_Fixed: 2026-05-11T14:57:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
