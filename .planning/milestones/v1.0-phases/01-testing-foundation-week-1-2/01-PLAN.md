---
phase: 01-testing-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - vitest.config.ts
  - vitest.setup.ts
  - package.json
  - .github/workflows/test.yml
  - .lhcirc.json
  - playwright.config.ts
  - tests/unit/components/Button.test.ts
  - tests/unit/components/SectionHead.test.ts
  - tests/unit/components/Layout.test.ts
  - tests/unit/components/NavBar.test.ts
  - tests/unit/components/Footer.test.ts
  - tests/unit/components/Hero.test.ts
  - tests/unit/components/UrgencyBar.test.ts
  - tests/unit/components/StickyCta.test.ts
  - tests/unit/components/Pricing.test.ts
  - tests/unit/components/Faq.test.ts
  - tests/integration/content-collections.test.ts
  - tests/integration/route-generation.test.ts
  - tests/e2e/homepage.spec.ts
  - tests/seo/seo-meta.test.ts
autonomous: true
requirements:
  - unit-coverage-80
  - integration-content-collections
  - e2e-homepage
  - seo-lighthouse-90
  - tdd-mandate

must_haves:
  truths:
    - "npm run test:unit passes with >= 80% statement and branch coverage"
    - "npm run test:integration passes for content collection data flow and Zod schema validation"
    - "npm run test:e2e passes the homepage load, section navigation, and responsive checks"
    - "Lighthouse CI SEO score >= 90 in the GitHub Actions workflow"
    - "GitHub Actions workflow runs unit, integration, e2e, and Lighthouse on every push to main"
    - "Failing tests were written BEFORE any implementation change (TDD mandate)"
  artifacts:
    - path: "vitest.config.ts"
      provides: "Vitest configuration with jsdom environment, coverage thresholds, and Astro test utilities"
    - path: ".github/workflows/test.yml"
      provides: "CI pipeline: unit -> integration -> build -> e2e -> lighthouse, runs on push to main"
    - path: ".lhcirc.json"
      provides: "Lighthouse CI configuration with SEO >= 90 assert"
    - path: "tests/unit/components/Button.test.ts"
      provides: "Props-contract unit test for Button component"
    - path: "tests/integration/content-collections.test.ts"
      provides: "Integration test validating real Markdown fixture data flow through Zod schemas"
    - path: "tests/e2e/homepage.spec.ts"
      provides: "Playwright E2E covering homepage load, section visibility, and responsive viewports"
    - path: "tests/seo/seo-meta.test.ts"
      provides: "Static meta-tag assertion: title length, description length, OG tags, canonical URL"
  key_links:
    - from: "vitest.config.ts"
      to: "tests/unit/**/*.test.ts"
      via: "include glob pattern"
    - from: "vitest.config.ts"
      to: "coverage thresholds"
      via: "coverage.thresholds (statements >= 80, branches >= 80)"
    - from: ".github/workflows/test.yml"
      to: "npm run test:unit"
      via: "job step: run unit tests and enforce coverage gate"
    - from: ".github/workflows/test.yml"
      to: "npx lhci autorun"
      via: "job step: lighthouse CI after astro build"
    - from: "tests/integration/content-collections.test.ts"
      to: "src/components/sections/*.astro"
      via: "real Markdown fixture parsed through Astro Content Collections API"
---

<objective>
Establish the complete TDD-driven testing infrastructure for the Deep Dive VM landing page.

Purpose: Phase 1 provides the quality gate that all future phases build on. No feature ships without passing tests. CI enforces the gate on every push.

Output:

- Vitest configured for unit and integration tests (jsdom, coverage reporting)
- Playwright configured for E2E (Chromium, Firefox, WebKit, three viewport widths)
- Lighthouse CI enforcing SEO >= 90
- GitHub Actions workflow wiring all layers in the correct sequence
- Baseline test suites covering all major components, content-collection data flow, homepage E2E, and static SEO meta-tag assertions
</objective>

<execution_context>
@C:/Users/HP/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/HP/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/1-testing-foundation-week-1-2/01-CONTEXT.md
@specs/testes_unitarios.md
@specs/testes_integracao.md
@specs/qa.md
@specs/acessibility_reponsivity.md

<interfaces>
<!-- Key component interfaces extracted from codebase. Use these directly. -->

From src/components/ui/Button.astro:
  Props: { href: string; variant?: "primary" | "ghost" | "solid-core"; size?: "normal" | "massive"; customClass?: string }
  Renders: <a href={href} class="btn {variant} {size} {customClass}">

From src/components/ui/SectionHead.astro:
  Props: { eyebrow: string; idx?: string; titleHtml: string; lede?: string; center?: boolean }
  Renders: <div class="section-head [center]"> wrapping .eyebrow, h2.section-title, p.section-lede

From src/layouts/Layout.astro:
  Props: { title: string; description?: string; url?: string }
  Renders: full HTML document with <SEO> (astro-seo), OG tags, Twitter card, canonical link

From src/components/layout/NavBar.astro, Footer.astro, UrgencyBar.astro, StickyCta.astro:
  No typed Props interface — zero-prop components; render markup only.

From src/components/sections/Hero.astro:
  No typed Props — self-contained section with hardcoded copy and Button component.

From src/pages/index.astro:
  Imports and composes all section components inside <Layout title="..." description="..." url={Astro.url.toString()}>
</interfaces>
</context>

---

## Area 1: Setup — Toolchain & CI Configuration

### Task 1 — Install dependencies and configure Vitest

**TDD note:** This task establishes the test runner. There is no production code to test yet; the task itself IS the failing-state (no tests exist). The test suite files created in Tasks 3–6 are the RED step.

**What to do:**

1. Install dev dependencies (add to `package.json` devDependencies, run `npm install`):
   - `vitest` `@vitest/coverage-v8` `vitest-environment-jsdom` (or `jsdom` as a peer)
   - `@astrojs/test-utils` (Astro's official test utilities; check current package name at <https://www.npmjs.com/package/@astrojs/test-utils>)
   - `zod` (if not already present as a dependency)
   - `@lhci/cli` for Lighthouse CI

2. Create `vitest.config.ts` at project root:

   ```
   - extend Vite config from astro.config.mjs using astro() plugin so Astro files resolve
   - test.environment = "jsdom"
   - test.include = ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts", "tests/seo/**/*.test.ts"]
   - test.exclude = ["tests/e2e/**"]
   - test.coverage.provider = "v8"
   - test.coverage.include = ["src/**"]
   - test.coverage.exclude = ["src/assets/**", "src/pages/**"]
   - test.coverage.thresholds = { statements: 80, branches: 80, functions: 80, lines: 80 }
   - test.coverage.reporter = ["text", "json", "html"]
   - test.setupFiles = ["./vitest.setup.ts"]
   - test.globals = true
   ```

3. Create `vitest.setup.ts` at project root — import `@testing-library/jest-dom/vitest` (or equivalent matcher extension for DOM assertions). Keep it minimal.

4. Add npm scripts to `package.json` scripts section:
   - `"test:unit": "vitest run --reporter=verbose --coverage"`
   - `"test:integration": "vitest run --reporter=verbose tests/integration"`
   - `"test:unit:watch": "vitest --watch"`
   - `"test:all": "vitest run --coverage"`

5. Create `.lhcirc.json` at project root:

   ```json
   {
     "ci": {
       "collect": {
         "staticDistDir": "./dist",
         "numberOfRuns": 1
       },
       "assert": {
         "assertions": {
           "categories:seo": ["error", { "minScore": 0.9 }],
           "categories:accessibility": ["warn", { "minScore": 0.9 }],
           "categories:best-practices": ["warn", { "minScore": 0.8 }]
         }
       },
       "upload": {
         "target": "temporary-public-storage"
       }
     }
   }
   ```

6. Create directory scaffolding (empty dirs with `.gitkeep`):
   - `tests/unit/components/`
   - `tests/integration/`
   - `tests/e2e/`
   - `tests/seo/`

**Acceptance criterion:** `npx vitest run --reporter=verbose` exits with "No test files found" (no error from config parsing). `node -e "require('./vitest.config.ts')"` does not throw.

---

### Task 2 — Configure Playwright and GitHub Actions CI

**What to do:**

1. Update `playwright.config.ts` — replace existing config with:
   - `testDir: './tests/e2e'`
   - `use.baseURL: 'http://localhost:4321/deep-dive-vm'` (local preview URL, not production)
   - `projects`: Chromium + Firefox + WebKit (all three, using `devices` presets for Desktop)
   - Add a `viewport` project entry for mobile: `{ name: 'mobile', use: { ...devices['iPhone 13'] } }`
   - `webServer.command: 'npm run preview'`, `url: 'http://localhost:4321'`, `reuseExistingServer: !process.env.CI`
   - `retries: process.env.CI ? 2 : 0`
   - `reporter: process.env.CI ? 'github' : 'html'`

2. Install Playwright browsers in CI (handled via workflow step, not local config).

3. Create `.github/workflows/test.yml`:

   ```yaml
   name: Test Suite

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     unit-and-integration:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '22'
             cache: 'npm'
         - run: npm ci
         - run: npm run test:unit
           name: Unit tests (coverage gate >= 80%)
         - run: npm run test:integration
           name: Integration tests
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: coverage-report
             path: coverage/

     e2e:
       runs-on: ubuntu-latest
       needs: unit-and-integration
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '22'
             cache: 'npm'
         - run: npm ci
         - run: npx playwright install --with-deps
         - run: npm run build
         - run: npx playwright test
           env:
             CI: true
         - uses: actions/upload-artifact@v4
           if: always()
           with:
             name: playwright-report
             path: playwright-report/

     lighthouse:
       runs-on: ubuntu-latest
       needs: unit-and-integration
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '22'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - run: npx lhci autorun
           name: Lighthouse CI (SEO >= 90)
   ```

   Job ordering: `unit-and-integration` is the gate. `e2e` and `lighthouse` both `needs: unit-and-integration` and can run in parallel with each other.

**Acceptance criterion:** `npx actionlint .github/workflows/test.yml` exits 0 (no syntax errors). `playwright.config.ts` has four project entries (chromium, firefox, webkit, mobile).

---

## Area 2: Unit Tests — Components

### Task 3 — Unit tests for UI and layout components (RED phase)

**TDD note:** Write these tests FIRST. They will fail because no test infrastructure existed before Task 1. After Task 1 completes, the tests run but the assertions define the expected contract. Only fix production code if the rendered output is genuinely wrong.

**What to do:**

Create the following test files. Each test file must:

- Import `{ experimental_AstroContainer as AstroContainer }` from `astro/container` (the Astro Container API for rendering components in tests).
- Render the component using `await container.renderToString(Component, { props })`.
- Assert on the resulting HTML string using `expect(html).toContain(...)` or a DOM parser from `@testing-library/dom`.

**`tests/unit/components/Button.test.ts`** — test the `Button` component:

- `variant="primary"` renders `<a>` with class `btn primary`
- `variant="ghost"` renders class `btn ghost`
- `variant="solid-core"` renders class `btn solid-core`
- `size="massive"` appends class `massive`
- `href` value appears as the `href` attribute on the rendered `<a>`
- `customClass="my-class"` is included in the class list
- Missing `variant` defaults to `primary` (default prop)
- Missing `size` defaults to `normal` (no `massive` class present)
- Snapshot test: render with all defaults, assert snapshot matches

**`tests/unit/components/SectionHead.test.ts`** — test the `SectionHead` component:

- `eyebrow` text appears in `.eyebrow-text`
- `titleHtml` appears inside `h2.section-title`
- `lede` appears in `p.section-lede` when provided
- `lede` is absent from output when not provided
- `idx` appears in `.idx` span when provided
- `center=true` adds class `center` to `.section-head` wrapper
- `center=false` (default) does NOT include class `center`
- Snapshot test: render with all props set

**`tests/unit/components/Layout.test.ts`** — test the `Layout` layout:

- `title` prop appears in `<title>` tag
- `description` prop appears in `<meta name="description">` content attribute
- Open Graph `og:title` meta tag is present
- Open Graph `og:type` meta tag is present and equals `website`
- Twitter card `name="twitter:card"` meta tag is present
- `<html lang="pt-BR">` attribute is set (language declared)

**`tests/unit/components/NavBar.test.ts`**:

- NavBar renders a `<nav>` element
- At least one `<a>` link is present in the output
- Snapshot test: full render

**`tests/unit/components/Footer.test.ts`**:

- Footer renders a `<footer>` element
- Contains a copyright or brand text (assert non-empty text content)
- Snapshot test: full render

**`tests/unit/components/UrgencyBar.test.ts`**:

- UrgencyBar renders output (not empty string)
- Snapshot test

**`tests/unit/components/StickyCta.test.ts`**:

- StickyCta renders output containing an `<a>` (CTA link)
- Snapshot test

**Acceptance criterion:** `npm run test:unit` runs all files in `tests/unit/` — tests are RED (fail) until Astro Container API is wired correctly in Task 1 setup. After wiring, tests pass and coverage report is generated. Zero snapshot files exist initially; first run creates them.

---

### Task 4 — Unit tests for section components with edge-case injection (RED phase)

**TDD note:** Deliberate edge-case injection per `specs/testes_unitarios.md`. These tests define the contract for resilience; any component failing these has a real defect to fix.

**What to do:**

**`tests/unit/components/Hero.test.ts`**:

- Renders `<h1>` (exactly one H1 present in output)
- `<h1>` text content is non-empty
- At least one `<a>` button/link exists in the section
- Snapshot test

**`tests/unit/components/Pricing.test.ts`**:

- Renders pricing section output (non-empty)
- At least one CTA `<a>` element present
- Snapshot test

**`tests/unit/components/Faq.test.ts`**:

- Renders FAQ section (non-empty)
- Contains at least one `<dt>` or `<summary>` element (FAQ question container)
- Snapshot test

**Edge-case battery — apply to Button and SectionHead:**

In `Button.test.ts` add:

- `href=""` (empty string) — component renders without throwing; `<a>` is present
- `customClass=""` (empty string) — no extra trailing space in class attribute
- `customClass` with special characters `"my-class--modifier"` — passes through unchanged

In `SectionHead.test.ts` add:

- `eyebrow=""` (empty string) — renders `.eyebrow-text` without crashing
- `titleHtml=""` — renders `h2.section-title` without crashing, no exception thrown
- `titleHtml` with HTML `<span class="flame">word</span>` — the span is preserved in output (set:html passthrough)
- `lede` with an extremely long string (>500 chars) — renders without truncation or exception

**Acceptance criterion:** `npm run test:unit` includes all edge-case assertions. Tests for Hero, Pricing, Faq pass after first run (components render correctly). Edge-case tests for Button and SectionHead pass with current production code or expose a real defect.

---

## Area 3: Integration Tests — Content Collections & Routes

### Task 5 — Integration tests: Zod schema validation and content data flow

**TDD note:** Write these tests BEFORE examining exactly how Astro's `getCollection` returns data. The test defines the expected contract. If Astro's API returns a shape that doesn't match, that's the gap to fix.

**What to do:**

There is no `src/content/` directory yet — content is hardcoded in component files. Per the locked decision (D-02: "Real Markdown content fixtures from the repo"), create a minimal fixture directory with representative Markdown files. These are test fixtures, not production content.

1. Create `tests/fixtures/content/` directory structure:
   - `tests/fixtures/content/sections/hero.md` — with frontmatter fields that represent the hero section data shape. Example frontmatter:

     ```
     ---
     title: "Deep Dive Azure Virtual Machine"
     description: "A formação definitiva para Engenheiros..."
     eyebrow: "DEEP DIVE"
     idx: "01"
     ---
     ```

   - `tests/fixtures/content/sections/faq.md` — with a `questions` array in frontmatter (array of `{q, a}` objects).
   - `tests/fixtures/content/sections/pricing.md` — with price, currency, and CTA fields.

2. Create `tests/integration/content-collections.test.ts`:
   - Define Zod schemas inline matching the fixture frontmatter shapes:
     - `heroSchema`: `{ title: z.string().min(1), description: z.string().max(160), eyebrow: z.string(), idx: z.string().optional() }`
     - `faqSchema`: `{ questions: z.array(z.object({ q: z.string(), a: z.string() })).min(1) }`
     - `pricingSchema`: `{ price: z.number(), currency: z.string().length(3) }`
   - Use `gray-matter` (already in dependencies) to parse each fixture `.md` file's frontmatter.
   - Assert `heroSchema.safeParse(parsed.data).success === true` for the hero fixture.
   - Assert `faqSchema.safeParse(parsed.data).success === true` for the FAQ fixture.
   - Assert `pricingSchema.safeParse(parsed.data).success === true` for the pricing fixture.

   **Negative (red-path) assertions** (per `specs/testes_integracao.md` orphan injection requirement):
   - Create an inline object `{ title: "" }` and assert `heroSchema.safeParse(obj).success === false` (empty title fails `min(1)`).
   - Create an inline object `{ description: "x".repeat(200) }` and assert `heroSchema.safeParse(obj).success === false` (exceeds `max(160)`).
   - Create an inline object `{ questions: [] }` and assert `faqSchema.safeParse(obj).success === false` (empty array fails `min(1)`).
   - Create an inline object `{ price: "not-a-number" }` and assert `pricingSchema.safeParse(obj).success === false`.

3. Create `tests/integration/route-generation.test.ts`:
   - Import `glob` (use `import { glob } from 'node:fs/promises'` pattern or `fast-glob`) to enumerate files matching `tests/fixtures/content/**/*.md`.
   - For each fixture file, derive the expected URL slug: strip `tests/fixtures/content/sections/` prefix and `.md` extension.
   - Assert that each derived slug is a non-empty lowercase string containing no spaces (basic route-shape contract).
   - Idempotency test: parse each fixture twice and assert both parsed frontmatter objects deep-equal each other (same input → same output, per `specs/testes_integracao.md`).

**Acceptance criterion:** `npm run test:integration` passes all positive-path assertions. Negative-path assertions confirm Zod rejects invalid data (tests are GREEN on first run by design — they test Zod behavior, not production Astro code).

---

## Area 4: E2E Tests — Homepage Flow

### Task 6 — Playwright E2E: homepage load, navigation, responsive

**TDD note:** Write the spec file against the live site or local build. On first run without a local build these will fail (RED). They turn GREEN once `npm run build && npm run preview` is running.

**What to do:**

Create `tests/e2e/homepage.spec.ts` with the following test cases. All tests use `page.goto('/')` (resolves to `baseURL` in playwright config).

**Homepage load:**

- `page.goto('/')` returns HTTP 200 (check `response.status() === 200`)
- `<h1>` is visible on the page (`await expect(page.locator('h1')).toBeVisible()`)
- Page `<title>` is non-empty (`await expect(page).toHaveTitle(/.+/)`)

**Section visibility:**

- `#top` (hero section) is visible
- `main` element is present
- Footer element is visible
- Navigation `<nav>` is visible (skip-link exists: `a.skip-link` pointing to `#main`)

**Navigation:**

- `<a>` elements inside `<nav>` have valid `href` attributes (not empty, not `#`)
- At least 3 anchor links present in the page body pointing to section IDs

**Responsive checks** (use `page.setViewportSize` for each):

- Mobile (`375 x 812`): `h1` is visible, no horizontal overflow (check `document.documentElement.scrollWidth <= window.innerWidth`)
- Tablet (`768 x 1024`): `h1` is visible
- Desktop (`1280 x 800`): `h1` is visible
- Ultra-wide (`1920 x 1080`): `h1` is visible, layout does not break

**Accessibility smoke check** (axe-core via `@axe-core/playwright` — install if not present):

- Run `await checkA11y(page)` on homepage — no critical violations (level A/AA)

**90% pass-rate gate:** The spec has 10 test assertions total. Playwright's `retries: 2` in CI handles flakiness. The 90% target is met if 9/10 pass; document which test is least stable in a comment.

**Acceptance criterion:** `npx playwright test tests/e2e/homepage.spec.ts --project=chromium` passes locally after `npm run build && npm run preview`.

---

## Area 5: SEO — Static Meta-Tag Tests + Lighthouse CI

### Task 7 — Static SEO assertions and Lighthouse CI gate

**TDD note:** SEO meta-tag tests are pure assertions on the built HTML. They fail RED until `npm run build` produces `dist/index.html`. Lighthouse tests are integration-level and require a build + local server.

**What to do:**

**Static SEO tests (`tests/seo/seo-meta.test.ts`):**

Use Node's `fs.readFileSync` to load `dist/index.html` after a build. Parse with `rehype-parse` (already in dependencies) or a simple regex. Assert:

1. `<title>` tag is present and its text content length is <= 60 characters.
2. `<meta name="description">` content attribute is present and length is between 10 and 160 characters.
3. `<meta property="og:title">` is present and non-empty.
4. `<meta property="og:description">` is present and non-empty.
5. `<meta property="og:image">` is present and non-empty.
6. `<meta property="og:type">` is present and equals `website`.
7. `<meta name="twitter:card">` is present and non-empty.
8. Exactly one `<h1>` tag is present in the document (heading hierarchy enforcement).
9. `<link rel="canonical">` is present with a non-empty `href`.
10. All `<img>` tags have a non-empty `alt` attribute (alt text enforcement).

Add a vitest `beforeAll` hook that runs `execSync('npm run build')` to ensure `dist/` is fresh before assertions. Or accept that the CI pipeline runs `npm run build` before this suite.

**Note:** The test file is included in Vitest's `test.include` via `tests/seo/**/*.test.ts`. It must be run AFTER a build. In CI, the `lighthouse` job runs `npm run build` first; locally, developers must run `npm run build` before `npm run test:all`.

**Lighthouse CI configuration (`.lhcirc.json` — already created in Task 1):**

- `collect.staticDistDir: "./dist"` — uses built artifact, no server needed
- Assert `categories:seo >= 0.9` (90)
- Defer performance thresholds (LCP, FCP, CLS) to Phase 3 per locked decision D-04

**Acceptance criterion:**

- `npm run build && npx vitest run tests/seo/seo-meta.test.ts` passes all 10 assertions on current `dist/index.html`.
- `npm run build && npx lhci autorun` reports SEO score >= 90 without `--no-assert` flag.

---

## Verification Checklist

This checklist maps directly to REQUIREMENTS.md acceptance criteria. All items must be GREEN before Phase 1 is closed.

| # | Acceptance criterion | Verification command | Status |
|---|----------------------|----------------------|--------|
| 1 | Unit test coverage >= 80% for `src/components` and `src/layouts` | `npm run test:unit` (check coverage summary in terminal output — statements and branches >= 80%) | [ ] |
| 2 | Integration tests pass for all content collection types | `npm run test:integration` exits 0 | [ ] |
| 3 | E2E tests cover home page and critical user flows | `npx playwright test tests/e2e/homepage.spec.ts` passes >= 90% of cases across Chromium, Firefox, WebKit, mobile | [ ] |
| 4 | Lighthouse SEO score >= 90 in CI | `npm run build && npx lhci autorun` reports `seo: 0.9+` | [ ] |
| 5 | All new features developed with TDD (tests written first) | Git log shows test-file commits precede any production-code change commits in this phase | [ ] |
| 6 | Accessibility audit passes | `npx playwright test` with axe-core check returns zero critical violations | [ ] |
| 7 | CI pipeline runs on every push to main | GitHub Actions workflow present at `.github/workflows/test.yml`; `npx actionlint` exits 0 | [ ] |
| 8 | Coverage report generated and available as CI artifact | `coverage/` directory uploaded as artifact in `unit-and-integration` job | [ ] |

**Coverage gate detail:** REQUIREMENTS.md sets `>= 80%` as the acceptance threshold and `95%+` as the aspirational target. The Vitest `coverage.thresholds` block enforces 80% hard failure in CI. The 95% target is tracked as a stretch goal and reported in the coverage HTML artifact.

---

<threat_model>

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Markdown fixtures → Zod parser | Untrusted frontmatter YAML enters schema validation |
| Built HTML → SEO assertion test | File-system read of `dist/index.html` (local build artifact, controlled) |
| Playwright → preview server | Browser automation against local static server |
| GitHub Actions → npm registry | `npm ci` installs packages from registry on every CI run |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-01 | Tampering | Markdown fixtures in `tests/fixtures/` | accept | Fixtures are version-controlled; no untrusted user input reaches them. Low-value target in a CI-only testing context. |
| T-01-02 | Repudiation | GitHub Actions workflow | mitigate | Use `actions/checkout@v4` with pinned SHA in production hardening. Log test results and coverage as named artifacts with retention. |
| T-01-03 | Information Disclosure | `lighthouse-report.json` committed to repo (seen in git status) | mitigate | Add `lighthouse-report.json` to `.gitignore`. Lighthouse CI uploads to temporary-public-storage which auto-expires. |
| T-01-04 | Denial of Service | `npm ci` supply-chain attack via malicious package version | mitigate | Use `npm ci` (lockfile-pinned) not `npm install`. Consider enabling `npm audit` step in CI workflow. |
| T-01-05 | Elevation of Privilege | `execSync('npm run build')` inside test file | accept | Runs in controlled CI environment (ubuntu-latest, no root). Local developer must opt in manually. No network exposure. |
</threat_model>

<verification>
Run these commands in sequence on the final state of the branch before closing Phase 1:

```bash
# 1. Lint workflow file
npx actionlint .github/workflows/test.yml

# 2. Unit tests with coverage
npm run test:unit

# 3. Integration tests
npm run test:integration

# 4. Build
npm run build

# 5. SEO static assertions
npx vitest run tests/seo/seo-meta.test.ts

# 6. Lighthouse CI
npx lhci autorun

# 7. E2E (requires preview server — run in separate terminal or use Playwright's webServer)
npx playwright test tests/e2e/homepage.spec.ts

# 8. Check all scripts exist in package.json
node -e "const p=require('./package.json'); ['test:unit','test:integration','test:all'].forEach(s=>{ if(!p.scripts[s]) throw new Error('Missing script: '+s) }); console.log('All scripts present')"
```

All commands must exit 0.
</verification>

<success_criteria>
Phase 1 is complete when:

1. `npm run test:unit` exits 0 with coverage report showing statements >= 80% and branches >= 80% for `src/`.
2. `npm run test:integration` exits 0 — all Zod schema and route-derivation tests pass.
3. `npx playwright test tests/e2e/homepage.spec.ts` reports >= 90% pass rate across all four browser/viewport projects.
4. `npm run build && npx lhci autorun` reports SEO category score >= 0.90 without assertion override.
5. `.github/workflows/test.yml` is syntactically valid (`actionlint` clean) and triggers correctly on push to main.
6. Git history for this phase shows test files committed before any production code changes (TDD mandate verifiable via `git log --oneline`).
7. `lighthouse-report.json` is added to `.gitignore` (no binary/large JSON committed).
</success_criteria>

<output>
After all tasks complete, create `.planning/phases/1-testing-foundation-week-1-2/01-01-SUMMARY.md` covering:
- Which test files were created and what they cover
- Final coverage percentages achieved
- Lighthouse SEO score recorded
- Any production code defects discovered and fixed during TDD RED phase
- Deviations from this plan and rationale
</output>
