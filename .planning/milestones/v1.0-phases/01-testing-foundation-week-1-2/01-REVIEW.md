---
phase: "01"
plan: "01"
status: "issues_found"
depth: standard
files_reviewed: 20
files_reviewed_list:
  - vitest.config.ts
  - .lighthouserc.json
  - .github/workflows/test.yml
  - playwright.config.ts
  - package.json
  - src/layouts/Layout.astro
  - tests/e2e/homepage.spec.ts
  - tests/seo/seo-meta.test.ts
  - tests/unit/components/Button.test.ts
  - tests/unit/components/SectionHead.test.ts
  - tests/unit/components/Layout.test.ts
  - tests/unit/components/NavBar.test.ts
  - tests/unit/components/Footer.test.ts
  - tests/unit/components/UrgencyBar.test.ts
  - tests/unit/components/StickyCta.test.ts
  - tests/unit/components/Hero.test.ts
  - tests/unit/components/Pricing.test.ts
  - tests/unit/components/Faq.test.ts
  - tests/integration/content-collections.test.ts
  - tests/integration/route-generation.test.ts
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
date: 2026-05-11
---

# Phase 01: Code Review Report (Re-review Pass)

**Reviewed:** 2026-05-11T00:00:00Z
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

This is a re-review pass following the fixes applied to the 4 Critical and 7 Warning findings from the first review. All 11 prior findings are confirmed fixed:

- CR-01: Canonical URL is now correctly `url ?? Astro.url.href` in `Layout.astro:42`
- CR-02: `npm audit` is now blocking (no `continue-on-error`)
- CR-03: `@playwright/test` and `playwright` are now in `devDependencies`
- CR-04: SEO tests now run in the `lighthouse` job after `npm run build`
- WR-01: `webServer.url` now includes the base path with trailing slash
- WR-02: Deprecated `rel="prev"`, `rel="next"`, `rel="alternate"` links removed
- WR-03: `<main>` E2E assertion now uses `toBeVisible()` directly
- WR-04: SEO test 10 now guards against zero `<img>` tags
- WR-05: Integration fixture paths are anchored to `import.meta.url`
- WR-06: Footer copyright regex updated (see WR-03 below for residual issue)
- WR-07: `numberOfRuns` is now 3 in `.lighthouserc.json`

However, the rewrite introducing build-based unit tests has introduced new defects. Two blockers were found: the coverage threshold gate that CI claims to enforce does not exist in configuration, and the `execSync("npm run build")` guard in every unit test `beforeAll` will trigger concurrent builds in the CI `unit-and-integration` job (which has no build step), corrupting `dist/` and producing non-deterministic test failures. Four warnings and three info items were also found.

---

## Critical Issues

### CR-01: Coverage threshold gate is declared in CI but not configured in Vitest

**File:** `vitest.config.ts:13-22` / `.github/workflows/test.yml:19`
**Issue:** The CI step is named `"Unit tests (coverage gate >= 80%)"` and the `test:unit` script runs with `--coverage`, but `vitest.config.ts` defines no `coverage.thresholds` block. Vitest will report coverage numbers and always exit 0 regardless of the actual percentage. The 80% gate is a label on the CI step, not an enforced constraint. A PR that drops coverage to 0% will pass CI.
**Fix:**
```ts
// vitest.config.ts
coverage: {
  provider: "v8",
  include: ["src/**"],
  exclude: [
    "src/assets/**",
    "src/pages/**",
    "src/**/*.astro",
  ],
  reporter: ["text", "json", "html"],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
},
```

---

### CR-02: Concurrent `execSync("npm run build")` calls across unit test files will corrupt `dist/`

**File:** `tests/unit/components/Button.test.ts:14-16` (and identical pattern in all 9 other unit test files)
**Issue:** Every unit test file contains this `beforeAll` guard:
```ts
if (!existsSync(join(PROJECT_ROOT, "dist/index.html"))) {
  execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
}
```
In the CI `unit-and-integration` job, `npm run build` is never run before tests. Vitest runs test files in parallel by default (multiple worker threads). All 10 unit test files will simultaneously evaluate the `!existsSync` check — all find `dist/index.html` absent — and all will independently invoke `execSync("npm run build")`. This means up to 10 concurrent `astro build` processes write to the same `dist/` directory simultaneously. The result is non-deterministic: files may be partially written, overwritten mid-stream, or corrupted. Even if only one build "wins," `astro build` clears `dist/` at the start of each run, so concurrent builds will delete each other's output.

Additionally, `execSync` is synchronous but Vitest worker threads are independent OS processes; the `existsSync` check is not atomic, creating a TOCTOU race.

**Fix:** Add an explicit build step to the CI `unit-and-integration` job before the test commands:
```yaml
- run: npm run build
- name: Unit tests (coverage gate >= 80%)
  run: npm run test:unit
- name: Integration tests
  run: npm run test:integration
```
Then remove the `execSync` build guard from all unit test `beforeAll` hooks (keep only the `existsSync` + `readFileSync`). The build step in CI ensures `dist/` is populated before any parallel test workers start. For local development, document in README that `npm run build` must be run once before `npm run test:unit`.

---

## Warnings

### WR-01: `npm audit --omit=dev` silently ignores vulnerabilities in all devDependencies

**File:** `.github/workflows/test.yml:24`
**Issue:** The audit command is `npm audit --audit-level=high --omit=dev`. The `--omit=dev` flag removes all devDependencies from the audit scope. This means vulnerabilities in `vitest`, `@playwright/test`, `happy-dom`, `@lhci/cli`, and every other test tool are not reported and do not fail CI. Since these tools run arbitrary code during CI (executing test processes, spawning browsers), a compromised dev dependency is a CI supply-chain risk.
**Impact:** The audit gate provides false assurance — the scope that contains the most actively exploitable tooling (test runners, browser automation) is silently excluded.
**Fix:** Run `npm audit --audit-level=high` without `--omit=dev`. If specific dev dependencies have known unfixable advisories, use an `.nswrc` allowlist or `npm audit --omit=dev` only as a secondary fallback with explicit documentation explaining what is excluded and why.

---

### WR-02: `seo-meta.test.ts` uses CWD-relative `resolve()` for `dist/index.html`

**File:** `tests/seo/seo-meta.test.ts:16`
**Issue:** `const DIST_INDEX = resolve("dist/index.html")` uses `node:path`'s `resolve` with a relative string, which anchors to `process.cwd()`. The integration tests (WR-05 from the prior review) were correctly fixed to use `import.meta.url` anchoring, but the same pattern was not applied to the SEO test file. In CI the cwd is the checkout root so this works, but running the test from an IDE or a different working directory silently resolves to the wrong path and throws the "dist/index.html not found" error.
**Fix:**
```ts
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_INDEX = join(__dirname, "../../dist/index.html");
```

---

### WR-03: Footer copyright regex `/© 202[0-9]/` breaks in 2030

**File:** `tests/unit/components/Footer.test.ts:35`
**Issue:** The prior review (WR-06) flagged the year literal `2026`. The fix changed it to `/© 202[0-9]/`, which matches years 2020–2029 only. This test will produce a false negative starting January 1, 2030 if the footer's copyright year is updated to 2030 (or any year in the 2030s). The suggested fix from the prior review was to use `new Date().getFullYear()` dynamically.
**Fix:**
```ts
it("contains copyright year in footer disclaimer", () => {
  const year = new Date().getFullYear().toString();
  expect(builtHtml).toMatch(new RegExp(`© ${year}`));
});
```

---

### WR-04: Lighthouse job has no artifact upload for LHCI reports

**File:** `.github/workflows/test.yml:53-68`
**Issue:** The `lighthouse` job runs LHCI with `target: temporary-public-storage`, which uploads to a public ephemeral URL (valid for ~7 days). However, the job has no `actions/upload-artifact` step to persist the report in the workflow run. When the LHCI `target` link expires, there is no retrievable record of what the scores were at that commit. The `e2e` job correctly persists its `playwright-report/` as a named artifact. The lighthouse job should do the same.
**Fix:**
```yaml
- name: Lighthouse CI (SEO >= 90)
  run: npx lhci autorun
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: lhci-report
    path: .lighthouseci/
```

---

## Info

### IN-01: `jsdom` is listed in `devDependencies` but is no longer used

**File:** `package.json:43`
**Issue:** `vitest.config.ts` switched the test environment from `jsdom` to `happy-dom`. The `jsdom` package (`^25.0.1`) remains in `devDependencies`. It is not referenced anywhere in the test configuration or test files. This is dead dependency weight that increases install time and the npm audit surface.
**Fix:** Remove `"jsdom": "^25.0.1"` from `devDependencies` and run `npm install` to update the lockfile.

---

### IN-02: `vitest.config.ts` comment says `.astro` files "are not instrumentable with v8" but the exclusion also silently covers TypeScript source in `.astro` files that could have unit-testable logic

**File:** `vitest.config.ts:19`
**Issue:** The exclusion comment is accurate but incomplete. Some `.astro` component files may contain significant TypeScript logic in the frontmatter block that could and should be extracted into `.ts` utility modules and unit tested. As-is, the blanket exclusion of `src/**/*.astro` means any logic growth inside Astro components is silently excluded from coverage without a signal to the developer. This is a documentation/discoverability gap.
**Fix:** Add a note in the comment:
```ts
"src/**/*.astro", // Astro components are not instrumentable with v8 — complex
                  // logic should be extracted to .ts utilities and unit tested separately
```

---

### IN-03: Unit test files all share identical `beforeAll` boilerplate with no shared abstraction

**File:** All 10 files in `tests/unit/components/`
**Issue:** The same 10-line `beforeAll` block (import, `__dirname`, `PROJECT_ROOT`, `existsSync`, `execSync`, `readFileSync`) is copy-pasted identically into every unit test file. If the build guard logic needs to change (e.g., to fix CR-02), all 10 files must be updated individually. This violates DRY and increases the chance of inconsistent updates.
**Fix:** Extract the shared setup into a Vitest setup file or a shared helper:
```ts
// tests/unit/setup/built-html.ts
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = join(__dirname, "../../..");
export function getBuiltHtml(): string {
  const p = join(PROJECT_ROOT, "dist/index.html");
  if (!existsSync(p)) throw new Error(`dist/index.html not found. Run 'npm run build' first.`);
  return readFileSync(p, "utf-8");
}
```
Each test file then calls `getBuiltHtml()` in `beforeAll`. A single change fixes all files.

---

_Reviewed: 2026-05-11T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
