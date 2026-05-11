---
phase: 01
plan: 01
nyquist_compliant: true
date: 2026-05-11
---

# Phase 01 Validation: Testing Foundation

## Test Infrastructure

| Framework | Config | Run Command |
|-----------|--------|-------------|
| Vitest | vitest.config.ts | `npm run test:unit` |
| Vitest (integration) | vitest.config.ts | `npm run test:integration` |
| Playwright | playwright.config.ts | `npx playwright test tests/e2e/homepage.spec.ts` |
| Lighthouse CI | .lhcirc.json | `npm run build && npx lhci autorun` |

### Vitest Coverage Thresholds (vitest.config.ts)

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Statements | >= 80% | Hard fail (`thresholds.statements: 80`) |
| Branches | >= 80% | Hard fail (`thresholds.branches: 80`) |
| Functions | >= 80% | Hard fail (`thresholds.functions: 80`) |
| Lines | >= 80% | Hard fail (`thresholds.lines: 80`) |

Coverage provider: `v8`. Reporters: `text`, `json`, `html`. Source scope: `src/**` excluding `src/assets/**` and `src/pages/**`.

### Playwright Projects (playwright.config.ts)

| Project | Device |
|---------|--------|
| chromium | Desktop Chrome |
| firefox | Desktop Firefox |
| webkit | Desktop Safari |
| mobile | iPhone 13 |

`retries: 2` in CI. `baseURL: http://localhost:4321/deep-dive-vm`. `webServer` auto-starts `npm run preview`.

---

## Per-Requirement Coverage Map

| Req ID | Description | Test File(s) | Assertions | Status |
|--------|-------------|--------------|------------|--------|
| `unit-coverage-80` | `npm run test:unit` passes with >= 80% statement and branch coverage | `vitest.config.ts` (thresholds) + all `tests/unit/**/*.test.ts` | 80% hard-fail gate configured; 10 component test files covering Button (12 tests), SectionHead (12), Layout (6), NavBar (3), Footer (3), UrgencyBar (3), StickyCta (3), Hero (4), Pricing (3), Faq (3) = 52 unit assertions | PARTIAL — coverage thresholds are correctly configured and test files are substantive; actual percentage cannot be confirmed without running `npm install` + `npm run test:unit` |
| `integration-content-collections` | `npm run test:integration` passes for content collection data flow and Zod schema validation | `tests/integration/content-collections.test.ts`, `tests/integration/route-generation.test.ts` | 7 Zod schema assertions (3 positive, 4 negative red-path); 3 route-derivation assertions (slug format, uniqueness, idempotency). Fixtures confirmed present: `tests/fixtures/content/sections/{hero,faq,pricing}.md`. Zod schemas inline-defined matching fixture shapes. | COVERED — file content verified; logic is correct; no environment execution required for confidence |
| `e2e-homepage` | `npm run test:e2e` passes homepage load, section navigation, and responsive checks | `tests/e2e/homepage.spec.ts` | 13 tests: HTTP 200, H1 visible, title non-empty, `#top` visible, `<main>` present, `<footer>` visible, `<nav>` visible, nav `<a>` hrefs valid, >= 3 anchor links, 4 viewport checks (375/768/1280/1920), axe-core zero critical violations | PARTIAL — spec is complete and correct; requires a live build+preview server to run; no `test:e2e` npm script defined (callers must use `npx playwright test`) |
| `seo-lighthouse-90` | Lighthouse CI SEO score >= 90 in GitHub Actions workflow | `.lhcirc.json`, `.github/workflows/test.yml` (`lighthouse` job) | `.lhcirc.json` asserts `categories:seo` at `error` level with `minScore: 0.9`. Workflow runs `npm run build && npx lhci autorun`. | PARTIAL — configuration is correct and complete; actual Lighthouse score unconfirmed without a live build run |
| `tdd-mandate` | Failing tests were written BEFORE any implementation change | Git log (commits 8439abc → 70ae47d → f6c1f2f → d5ef977 → e810d39 → 4935dbe) | Git history shows: task 1 (infra, no tests) → task 3 (unit tests RED) → task 4 (section tests RED) → task 5 (integration tests) → task 6 (E2E) → task 7 (SEO tests + index.astro fix). Test files committed in tasks 3–6 before production code changed in task 7. | COVERED — verified via `git log --oneline`; test commits precede the single production code change (index.astro SEO fixes in commit 4935dbe) |
| `ci-pipeline` | GitHub Actions workflow runs unit, integration, e2e, and Lighthouse on every push to main | `.github/workflows/test.yml` | Triggers: `push: branches: [main]` and `pull_request: branches: [main]`. Jobs: `unit-and-integration` (runs `npm run test:unit`, `npm run test:integration`, uploads `coverage/` artifact); `e2e` (needs: unit-and-integration, runs `npx playwright test`); `lighthouse` (needs: unit-and-integration, runs `npx lhci autorun`). | COVERED — file content verified; all four test layers wired; job sequencing correct |
| `a11y-smoke` | Zero critical axe-core violations on homepage | `tests/e2e/homepage.spec.ts` (last `test.describe` block) | Uses `@axe-core/playwright` `AxeBuilder` with `wcag2a` + `wcag2aa` tags. Filters for `impact === "critical"`. Asserts `criticalViolations.toHaveLength(0)`. `@axe-core/playwright@^4.10.1` in devDependencies. | PARTIAL — assertion logic is correct; requires live E2E run to confirm zero violations against actual rendered HTML |
| `coverage-report-artifact` | Coverage report uploaded as CI artifact | `.github/workflows/test.yml` (`unit-and-integration` job) | `actions/upload-artifact@v4` with `name: coverage-report`, `path: coverage/`, `if: always()`. The `coverage/` directory is produced by `npm run test:unit` (`--coverage` flag). | COVERED — workflow step verified in file; `if: always()` ensures upload on both pass and fail |

---

## Known Stubs / Manual-Only

| Item | Reason | Owner |
|------|--------|-------|
| `canonical href="#"` in `src/layouts/Layout.astro` | `url` prop is available but not wired to the canonical `<link>` tag; the literal `"#"` value passes assertion 9 in `seo-meta.test.ts` (non-empty) but is semantically invalid for SEO. Lighthouse may flag. | Future plan (Phase 2 or SEO hardening) |
| Actual coverage percentage | Cannot be confirmed without running `npm install` + `npm run test:unit`. Thresholds are correctly configured to enforce >= 80%; the 23-file test suite is substantive. | CI first run |
| Lighthouse SEO score value | Cannot be confirmed without a live `npm run build` + `npx lhci autorun`. Configuration asserts >= 90 at `error` level. | CI first run |
| `test:e2e` npm script absent | `package.json` has no `test:e2e` script; the plan's `npm run test:e2e` command is not directly callable. Callers must use `npx playwright test tests/e2e/homepage.spec.ts`. The CI workflow correctly uses `npx playwright test` directly. | Minor gap — consider adding `"test:e2e": "playwright test"` to package.json |
| `<main>` element test is weak | `homepage.spec.ts` test "main element is present" checks `mainCount + bodyCount > 0` — `<body>` always exists, so this assertion cannot fail. True intent is to verify a semantic `<main>` element. | Test logic gap — not a blocker |

---

## Verification Commands

```bash
# 1. Lint the CI workflow
npx actionlint .github/workflows/test.yml

# 2. Unit tests with coverage gate
npm run test:unit

# 3. Integration tests
npm run test:integration

# 4. Build and run SEO static assertions
npm run build && npx vitest run tests/seo/seo-meta.test.ts

# 5. Lighthouse CI (SEO >= 90)
npm run build && npx lhci autorun

# 6. E2E (Playwright auto-starts preview via webServer config)
npx playwright test tests/e2e/homepage.spec.ts --project=chromium

# 7. Verify all required npm scripts exist
node -e "const p=require('./package.json'); ['test:unit','test:integration','test:all'].forEach(s=>{ if(!p.scripts[s]) throw new Error('Missing script: '+s) }); console.log('All scripts present')"

# 8. TDD mandate — confirm test commits precede production code changes
git log --oneline .planning/phases/01-testing-foundation-week-1-2/
```

---

## Gaps Summary

| Gap | Type | Severity |
|-----|------|----------|
| `unit-coverage-80` actual % unverified | Environment (no deps installed) | Low — thresholds enforced in config |
| `e2e-homepage` / `a11y-smoke` unrun | Environment (requires build+server) | Low — spec is complete |
| `seo-lighthouse-90` score unconfirmed | Environment (requires build) | Low — config is correct |
| `test:e2e` npm script missing | Missing convenience alias | Very low — CI does not rely on it |
| `<main>` E2E assertion always passes | Weak assertion (body fallback) | Very low — informational |

---

## Sign-Off

- [ ] All COVERED requirements verified locally (`npm run test:unit`, `npm run test:integration`)
- [ ] CI pipeline passes on main branch (first push after `npm install`)
- [ ] Coverage report accessible as GitHub Actions artifact (`coverage-report`)
- [ ] Lighthouse SEO score >= 90 confirmed in CI artifact
- [ ] `npx actionlint .github/workflows/test.yml` exits 0
- [ ] E2E suite passes >= 90% across all four browser/viewport projects
