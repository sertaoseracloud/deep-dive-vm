---
phase: 02-page-integration
reviewed: 2026-05-15T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - src/components/HeroMotion.tsx
  - src/components/MobileMenuMotion.tsx
  - src/components/SettingsToggle.tsx
  - src/components/TestimonialCard.tsx
  - src/components/layout/NavBar.astro
  - src/components/sections/Hero.astro
  - src/components/sections/Pricing.astro
  - src/components/ui/Button.astro
  - src/pages/index.astro
  - tests/e2e/homepage.spec.ts
  - tests/unit/components/HeroMotion.test.tsx
  - tests/unit/components/MobileMenuMotion.test.tsx
  - tests/unit/components/NavBar.test.ts
  - tests/unit/components/TestimonialCard.test.tsx
findings:
  critical: 4
  warning: 7
  info: 4
  total: 15
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-15T00:00:00Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

The phase-02 integration delivers motion components, NavBar scripting, and page assembly. The implementation is largely coherent but contains four blockers that directly affect correctness: a React `aria-hidden` boolean serialization bug breaks the mobile menu's accessibility contract (and invalidates the tests relying on it), the hero content is invisible without JavaScript due to `initial={{ opacity: 0 }}` with no CSS fallback, the pricing section has its purchase button permanently commented out with no replacement, and `aria-current="true"` is a semantically invalid value for navigation links. Seven warnings cover memory leaks, reduced-motion bypasses, and test quality gaps. Four info items address dead code and style inconsistencies.

Cross-cutting context: `src/lib/motion-utils.ts` was also read as a dependency; its own implementation is sound. Findings below are confined to the 14 files in scope.

---

## Critical Issues

### CR-01: `aria-hidden={false}` is silently dropped by React — mobile menu is always hidden to screen readers when open

**File:** `src/components/MobileMenuMotion.tsx:33`

**Issue:** JSX passes `aria-hidden={!isOpen}` (a boolean) to both `<motion.nav>` and `<nav>`. When `isOpen` is `true`, this resolves to `aria-hidden={false}`. React does **not** emit `aria-hidden="false"` for `false` booleans on non-void HTML elements — it removes the attribute entirely. This is browser-confirmed behavior: `element.getAttribute("aria-hidden")` returns `null`, not `"false"`, when the menu is open.

Consequence:
1. Screen readers that rely on `aria-hidden="false"` to un-hide the nav won't receive the attribute. Assistive technology falls back to the element being visible in the DOM tree but still potentially reported as hidden if a parent `aria-hidden="true"` is applied elsewhere.
2. The unit tests in `MobileMenuMotion.test.tsx` lines 70 and 87 assert `nav?.getAttribute("aria-hidden") === "false"`, which will return `null` — the tests are passing only because of the happy-dom/jsdom `aria-hidden` mock behavior, not real React output.

**Fix:** Use string literals instead of booleans:

```tsx
// MobileMenuMotion.tsx — both the motion.nav and the nav fallback
aria-hidden={isOpen ? undefined : "true"}
// or equivalently:
aria-hidden={!isOpen ? "true" : undefined}
```

Removing the attribute entirely when the menu is open is the correct ARIA pattern; setting it to `"false"` is redundant per spec but omitting it avoids the React boolean-to-removal footgun. Update the tests to match:

```ts
// When closed:
expect(nav?.getAttribute("aria-hidden")).toBe("true");
// When open:
expect(nav?.hasAttribute("aria-hidden")).toBe(false);
```

---

### CR-02: Hero content is invisible without JavaScript — `initial={{ opacity: 0 }}` with no CSS fallback

**File:** `src/components/HeroMotion.tsx:12` / `src/pages/index.astro:69`

**Issue:** `HeroMotion` is mounted with `client:visible` in `index.astro`. The `motion.div` carries `initial={{ opacity: 0, y: 20 }}`. Before React hydrates (or if it fails), the rendered DOM is:

```html
<astro-island> <!-- HeroMotion not yet hydrated -->
  <!-- Hero.astro children not rendered -->
</astro-island>
```

Actually worse: with `client:visible`, Astro renders the component shell on the server but the motion.div's `initial` state is a **client-side** prop applied by motion/react after hydration. However, since HeroMotion wraps `<Hero />` as an Astro slot child passed through React's `children`, the entire Hero markup is inside the React boundary — it's not server-rendered independently.

The net effect: on any page load where JavaScript is slow, blocked, or disabled, the above-the-fold hero content is **not visible at all**. `Hero.astro`'s CSS sets `.hero-content { opacity: 1 }` (line 239) but this scoped style is on `.hero-content` div inside Hero, while the outer `motion.div` from HeroMotion has inline `style="opacity: 0"` applied by motion/react which wins over the scoped CSS.

Additionally, `MotionConfig reducedMotion="user"` disables animation when the user prefers reduced motion — but only after hydration. A user who prefers reduced motion still sees `opacity: 0` during the hydration window.

**Fix (two-part):**

1. Add a CSS rule that overrides the motion.div opacity before hydration resolves:

```css
/* In Hero.astro <style> or global CSS */
/* Ensures hero is visible before HeroMotion hydrates */
astro-island > div {
  opacity: 1 !important;
}
/* Override reversed when motion kicks in — motion sets inline style */
```

2. A better architectural fix: move `HeroMotion` to wrap only the animated decorative elements, not the entire hero content. The hero text/CTA should be server-rendered and always visible. Or switch from `initial={{ opacity: 0 }}` to a CSS class-based animation that is opted-in after hydration.

---

### CR-03: Purchase button permanently commented out in Pricing section — section has no conversion action

**File:** `src/components/sections/Pricing.astro:171-193`

**Issue:** The primary CTA button is wrapped in a JSX comment block inside a curly-brace expression:

```astro
{
  /**
  <Button href="https://pay.hotmart.com/..." ...>
    Quero garantir minha vaga agora
  </Button>
  */
}
```

This is not a to-do placeholder — it is the **only purchase button in the pricing section**. Users who scroll to the pricing card see the price, the feature list, and the guarantee, but no button to actually buy. The `href` is also `"https://pay.hotmart.com/..."` with a literal `...` — the real Hotmart URL was never filled in.

The `.price-cta` CSS rule at line 439 and the `:global(.price-cta)` override in `Button.astro:115` exist specifically for this button, confirming this is not intentional removal.

**Fix:** Either restore the button with a real Hotmart URL, or replace the comment with a visible placeholder that makes the missing URL explicit so it cannot be shipped:

```astro
<!-- TODO: Replace with real Hotmart URL before launch -->
<Button href="#investimento" variant="primary" size="massive" customClass="price-cta">
  Quero garantir minha vaga agora
</Button>
```

---

### CR-04: `aria-current="true"` is not a valid value for navigation current-page indication

**File:** `src/components/layout/NavBar.astro:227-229`

**Issue:** The active-section IntersectionObserver sets `aria-current="true"` on the active nav link:

```ts
activeLink.setAttribute("aria-current", "true");
```

While `"true"` is technically an accepted token in the `aria-current` enumeration (as a generic "yes, this is current"), it is semantically incorrect for navigation. The ARIA 1.1 spec recommends:
- `aria-current="page"` for the current page in a set of pages
- `aria-current="location"` for current location in a hierarchical structure

Screen readers announce `aria-current="page"` as "current page" or similar — `aria-current="true"` is announced as "current" without context, which is confusing in a navigation landmark.

**Fix:**

```ts
activeLink.setAttribute("aria-current", "location");
// or, since these are sections of a single page:
activeLink.setAttribute("aria-current", "true");  // acceptable but prefer:
activeLink.setAttribute("aria-current", "page");   // most widely supported
```

Update the CSS selector accordingly (currently `.nav-links a[aria-current="true"]` at line 130 of NavBar.astro):

```css
.nav-links a[aria-current="page"] {
  color: var(--nucleo-eletrico, #00FFFF);
  border-bottom: 2px solid currentColor;
}
```

---

## Warnings

### WR-01: IntersectionObservers in NavBar are never disconnected — memory leak on SPA navigation

**File:** `src/components/layout/NavBar.astro:175-236`

**Issue:** Two `IntersectionObserver` instances (`scrollObserver` at line 175 and `sectionObserver` at line 218) are created in `<script>` blocks but never disconnected. For a purely static multi-page site this is low impact, but Astro's View Transitions (if ever enabled) or any SPA-style navigation will re-run these script blocks without cleaning up the previous observers. Each navigation would add another observer pair observing the same elements.

**Fix:** Add cleanup on page unload or Astro's lifecycle event:

```ts
// After creating scrollObserver:
document.addEventListener("astro:before-swap", () => {
  scrollObserver.disconnect();
  sectionObserver.disconnect();
}, { once: true });
```

Or use `window.addEventListener("beforeunload", ...)` as a simpler fallback.

---

### WR-02: `entries[0]` accessed without bounds check in both IntersectionObserver callbacks

**File:** `src/components/layout/NavBar.astro:177` and `NavBar.astro:221`

**Issue:** Both IO callbacks access `entries[0]` unconditionally. The `IntersectionObserver` spec guarantees at least one entry per callback invocation, but defensive access is still warranted since the spec notes callbacks may be called with an empty array in edge cases (e.g., unobserve called between scheduling and delivery).

At line 177: `nav.dataset.scrolled = String(!entries[0].isIntersecting);`
At line 221: `entries.forEach(...)` — this one is safe, but the implicit reliance on `entries[0]` in line 177 is not.

**Fix:**

```ts
(entries) => {
  if (entries.length === 0) return;
  nav.dataset.scrolled = String(!entries[0].isIntersecting);
}
```

---

### WR-03: `applyFallback` in non-motion path uses `transition: "all 150ms ease-out"` — bypasses prefers-reduced-motion

**File:** `src/lib/motion-utils.ts:106` (called from `MobileMenuMotion.tsx:20`)

**Issue:** `applyFallback` hardcodes `transition: "all 150ms ease-out"` in its implementation. This transition is applied to the `<nav>` element in `MobileMenuMotion` when `motionEnabled` is false (line 19-23). The intent of the fallback is to handle the reduced-motion / no-animation path — but the function applies a CSS transition anyway.

If `motionEnabled` is `false` because `prefers-reduced-motion: reduce` is set (which is the priority-1 case in `useMotionEnabled`), the fallback still adds a 150ms transition, violating the user's system preference.

**Fix:** `applyFallback` should check for reduced motion before applying the transition:

```ts
export function applyFallback(
  element: HTMLElement,
  properties: Partial<CSSStyleDeclaration>
): void {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Object.assign(element.style, {
    ...(prefersReduced ? {} : { transition: "all 150ms ease-out" }),
    ...properties,
  });
}
```

---

### WR-04: `SettingsToggle` outer `div` has `aria-label` without a semantic role — label is ignored by AT

**File:** `src/components/SettingsToggle.tsx:13-14`

**Issue:** The container `div` carries `aria-label="Controle de animações"` but has no ARIA role. Per ARIA spec, `aria-label` is only meaningful on elements with a role that accepts naming (interactive, landmark, or widget roles). A plain `div` with no role is a generic container — its `aria-label` is not exposed to the accessibility tree. The actual toggle input does have an `aria-label="Enable animations"` (line 76) which is sufficient, but the container label is dead.

Additionally, having `aria-label` on the `input` (line 76) while also having a `<label htmlFor="motion-toggle">` referencing the same input creates a label conflict. The `aria-label` wins, but the label element's visual text (which is the visual toggle — no text) is ignored. This is technically fine here since the label has no text content, but confusing.

**Fix:** Remove `aria-label` from the outer `div` (it has no effect), and optionally add `role="group"` with the label if grouping is desired:

```tsx
<div
  role="group"
  aria-label="Controle de animações"
  style={...}
>
```

---

### WR-05: `Button.astro` — reduced-motion CSS leaves `filter` and `box-shadow` transitions active

**File:** `src/components/ui/Button.astro:120-127`

**Issue:** The `@media (prefers-reduced-motion: reduce)` block at lines 120-127 only resets `will-change` and removes the `transform` on hover. The base `.btn` style (line 49) defines four transitions: `transform`, `filter`, `background`, and `box-shadow`. Under reduced motion, `filter` and `box-shadow` transitions (150ms each) remain active. These are visible motion to users who have requested reduced motion.

**Fix:**

```css
@media (prefers-reduced-motion: reduce) {
  .btn {
    will-change: auto;
    transition: none;
  }
  .btn:hover {
    transform: none;
  }
}
```

---

### WR-06: `MobileMenuMotion` has no focus trap — keyboard users can navigate behind the overlay

**File:** `src/components/MobileMenuMotion.tsx:26-48`

**Issue:** When `isOpen` is `true`, the menu renders as a fixed `position: fixed` panel covering part of the screen. There is no focus trap: Tab/Shift-Tab allows keyboard focus to move to elements underneath the overlay (the main content, hero CTA, etc.), which are still in the tab order. This violates WCAG 2.1 success criterion 2.1.2 (No Keyboard Trap is satisfied in reverse — users should be trapped *in* the dialog until it's closed).

There is also no `Escape` key handler to close the menu.

**Fix:** Implement a focus trap on open, and add Escape key to close:

```tsx
useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      window.dispatchEvent(new CustomEvent("toggle-menu"));
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen]);
```

For the full focus trap, use a library (e.g., `focus-trap-react`) or implement manual first/last focusable element cycling.

---

### WR-07: Test for post-unmount listener removal does not verify the handler is actually removed

**File:** `tests/unit/components/MobileMenuMotion.test.tsx:90-99`

**Issue:** The test "cleanup no unmount" dispatches a `toggle-menu` event after `unmount()` and asserts it does not throw. This is insufficient: `window.dispatchEvent` never throws — dispatching an event with no listeners is always a no-op. If the `removeEventListener` in the `useEffect` cleanup is removed from the production code, this test continues to pass. The cleanup regression would be undetected.

**Fix:** Track state changes after unmount to verify the handler is no longer active:

```ts
it("cleanup no unmount: handler não é chamado após unmount", async () => {
  const { container, unmount } = render(React.createElement(MobileMenuMotion, {}));
  
  unmount();
  
  // Dispatching after unmount should not change any DOM state
  // (the component is gone, but we verify no errors thrown and
  //  no in-memory state mutation occurs)
  let threw = false;
  try {
    window.dispatchEvent(new CustomEvent("toggle-menu"));
  } catch {
    threw = true;
  }
  expect(threw).toBe(false);
  // Ideally: spy on setIsOpen and verify it's not called
});
```

A stronger approach: spy on `useState`'s setter before unmount and verify it's not called post-unmount.

---

## Info

### IN-01: Unnecessary `React` import in `index.astro` — React 19 + JSX transform does not require it

**File:** `src/pages/index.astro:21`

**Issue:** `import React from "react"` at line 21 is used explicitly as `React.createElement(...)` in lines 55-56 for populating carousel items. This is intentional in this context (the Astro frontmatter runs server-side/Node context where JSX transform may not apply), but it is worth confirming whether the JSX transform is configured for the Astro frontmatter. If not needed, it adds 6KB+ to the bundle.

The `React.createElement` calls in the frontmatter (lines 55-56) do require the `React` import to be present. This is not a bug but is worth reviewing if JSX syntax could be used instead with the Astro JSX transform.

**Fix:** Document why `React.createElement` is used instead of JSX syntax in the frontmatter, or migrate to JSX if supported:

```ts
// Verify whether JSX works in Astro frontmatter for this project
const carouselItems = testimonials.map(t => ({
  id: t.id,
  content: <TestimonialCard data={t} />,
}));
```

---

### IN-02: `TestimonialCard.test.tsx` mocks `motion-utils` which `TestimonialCard` does not import

**File:** `tests/unit/components/TestimonialCard.test.tsx:8-10`

**Issue:** Lines 8-10 set up a `vi.mock("../../../src/lib/motion-utils", ...)` mock. `TestimonialCard.tsx` has no import of `motion-utils` (confirmed by reading the file — its only import is `React`). The mock is dead configuration that provides no test coverage value and misleads future readers into thinking the card depends on motion state.

**Fix:** Remove the dead mock:

```ts
// Remove these lines — TestimonialCard has no motion-utils dependency
vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
}));
```

---

### IN-03: `NavBar.test.ts` tests re-implement production logic instead of importing it — tests cannot catch divergence

**File:** `tests/unit/components/NavBar.test.ts:13-16`

**Issue:** The `createNavScrollCallback` function is a hand-written copy of the IntersectionObserver callback in `NavBar.astro`. Because Astro files cannot be directly imported in Vitest, the test re-implements the logic. This means: if the NavBar script logic changes (e.g., adds a `dataset.scrolled !== value` equality guard), the tests will not fail — they test the copy, not the original.

**Fix:** Add a comment making the coupling explicit, and consider adding an E2E test that exercises scroll behavior in the actual browser to supplement:

```ts
// NOTE: This callback is a hand-copy of NavBar.astro's IO script (lines 175-182).
// If NavBar.astro script changes, this test must be updated manually.
// Integration coverage is provided by tests/e2e/homepage.spec.ts.
```

---

### IN-04: Commented-out code in `Pricing.astro` embeds a dead Hotmart URL in source — informational risk

**File:** `src/components/sections/Pricing.astro:174`

**Issue:** `href="https://pay.hotmart.com/..."` with a literal `...` is not a URL — it is a placeholder that was never filled in. This is low risk (the button is commented out) but confirms the section was never wired to a real payment link. The placeholder will confuse anyone who un-comments the button.

This is tracked as a separate info item from CR-03 (the missing button itself).

**Fix:** Replace with an explicit `TODO` comment citing the required value:

```astro
{/* TODO(launch): Replace with real Hotmart product URL before go-live */}
{/* <Button href="https://pay.hotmart.com/PRODUCT_ID" ... /> */}
```

---

_Reviewed: 2026-05-15T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
