---
phase: 02-e2e-testing
plan: 01
type: execute
wave: 1
depends_on: ["01-testing-foundation"]
files_modified:
  - tests/e2e/journeys.spec.ts
  - tests/e2e/accessibility.spec.ts
  - .github/workflows/test.yml
autonomous: true
requirements:
  - e2e-journeys
  - e2e-accessibility
  - e2e-multi-browser
  - e2e-ci-every-push
must_haves:
  truths:
    - "CTA button click test passes in Chromium"
    - "Anchor scrolling test confirms section IDs are reachable"
    - "Sticky CTA appears after scroll in Chromium (mobile viewport)"
    - "Tab navigation test passes keyboard focus order check"
    - "Skip link activates and moves focus to #main"
    - "Focus-visible test confirms outline present on focused elements"
    - "CI e2e-chromium job blocks on failure; e2e-cross-browser is informational"
  artifacts:
    - path: "tests/e2e/journeys.spec.ts"
      provides: "CTA click, anchor scroll, sticky CTA E2E tests"
      exports: []
    - path: "tests/e2e/accessibility.spec.ts"
      provides: "Keyboard nav, skip link, focus-visible E2E tests"
      exports: []
    - path: ".github/workflows/test.yml"
      provides: "Split e2e-chromium (blocking) + e2e-cross-browser (informational) jobs"
  key_links:
    - from: "tests/e2e/journeys.spec.ts"
      to: "src/components/sections/Hero.astro"
      via: "selector a.btn.primary.massive[href='#investimento']"
      pattern: "href.*#investimento"
    - from: "tests/e2e/journeys.spec.ts"
      to: "src/components/layout/StickyCta.astro"
      via: "div.sticky-cta — only visible at max-width 720px"
      pattern: "sticky-cta"
    - from: "tests/e2e/accessibility.spec.ts"
      to: "src/pages/index.astro"
      via: "a.skip-link[href='#main'] rendered before <main id='main'>"
      pattern: "skip-link"
    - from: ".github/workflows/test.yml"
      to: "playwright.config.ts"
      via: "project filter --project=chromium in blocking job"
      pattern: "project=chromium"
---

<objective>
Expand E2E coverage beyond the Phase 1 homepage baseline by adding tests for critical user journeys (CTA clicks, anchor scrolling, sticky CTA) and keyboard accessibility (Tab navigation, skip link, focus-visible). Simultaneously split the monolithic CI e2e job into a blocking Chromium job and an informational cross-browser job (per D-02 and D-04).

Purpose: Validate that a real user can navigate the landing page via mouse and keyboard, and that CI gates on Chromium failures without blocking on transient Firefox/WebKit/mobile failures.

Output:
- tests/e2e/journeys.spec.ts — journey tests (CTA, anchors, sticky CTA)
- tests/e2e/accessibility.spec.ts — keyboard a11y tests (Tab, skip link, focus-visible)
- .github/workflows/test.yml — split e2e jobs
</objective>

<execution_context>
@C:\Users\HP\.claude\get-shit-done\workflows\execute-plan.md
@C:\Users\HP\.claude\get-shit-done\templates\summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/02-e2e-testing-week-3-4/02-CONTEXT.md

<interfaces>
<!-- Key selectors and IDs extracted from the actual codebase. Use these directly. -->

Section IDs (from src/components/sections/*.astro):
  #top          — Hero section (header#top.hero)
  #pain         — PainPoints section
  #metodo       — Method section
  #ementa       — Curriculum section
  #mentor       — Mentor section
  #selecao      — ForWho section
  #bonus        — Bonuses section
  #depoimentos  — Testimonials section
  #investimento — Pricing section
  #faq          — FAQ section

CTA buttons rendered as <a> elements (Button.astro renders an anchor):
  Hero primary CTA:   a.btn.primary.massive[href="#investimento"]  (inside header#top)
  Hero ghost CTA:     a.btn.ghost[href="#ementa"]                  (inside header#top)
  NavBar CTA:         a.btn.primary.nav-cta[href="#investimento"]  (inside nav)
  Sticky CTA:         div.sticky-cta > a.btn.primary.sticky-btn[href="#investimento"]
    — visibility: display:none by default; display:flex at max-width 720px only

Skip link (src/pages/index.astro, rendered before <main>):
  a.skip-link[href="#main"]  — text: "Pular para o conteúdo"
  Target: main#main

Playwright config (playwright.config.ts):
  baseURL: "http://localhost:4321/deep-dive-vm/"
  projects: chromium, firefox, webkit, mobile (iPhone 13)
  webServer: npm run preview (auto-started by Playwright)
  Pattern: page.goto("./")  — resolves to baseURL

Phase 1 existing tests: tests/e2e/homepage.spec.ts (do NOT modify)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write journeys.spec.ts — CTA clicks, anchor scrolling, sticky CTA</name>
  <files>tests/e2e/journeys.spec.ts</files>
  <action>
Create tests/e2e/journeys.spec.ts with three describe blocks. Follow the same file header pattern as homepage.spec.ts (import from @playwright/test, baseURL inherited from playwright.config.ts, page.goto("./") pattern throughout).

Describe block 1 — "CTA buttons" (per D-01):
  Test "Hero primary CTA has href pointing to #investimento":
    page.goto("./"), locate a.btn.primary.massive, assert getAttribute("href") === "#investimento".
  Test "Hero ghost CTA has href pointing to #ementa":
    locate a.btn.ghost inside header#top, assert getAttribute("href") === "#ementa".
  Test "NavBar CTA has href pointing to #investimento":
    locate a.btn.nav-cta, assert getAttribute("href") === "#investimento".

Describe block 2 — "Anchor scrolling" (per D-01):
  For each of the following section IDs — #metodo, #ementa, #mentor, #investimento, #faq — write one test:
    page.goto("./"), page.evaluate(() => document.querySelector("#<id>")?.scrollIntoView()),
    await expect(page.locator("#<id>")).toBeInViewport().
  Use a data-driven loop or individual tests (individual preferred for readability in CI output).
  Also test #top: page.goto("./"), expect(page.locator("#top")).toBeVisible() immediately (already in viewport on load).

Describe block 3 — "Sticky CTA" (per D-01):
  Test "sticky CTA is present in DOM and contains href to #investimento":
    page.goto("./"),
    const stickyCta = page.locator("div.sticky-cta"),
    await expect(stickyCta).toBeAttached(),
    const link = stickyCta.locator("a[href]"),
    await expect(link).toHaveAttribute("href", "#investimento").
  Test "sticky CTA is visible on mobile viewport (375px wide)":
    page.setViewportSize({ width: 375, height: 812 }),
    page.goto("./"),
    await page.evaluate(() => window.scrollBy(0, 500)),
    await expect(page.locator("div.sticky-cta")).toBeVisible().

  Note: The sticky CTA uses CSS display:none by default and display:flex at max-width 720px. The DOM presence test runs at any viewport. The visibility test requires a mobile-sized viewport (375x812) to trigger the CSS media query — set viewport BEFORE goto.
  Do NOT test that it is hidden at desktop width — that is a CSS unit test concern, not a journey concern.
  Do NOT import AxeBuilder — that is already in homepage.spec.ts.
  </action>
  <verify>
    <automated>npx playwright test tests/e2e/journeys.spec.ts --project=chromium</automated>
  </verify>
  <done>All tests in journeys.spec.ts pass on Chromium. Each CTA href assertion returns the exact anchor ID. Each section scrolls into viewport. Sticky CTA DOM test passes. Sticky CTA mobile visibility test passes.</done>
</task>

<task type="auto">
  <name>Task 2: Write accessibility.spec.ts — Tab navigation, skip link, focus-visible</name>
  <files>tests/e2e/accessibility.spec.ts</files>
  <action>
Create tests/e2e/accessibility.spec.ts with two describe blocks. Import only from @playwright/test (no AxeBuilder — axe-core scan stays in homepage.spec.ts per D-03).

Describe block 1 — "Keyboard navigation" (per D-03):
  Test "Tab key moves focus through at least 3 interactive elements in logical order":
    page.goto("./"),
    focus the document: await page.locator("body").press("Tab"),
    collect focused elements by pressing Tab 5 more times, recording tagName and href each time:
      const focused: string[] = [];
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab");
        const el = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? `${el.tagName}:${el.getAttribute("href") ?? el.textContent?.trim().slice(0,20)}` : "none";
        });
        focused.push(el);
      }
    Assert focused.length >= 3 and that at least 2 entries are anchor ("A:") elements.
    Assert no entry is "none" (focus is always on a real element, not lost to body).

  Test "skip link is the first focusable element":
    page.goto("./"),
    await page.locator("body").press("Tab"),
    const firstFocused = await page.evaluate(() => document.activeElement?.className ?? ""),
    expect(firstFocused).toContain("skip-link").

Describe block 2 — "Skip link functionality" (per D-03):
  Test "skip link is present with href='#main' and correct text":
    page.goto("./"),
    const skipLink = page.locator("a.skip-link"),
    await expect(skipLink).toHaveAttribute("href", "#main"),
    await expect(skipLink).toHaveText("Pular para o conteúdo").

  Test "activating skip link moves focus to #main":
    page.goto("./"),
    await page.locator("body").press("Tab"),   -- focus skip link
    await page.keyboard.press("Enter"),
    const focused = await page.evaluate(() => document.activeElement?.id ?? ""),
    expect(focused).toBe("main").
    Note: For Enter on a skip link to move focus, main#main must accept focus. If the test fails
    because main is not focusable, add tabindex="-1" to main in src/pages/index.astro and
    re-run. Document the change in the SUMMARY.

Describe block 3 — "Focus-visible" (per D-03):
  Test "focused interactive element has a visible CSS outline (not outline:none)":
    page.goto("./"),
    await page.locator("body").press("Tab"),   -- move focus to skip link
    await page.keyboard.press("Tab"),           -- move to next interactive element (NavBar brand link)
    const outlineStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return "none";
      return window.getComputedStyle(el).outlineStyle;
    }),
    expect(outlineStyle).not.toBe("none"),
    expect(outlineStyle).not.toBe(""),
    Note: if the outline is provided by :focus-visible and the browser in headless mode does not
    trigger it without keyboard interaction, this test should work because we arrived via Tab press.
    If it fails due to headless quirks, add the aria remark in the SUMMARY but do NOT remove the
    test.
  </action>
  <verify>
    <automated>npx playwright test tests/e2e/accessibility.spec.ts --project=chromium</automated>
  </verify>
  <done>All tests in accessibility.spec.ts pass on Chromium. Skip link is confirmed as first Tab stop. Focus moves to #main on Enter. At least one focused element has a non-none outline style. Tab loop captures at least 3 anchor elements.</done>
</task>

<task type="auto">
  <name>Task 3: Update test.yml — split e2e job into blocking Chromium + informational cross-browser</name>
  <files>.github/workflows/test.yml</files>
  <action>
Replace the existing single `e2e` job in .github/workflows/test.yml with two jobs: `e2e-chromium` and `e2e-cross-browser`. Both depend on `unit-and-integration`. Triggers (push/pull_request on main) are already present — do NOT change them.

The existing `e2e` job steps are the reference; replicate setup steps in both new jobs.

Job `e2e-chromium` (blocking, per D-02 and D-04):
  runs-on: ubuntu-latest
  needs: unit-and-integration
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: "22", cache: "npm" }
    - run: npm ci
    - run: npx playwright install chromium --with-deps
    - run: npm run build
    - name: E2E tests — Chromium (blocking)
      run: npx playwright test --project=chromium
      env: { CI: true }
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report-chromium
        path: playwright-report/

Job `e2e-cross-browser` (informational, per D-02):
  runs-on: ubuntu-latest
  needs: unit-and-integration
  continue-on-error: true
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: "22", cache: "npm" }
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run build
    - name: E2E tests — Firefox, WebKit, mobile (informational)
      run: npx playwright test --project=firefox --project=webkit --project=mobile
      env: { CI: true }
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report-cross-browser
        path: playwright-report/

Remove the original `e2e` job entirely. The `lighthouse` job depends on `unit-and-integration` and must NOT be changed.

Key invariants:
- `continue-on-error: true` is on the JOB level, not the step level.
- `--project=chromium` uses the exact project name from playwright.config.ts (lowercase).
- Install step for Chromium job: `npx playwright install chromium --with-deps` (only Chromium binary, faster CI).
- Install step for cross-browser job: `npx playwright install --with-deps` (all browsers).
  </action>
  <verify>
    <automated>npx js-yaml .github/workflows/test.yml > /dev/null 2>&1 && echo "YAML valid" || echo "YAML invalid"</automated>
  </verify>
  <done>test.yml has no `e2e` job. It has `e2e-chromium` (no continue-on-error) and `e2e-cross-browser` (continue-on-error: true). Both need unit-and-integration. Chromium job uses --project=chromium flag. Cross-browser job uses --project=firefox --project=webkit --project=mobile. YAML parses without errors.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| test runner → browser sandbox | Playwright controls a headless browser; malicious page scripts cannot escape the sandbox |
| CI runner → npm registry | npm ci uses lockfile; supply-chain attack surface is the same as all other jobs |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | Tampering | test.yml — continue-on-error mis-placement | mitigate | Place continue-on-error at job level not step level; YAML key position is verified by CI lint |
| T-02-02 | Denial of Service | cross-browser job consuming runner minutes on every PR | accept | Non-blocking job; runner cost is low for a static site; no PII or secrets involved |
| T-02-03 | Information Disclosure | playwright-report artifacts contain rendered page HTML | accept | No credentials or PII in landing page DOM; artifacts are scoped to the repo |
| T-02-04 | Spoofing | skip link focus test passes because tabindex is added silently | mitigate | Task 2 action explicitly requires documenting any tabindex change in SUMMARY |
</threat_model>

<verification>
Run these commands after all three tasks complete:

1. Journey tests pass on Chromium:
   npx playwright test tests/e2e/journeys.spec.ts --project=chromium

2. Accessibility tests pass on Chromium:
   npx playwright test tests/e2e/accessibility.spec.ts --project=chromium

3. Full Chromium suite (including Phase 1 homepage.spec.ts) still green:
   npx playwright test --project=chromium

4. YAML is valid:
   npx js-yaml .github/workflows/test.yml

5. test.yml structural checks:
   grep "e2e-chromium" .github/workflows/test.yml
   grep "e2e-cross-browser" .github/workflows/test.yml
   grep "continue-on-error" .github/workflows/test.yml
   grep -- "--project=chromium" .github/workflows/test.yml
   grep -- "--project=firefox" .github/workflows/test.yml

6. No regression in existing test files:
   npx playwright test --project=chromium
</verification>

<success_criteria>
- tests/e2e/journeys.spec.ts exists, all tests pass on --project=chromium
- tests/e2e/accessibility.spec.ts exists, all tests pass on --project=chromium
- .github/workflows/test.yml: e2e job replaced by e2e-chromium (blocking) and e2e-cross-browser (continue-on-error: true)
- npx playwright test --project=chromium (all three spec files) exits 0
- YAML parses without errors
- homepage.spec.ts is unmodified and still passes
</success_criteria>

<source_audit>
## Multi-Source Coverage Audit

| Source | Item | Covered by | Status |
|--------|------|------------|--------|
| GOAL | Critical user journeys (CTA + anchor scrolling + sticky CTA) | Task 1 — journeys.spec.ts | COVERED |
| GOAL | Multi-browser validation (Chromium blocking, others informational) | Task 3 — test.yml split | COVERED |
| GOAL | Keyboard accessibility (Tab nav + skip link + focus-visible) | Task 2 — accessibility.spec.ts | COVERED |
| GOAL | CI runs on every push to main and every PR | Task 3 — triggers already present, jobs restructured | COVERED |
| REQ | e2e-journeys | Task 1 | COVERED |
| REQ | e2e-accessibility | Task 2 | COVERED |
| REQ | e2e-multi-browser | Task 3 | COVERED |
| REQ | e2e-ci-every-push | Task 3 | COVERED |
| CONTEXT | D-01 — CTA clicks, anchor scrolling, sticky CTA, page.goto("./") pattern | Task 1 | COVERED |
| CONTEXT | D-02 — Chromium blocking, Firefox/WebKit/mobile continue-on-error, 4 projects stay | Task 3 | COVERED |
| CONTEXT | D-03 — Tab nav, skip link a.skip-link / a[href="#main"], focus-visible, keep axe-core in homepage.spec.ts | Task 2 | COVERED |
| CONTEXT | D-04 — push main + PR trigger, Chromium blocking job, cross-browser parallel informational | Task 3 | COVERED |
| DEFERRED | Form submission testing | — | EXCLUDED (no form on page) |
| DEFERRED | Search functionality | — | EXCLUDED (not implemented) |
| DEFERRED | Screen reader ARIA assertions | — | EXCLUDED (Phase 4) |
</source_audit>

<output>
After all tasks complete and verification passes, create:
  .planning/phases/02-e2e-testing-week-3-4/02-01-SUMMARY.md

The SUMMARY must include:
- Which tests were created and how many assertions each has
- Whether tabindex="-1" was added to main#main (and why, if so)
- Any flakiness observed during local test runs and the workaround applied
- Final CI job structure (job names, blocking vs informational)
- Artifacts uploaded per job
</output>
