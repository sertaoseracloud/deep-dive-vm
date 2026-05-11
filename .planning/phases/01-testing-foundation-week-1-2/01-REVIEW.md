---
phase: "01"
plan: "01"
status: "issues_found"
depth: standard
files_reviewed: 25
findings:
  critical: 4
  warning: 7
  info: 5
  total: 16
date: 2026-05-11
---

# Code Review: Phase 01 — Testing Foundation

## Summary

Reviewed 25 source files covering the full testing foundation: vitest config, playwright config, CI workflow, 11 unit component tests, 2 integration tests, 1 E2E spec, 1 SEO test suite, 3 fixture files, and the main page entry point with its Layout component.

Overall quality is above average for a first foundation phase. Test structure is clear, fixtures are well-formed, and the CI pipeline is sound. However, four blocking issues were found: a hardcoded `href="#"` canonical URL in production markup (which will hurt SEO), a security-degraded `npm audit` gate that silently passes on high-severity vulnerabilities, a `@playwright/test` dependency placed in `dependencies` instead of `devDependencies` (ships to production bundles), and an SEO test that can never run in CI because the build step is missing from the unit-and-integration job. Seven warnings cover fragile test patterns, a mismatch between the webServer health-check URL and the baseURL, and a misleading link-relation misuse in Layout. Five info items address minor quality gaps.

---

## Critical Findings

### CR-01 — Canonical URL is hardcoded to `"#"` in production

**File:** `src/layouts/Layout.astro:43`
**Issue:** The canonical link is emitted as `<link rel="canonical" href="#">`. A fragment-only canonical is invalid and will be indexed as a literal `#` by search engines. This directly defeats the canonical SEO guarantee the test suite (`seo-meta.test.ts` test 9) attempts to verify — the test checks only that the attribute is non-empty, so it passes while the value is wrong.
**Impact:** Every page is canonicalized to `#`. Search engines may treat the page as having no canonical, causing duplicate-content penalties.
**Fix:**
```astro
{ rel: "canonical", href: url ?? Astro.url.href },
```
Remove the placeholder `"#"` and use the `url` prop (already passed from `index.astro`) or fall back to `Astro.url.href`.

---

### CR-02 — `npm audit` gate is non-blocking (`continue-on-error: true`)

**File:** `.github/workflows/test.yml:25`
**Issue:** The supply-chain security gate runs `npm audit --audit-level=high` but immediately follows it with `continue-on-error: true`. This means the CI pipeline will succeed and code will be merged even when high-severity vulnerabilities are detected. The gate is cosmetic — it logs but does not block.
**Impact:** A dependency with a known RCE or credential-theft vulnerability would not block a merge. The audit step provides false assurance.
**Fix:**
```yaml
- name: npm audit (supply-chain gate)
  run: npm audit --audit-level=high
  # Remove continue-on-error entirely, or set it to false.
  # If known false-positives exist, use --omit=dev or an .nsprc allowlist instead.
```
If there are currently failing audit findings that must be excepted, address them explicitly rather than silencing the entire gate.

---

### CR-03 — `@playwright/test` and `playwright` are in `dependencies`, not `devDependencies`

**File:** `package.json:26–27`
**Issue:** Both `@playwright/test` and `playwright` are listed under `dependencies` (runtime). These are pure test tools. Placing them in `dependencies` means they are bundled into any production install (`npm install --production`), significantly increasing the deployment footprint and attack surface.
**Impact:** Production deployments include browser-automation binaries. Hosting environments that run `npm install --production` (or equivalent) will download ~150 MB of Playwright browser binaries unnecessarily. Also, `npm audit` will report their vulnerabilities as production-scope issues.
**Fix:**
```json
"devDependencies": {
  "@playwright/test": "^1.59.1",
  "playwright": "^1.59.1",
  ...
}
```
Move both entries from `dependencies` to `devDependencies`.

---

### CR-04 — SEO test suite (`seo-meta.test.ts`) is never run in CI and will throw on missing `dist/`

**File:** `.github/workflows/test.yml:20–21` and `tests/seo/seo-meta.test.ts:20–26`
**Issue:** The SEO tests read `dist/index.html`, which requires a prior `npm run build`. The CI job `unit-and-integration` runs `npm run test:unit` and `npm run test:integration` but never executes `npm run build`. The `vitest.config.ts` includes `tests/seo/**/*.test.ts` in the unit test glob. At runtime, the `beforeAll` hook will throw `Error: dist/index.html not found`, causing the entire SEO suite to hard-fail (not skip) with an unhandled error. The build is performed only in the separate `e2e` and `lighthouse` jobs, but those jobs do not run the SEO vitest suite.
**Impact:** Either the SEO tests always fail in CI (if `dist/` is absent) or they are silently never executed. The coverage gate (80%) will also be computed without SEO-related execution.
**Fix:** Add a build step to the `unit-and-integration` job before the test commands, or move the SEO tests into the `lighthouse` job where the build already runs:
```yaml
- run: npm run build
- name: SEO meta tests
  run: npx vitest run tests/seo
```
Alternatively, restructure the `beforeAll` to skip gracefully instead of throwing when `dist/` is absent, and exclude `tests/seo/**` from the vitest include glob, running it only after a build.

---

## Warning Findings

### WR-01 — Playwright `webServer` health-check URL does not include the base path

**File:** `playwright.config.ts:33–36`
**Issue:** `baseURL` is `http://localhost:4321/deep-dive-vm` but `webServer.url` is `http://localhost:4321` (no base path). Playwright uses `webServer.url` to determine when the server is ready by polling it for an HTTP 200. The root path `/` may return 404 on the Astro preview server for this project (since it is mounted at `/deep-dive-vm`), so the readiness check could succeed prematurely on a redirect/404 response, or fail unnecessarily.
**Impact:** Flaky E2E startup in CI or local runs if the root route is not served.
**Fix:**
```ts
webServer: {
  command: "npm run preview",
  url: "http://localhost:4321/deep-dive-vm",
  reuseExistingServer: !process.env.CI,
},
```

---

### WR-02 — `rel="prev"`, `rel="next"`, and `rel="alternate"` misused as canonical supplements

**File:** `src/layouts/Layout.astro:44–46`
**Issue:** The `<head>` emits `<link rel="prev">`, `<link rel="next">`, and `<link rel="alternate">` all pointing to the same `url` prop value. These link relations have specific semantics (pagination and language alternates). Using them with identical hrefs for a single-page site is meaningless noise that can confuse crawlers. `rel="prev"` and `rel="next"` were deprecated by Google in 2019.
**Impact:** Adds invalid/deprecated markup to every page. Crawlers may interpret `rel="alternate"` without an `hreflang` as an alternate language version of the same URL, causing indexing confusion.
**Fix:** Remove all three link entries entirely, or replace `rel="alternate"` with a proper `hreflang` if multi-language support is planned:
```astro
// Delete lines emitting rel="prev", rel="next", rel="alternate"
```

---

### WR-03 — `<main>` element test assertion always passes regardless of structure

**File:** `tests/e2e/homepage.spec.ts:40–44`
**Issue:** The test asserts `mainCount + bodyCount > 0`. Since `<body>` is always present on any valid HTML page, this assertion can never fail even if `<main>` is completely absent. The test provides no real safety net.
**Impact:** A regression removing `<main>` would not be caught by this test.
**Fix:**
```ts
test("<main> element is present and visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
});
```

---

### WR-04 — SEO test 10 (alt attribute) passes vacuously when no `<img>` tags exist

**File:** `tests/seo/seo-meta.test.ts:115–124`
**Issue:** The loop `for (const tag of imgTags)` is never entered if the built page has no `<img>` tags. The test passes trivially, providing no guarantee about alt text. This is a false green — if images are later added without alt text, the test still passes until the build is updated and tests are re-run deliberately.
**Impact:** Alt-text regressions go undetected.
**Fix:** Add a guard asserting at least one image is present, or restructure:
```ts
const imgTags = html.match(/<img[^>]*>/gi) ?? [];
expect(imgTags.length).toBeGreaterThan(0); // Fail explicitly if no images
for (const tag of imgTags) { ... }
```
If decorative-only images are intentional, document why this check is acceptable.

---

### WR-05 — `content-collections.test.ts` uses `resolve()` with a relative path (CWD-dependent)

**File:** `tests/integration/content-collections.test.ts:8` and `tests/integration/route-generation.test.ts:6`
**Issue:** `resolve("tests/fixtures/content/sections")` without a base anchor relies on `process.cwd()` being the project root. Vitest typically sets cwd to the project root, but this is not guaranteed when tests are run from a different directory or when IDE runners are used.
**Impact:** Tests fail with "no such file" when run from any directory other than the project root.
**Fix:** Use `import.meta.url` or `__dirname` as the anchor:
```ts
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "../../fixtures/content/sections");
```

---

### WR-06 — `Footer.test.ts` copyright assertion is year-specific and will break in 2027

**File:** `tests/unit/components/Footer.test.ts:16`
**Issue:** The regex `/Sertao|2026|Raposo|Cloud/i` includes the literal year `2026`. If the footer's copyright year is updated to `2027` and the Sertao/Raposo/Cloud text is removed or changed, this assertion fails for the wrong reason.
**Impact:** Test maintenance burden; potential false negatives when the footer is legitimately updated.
**Fix:** Remove the year literal from the test or make it dynamic:
```ts
const currentYear = new Date().getFullYear().toString();
expect(html).toMatch(new RegExp(`Sertao|${currentYear}|Raposo|Cloud`, "i"));
```
Or remove the year alternative entirely and rely on brand-name matching only.

---

### WR-07 — `numberOfRuns: 1` in `.lhcirc.json` produces unreliable Lighthouse scores

**File:** `.lhcirc.json:5`
**Issue:** Lighthouse CI is configured to run exactly one audit per URL. A single run can vary by ±5–10 points due to timing, CPU throttling, and simulated network conditions. With a hard `minScore: 0.9` for SEO (set as `"error"`), a single unlucky run can fail the build even when the page is genuinely good.
**Impact:** Flaky CI — Lighthouse failures that are not real regressions create noise and erode trust in the pipeline.
**Fix:**
```json
"numberOfRuns": 3
```
Three runs and median scoring is the minimum recommended by the Lighthouse CI documentation to get stable results.

---

## Info Findings

### IN-01 — Snapshot tests create implicit coupling to implementation details

**File:** `tests/unit/components/Button.test.ts:74–80`, `SectionHead.test.ts:73–85`, `NavBar.test.ts:18–23`, `Footer.test.ts:19–24`, `UrgencyBar.test.ts:18–23`, `StickyCta.test.ts:18–23`, `Hero.test.ts:29–33`, `Pricing.test.ts:18–23`, `Faq.test.ts:18–23`
**Issue:** Nine of the test files contain snapshot tests (`toMatchSnapshot()`). Snapshot tests in component unit tests tend to assert everything, including whitespace, class order, and Astro-generated attribute ordering. This makes them brittle — any intentional styling change requires a snapshot update, and reviewers often accept snapshot updates without verifying the diff is correct.
**Impact:** Low signal-to-noise ratio; snapshots become stale and rubber-stamped.
**Fix:** Consider replacing pure render snapshots with targeted structural assertions (check presence of specific elements/attributes). Reserve snapshots for regression testing after explicit stabilization.

---

### IN-02 — `vitest.config.ts` excludes `src/pages/**` from coverage without explanation

**File:** `vitest.config.ts:19`
**Issue:** `src/pages/**` is excluded from coverage computation. This means the `index.astro` page (which imports and composes every section) is not tracked in the 80% coverage threshold. The exclusion is reasonable for Astro pages but should be documented.
**Impact:** Coverage numbers do not reflect the actual component-composition logic in pages.
**Fix:** Add a comment explaining the exclusion rationale:
```ts
exclude: [
  "src/assets/**",
  "src/pages/**", // Astro pages are integration-tested via E2E, not unit coverage
],
```

---

### IN-03 — `index.astro` contains a leftover Astro boilerplate comment

**File:** `src/pages/index.astro:22–23`
**Issue:** Lines 22–23 contain the default Astro scaffold comment: `// Welcome to Astro! Wondering what to do next? Check out the Astro documentation...`. This is copy-paste residue from the project template.
**Impact:** Cosmetic noise in production source code.
**Fix:** Delete the two comment lines.

---

### IN-04 — `aggregateRating.reviewCount` is hardcoded to `"127"` in structured data

**File:** `src/layouts/Layout.astro:98–99`
**Issue:** The JSON-LD structured data has `"reviewCount": "127"` hardcoded. This is a static number that will become stale. Google may penalize pages where structured data does not reflect actual content.
**Impact:** Stale/misleading structured data; potential Search Console warnings.
**Fix:** Either source this value from a content file/constant that is maintained, or remove the `aggregateRating` block until real review data is available.

---

### IN-05 — `test:integration` npm script does not invoke the coverage runner

**File:** `package.json:16`
**Issue:** `"test:integration": "vitest run --reporter=verbose tests/integration"` runs integration tests without `--coverage`. This means the 80% coverage gate in `vitest.config.ts` is only enforced when running `test:unit`, not when running `test:integration` separately. If a developer runs only `test:integration`, they receive no coverage feedback.
**Impact:** Coverage gate can be bypassed by running tests individually.
**Fix:** Either add `--coverage` to `test:integration` or document that coverage is only measured via `test:all`. The CI pipeline runs `test:unit` (which does include `--coverage`) so the gate holds in CI, but local developer experience is inconsistent.

---

## Files Reviewed

- `vitest.config.ts`
- `vitest.setup.ts`
- `.lhcirc.json`
- `.github/workflows/test.yml`
- `playwright.config.ts`
- `package.json`
- `.gitignore`
- `tests/unit/components/Button.test.ts`
- `tests/unit/components/SectionHead.test.ts`
- `tests/unit/components/Layout.test.ts`
- `tests/unit/components/NavBar.test.ts`
- `tests/unit/components/Footer.test.ts`
- `tests/unit/components/UrgencyBar.test.ts`
- `tests/unit/components/StickyCta.test.ts`
- `tests/unit/components/Hero.test.ts`
- `tests/unit/components/Pricing.test.ts`
- `tests/unit/components/Faq.test.ts`
- `tests/integration/content-collections.test.ts`
- `tests/integration/route-generation.test.ts`
- `tests/e2e/homepage.spec.ts`
- `tests/seo/seo-meta.test.ts`
- `tests/fixtures/content/sections/hero.md`
- `tests/fixtures/content/sections/faq.md`
- `tests/fixtures/content/sections/pricing.md`
- `src/pages/index.astro`
- `src/layouts/Layout.astro` *(cross-referenced — source of CR-01 and WR-02)*
- `src/components/ui/Button.astro` *(cross-referenced — validates Button test assertions)*

---

_Reviewed: 2026-05-11T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
