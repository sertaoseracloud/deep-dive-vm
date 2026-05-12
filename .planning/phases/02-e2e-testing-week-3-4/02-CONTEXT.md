# Phase 02 Context: E2E Testing (Week 3-4)

## Domain

Expand E2E coverage from the Phase 1 homepage baseline to full critical user journeys, multi-browser validation, keyboard accessibility, and CI integration for every push.

## Decisions

### D-01 — User Journey Scope

- **Chosen:** CTA + anchor scrolling
- Test CTA button clicks (primary and solid-core variants)
- Test anchor links scrolling to section IDs (`#top`, `#pricing`, `#faq`, etc.)
- Test sticky CTA visibility: appears after page scroll, contains a valid `<a href>`
- Base pattern: `page.goto("./")` (inherits `baseURL: http://localhost:4321/deep-dive-vm/`)

### D-02 — Multi-Browser Strategy

- **Chosen:** Chromium blocking, Firefox/WebKit/mobile informational
- CI fails only when Chromium project fails
- Firefox, WebKit, mobile run and report — failures visible but non-blocking
- Implementation: use `project.grep` or separate jobs with `continue-on-error: true` for non-Chromium
- All 4 projects remain in `playwright.config.ts` (no removal)

### D-03 — Accessibility Depth

- **Chosen:** Keyboard navigation + skip link (beyond Phase 1 axe-core smoke check)
- Add Tab-key navigation test: `Tab` moves focus through interactive elements in logical order
- Add skip-link test: `a.skip-link` or `a[href="#main"]` is keyboard-activatable and moves focus to `#main`
- Add focus-visible test: focused element has a visible outline (CSS `outline` not `none`)
- axe-core full-page scan already in Phase 1 — keep it, add keyboard-specific assertions on top

### D-04 — CI Integration

- **Chosen:** Every push to main + PRs
- E2E runs on every `push` to `main` and every `pull_request` targeting `main`
- Same trigger as unit-and-integration job (consistent gate)
- Chromium run is blocking; Firefox/WebKit/mobile in a parallel informational job
- Build handled by `webServer` in `playwright.config.ts` (`npm run preview` auto-starts)

## Canonical Refs

- `.planning/ROADMAP.md` — Phase 2 scope definition
- `.planning/REQUIREMENTS.md` — E2E acceptance criteria
- `.planning/phases/01-testing-foundation-week-1-2/01-CONTEXT.md` — Phase 1 decisions
- `playwright.config.ts` — existing 4-project config, baseURL, webServer
- `tests/e2e/homepage.spec.ts` — Phase 1 baseline to extend (not replace)
- `src/pages/index.astro` — page structure, section IDs, CTA hrefs

## Code Context

- Playwright already configured: `baseURL: "http://localhost:4321/deep-dive-vm/"`, 4 projects
- `@axe-core/playwright` installed
- Phase 1 E2E file: `tests/e2e/homepage.spec.ts` (14 tests, all passing)
- New file target: `tests/e2e/journeys.spec.ts` (CTA + anchor + sticky)
- New file target: `tests/e2e/accessibility.spec.ts` (keyboard nav + skip link + focus)

## Deferred Ideas

- Form submission testing — no form exists on current page; defer until form is added
- Search functionality — not implemented; out of scope
- Screen reader ARIA assertions — deferred to Phase 4 (continuous validation)
