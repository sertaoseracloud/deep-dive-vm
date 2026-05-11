---
phase: 03-seo-optimization-week-4-5
reviewed: 2026-05-11T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - .lighthouserc.json
  - astro.config.mjs
  - tests/seo/seo-meta.test.ts
  - vitest.config.ts
  - src/components/sections/Hero.astro
  - src/components/sections/Mentor.astro
  - src/layouts/Layout.astro
findings:
  critical: 0
  warning: 0
  info: 2
  total: 11
  fixed:
    critical: 4
    warning: 5
status: fixed
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-11T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

The SEO optimization phase delivers structured-data markup, Open Graph tags, Twitter cards, a sitemap integration, a canonical tag, and a static SEO test suite. The implementation is broadly sound in intent, but contains four critical defects: the `og:image` value is a relative asset path that Open Graph scrapers cannot resolve; the `site` URL in `astro.config.mjs` does not match the live domain, corrupting sitemap and canonical output; the test suite hard-crashes instead of producing clean Vitest failures whenever an assertion fails (due to the `!` non-null assertion pattern after a non-throwing `expect().not.toBeNull()`); and the JSON-LD `AggregateRating` block contains fabricated review counts and scores that violate Google Search's structured-data quality guidelines. Five additional warnings cover the optional `description` prop producing `undefined` content values, decorative SVGs missing `aria-hidden`, a bare `JSON.parse` in the test that throws uncaught `SyntaxError`, the offers URL domain mismatch in structured data, and the missing `globalSetup` path validation. Two informational items cover leftover inline comments and `.lighthouserc.json` scope.

---

## Critical Issues

### CR-01: `og:image` emits a relative path — Open Graph scrapers will not resolve it

**File:** `src/layouts/Layout.astro:25`
**Issue:** `claudio1.src` is the Vite/Astro processed asset path (e.g., `/_astro/claudio1.BcD3k9Xf.png`). Open Graph scrapers (Facebook, LinkedIn, Slack, WhatsApp) require an **absolute URL** for `og:image`. A relative path will produce a broken preview image on every share. Twitter cards have the same defect via `twitter:image` at line 50.

**Fix:**
```astro
---
// Layout.astro — build the absolute OG image URL from the configured site
import { SEO } from "astro-seo";
import claudio1 from "../assets/claudio1.png";

const siteOrigin = "https://mentoria.sertaoseracloud.com"; // single source of truth
const ogImageUrl = `${siteOrigin}/deep-dive-vm${claudio1.src}`;
---

<SEO
  ...
  openGraph={{
    basic: {
      title: title,
      type: "website",
      image: ogImageUrl,   // absolute URL
    },
    ...
  }}
  extend={{
    meta: [
      { name: "twitter:image", content: ogImageUrl },
      ...
    ],
  }}
/>
```

---

### CR-02: `site` in `astro.config.mjs` points to the wrong domain — sitemap and canonical URLs are broken

**File:** `astro.config.mjs:5`
**Issue:** `site` is set to `https://sertaoseracloud.github.io`. The live production URL (seen in `package.json` line 18 and the JSON-LD `offers.url`) is `https://mentoria.sertaoseracloud.com`. The `@astrojs/sitemap` integration derives every URL it emits from the `site` field. All sitemap entries and any `Astro.site`-derived canonical references will contain the wrong origin, giving search engines an incorrect URL to index.

**Fix:**
```js
// astro.config.mjs
export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  base: '/deep-dive-vm',
  outDir: 'dist',
  integrations: [sitemap()],
});
```

---

### CR-03: Non-null assertions (`!`) after non-throwing `expect().not.toBeNull()` — test crashes instead of failing cleanly

**File:** `tests/seo/seo-meta.test.ts:67,72,73,79,83,93,103,115`
**Issue:** Throughout the test file the pattern is:
```ts
expect(value).not.toBeNull();   // does NOT throw on failure in Vitest
expect(value!.length)...        // throws TypeError: Cannot read properties of null
```
In Vitest, `expect(null).not.toBeNull()` **records** a failure but does **not** throw — execution continues. The `!` operator on the next line then causes a raw `TypeError` which crashes the test with a confusing stack trace instead of a descriptive assertion message. This makes CI failures extremely hard to diagnose.

**Fix:** Use early-return helpers or `if`-guards:
```ts
// Option A — guard with explicit early return
it("1. <title> tag is present and <= 60 characters", () => {
  const title = extractTitle(html);
  if (title === null) {
    throw new Error("<title> tag not found in dist/index.html");
  }
  expect(title.length).toBeLessThanOrEqual(60);
});

// Option B — assert truthiness (Vitest throws on this form)
expect(title, "<title> tag must be present").toBeTruthy();
expect(title!.length).toBeLessThanOrEqual(60);
// Note: toBeTruthy() DOES throw, so ! is safe after it.
```
All eight sites with the pattern (lines 67, 72, 73, 79, 83, 93, 103, 115) must be fixed.

---

### CR-04: JSON-LD `AggregateRating` contains fabricated data — violates Google structured-data policy

**File:** `src/layouts/Layout.astro:104-107`
**Issue:**
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "5.0",
  "reviewCount": "127"
}
```
The course appears to be newly launched. A hardcoded perfect score of 5.0 from 127 reviews that are not verifiable on the page violates Google's [structured data quality guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#review-guidelines), which prohibit self-serving ratings not sourced from genuine user reviews displayed on the page. Violations result in manual actions (rich result removal) and can escalate to site-level penalties.

**Fix:** Remove the `aggregateRating` block entirely until real reviews are collected and displayed on the page with matching markup. If testimonials are present, each should be individually marked up as a `Review` entity and the aggregate computed from them.
```json
// Remove these lines from the JSON-LD block:
// "aggregateRating": {
//   "@type": "AggregateRating",
//   "ratingValue": "5.0",
//   "reviewCount": "127"
// },
```

---

## Warnings

### WR-01: Optional `description` prop emits `undefined` into meta content attributes

**File:** `src/layouts/Layout.astro:7,52,53`
**Issue:** `description` is typed as `description?: string`. When not provided, it is `undefined`. The `astro-seo` component receives `description={undefined}` and the `extend.meta` array receives:
```ts
{ name: "twitter:description", content: undefined }
{ name: "og:description", content: undefined }  // via optional.description
```
Astro will render `content=""` or omit the attribute inconsistently depending on the library version. The SEO test (test 2 and 4) will fail or the tags will be present with empty values. Currently `index.astro` always passes a description, but any future page that omits it will silently produce malformed meta tags.

**Fix:**
```astro
---
// Provide a fallback so content is never undefined
const resolvedDescription = description ?? "Formação técnica focada em Azure VMs com Microsoft MVP.";
---
<SEO description={resolvedDescription} ... />
```

---

### WR-02: Decorative inline SVGs in Hero lack `aria-hidden="true"`

**File:** `src/components/sections/Hero.astro:32-43,50-61,69-80,88-99,111-124,128-138,143-153,157-168,171-183,186-198`
**Issue:** Every icon SVG in the hero (checkmarks, clock, grid, star, arrow, etc.) lacks `aria-hidden="true"`. Screen readers announce these as unlabelled images or attempt to traverse empty `<polyline>`/`<path>` elements, degrading the reading experience for assistive-technology users. This also directly impacts the Lighthouse accessibility score that the `.lighthouserc.json` gate enforces (threshold: 0.9).

**Fix:** Add `aria-hidden="true"` to every decorative SVG:
```astro
<svg
  aria-hidden="true"
  width="18"
  height="18"
  viewBox="0 0 24 24"
  ...
>
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>
```

---

### WR-03: Bare `JSON.parse` in SEO test throws `SyntaxError` instead of a Vitest assertion failure

**File:** `tests/seo/seo-meta.test.ts:137`
**Issue:**
```ts
const parsed = JSON.parse(match![1]);
```
If the embedded JSON-LD block is malformed (unclosed brace, trailing comma, etc.), `JSON.parse` throws a raw `SyntaxError`. Vitest will catch it and mark the test as an error (not a failure), but the diagnostic is "SyntaxError: Unexpected token" rather than a clear message about what is wrong with the SEO markup. The `match![1]` non-null assertion also carries the same unsafe pattern described in CR-03.

**Fix:**
```ts
it("11. JSON-LD ...", () => {
  const match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  expect(match, "JSON-LD script block must be present").toBeTruthy();

  let parsed: unknown;
  try {
    parsed = JSON.parse(match![1]);
  } catch (e) {
    throw new Error(`JSON-LD is not valid JSON: ${(e as Error).message}`);
  }
  expect((parsed as Record<string, unknown>)["@context"]).toBeTruthy();
  expect((parsed as Record<string, unknown>)["@type"]).toBeTruthy();
});
```

---

### WR-04: JSON-LD `offers.url` domain conflicts with `astro.config.mjs site` and canonical

**File:** `src/layouts/Layout.astro:102`
**Issue:**
```json
"offers": {
  "url": "https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento"
}
```
The `astro.config.mjs` `site` is `https://sertaoseracloud.github.io` (see CR-02), the canonical tag points to `Astro.url.href` or the passed `url` prop, and the offers URL points to `mentoria.sertaoseracloud.com`. Three different domains appear in the same document's structured data. Search engines use `offers.url` as the definitive purchase URL; if it doesn't match the canonical, the rich result may be suppressed.

**Fix:** After fixing CR-02 (set `site` to `mentoria.sertaoseracloud.com`), make the offers URL use the same base:
```ts
// Derive dynamically rather than hardcoding
const offersUrl = `${siteOrigin}/deep-dive-vm#investimento`;
```
And inject it into the JSON-LD via a `<script>` generated in the Astro template rather than a static `is:inline` block, so all URLs share a single source of truth.

---

### WR-05: `vitest.config.ts` — SEO tests run in `happy-dom` environment but parse filesystem paths

**File:** `vitest.config.ts:4,8`
**Issue:** `environment: "happy-dom"` is set globally. The SEO test suite (`tests/seo/seo-meta.test.ts`) does not use the DOM at all — it reads the built `dist/index.html` from disk using `node:fs` and does regex parsing. Running it in `happy-dom` is harmless in isolation, but it means `globalSetup` (which runs in the raw Node environment) and the test files share different globals. More concretely, `happy-dom` polyfills `fetch`, `document`, etc. unnecessarily, and any future SEO test that inadvertently uses `document` will silently test against `happy-dom`'s DOM instead of the built HTML, producing false positives.

**Fix:** Use Vitest's per-project environment override for the SEO suite:
```ts
// vitest.config.ts
{
  test: {
    projects: [
      {
        test: {
          include: ["tests/seo/**/*.test.ts"],
          environment: "node",  // SEO tests only need Node fs
        },
      },
      {
        test: {
          include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
          environment: "happy-dom",
        },
      },
    ],
  },
}
```

---

## Info

### IN-01: `.lighthouserc.json` has no URL filter — will audit all pages in `dist/`

**File:** `.lighthouserc.json:4`
**Issue:** `collect.staticDistDir` causes LHCI to discover and audit every HTML file in `dist/`. If a 404 page, a redirect stub, or a temporary page is present at build time, it will be included in the audit and its score averaged. The `categories:performance` error threshold of 0.8 could be tripped by an auxiliary page that is not the landing page.

**Fix:** Pin the URLs explicitly if the site is single-page:
```json
"collect": {
  "staticDistDir": "./dist",
  "url": ["/deep-dive-vm/index.html"],
  "numberOfRuns": 3
}
```

---

### IN-02: Leftover inline comment in `index.astro`

**File:** `src/pages/index.astro:22-23`
**Issue:** The Astro scaffold comment ("Welcome to Astro! Wondering what to do next?...") was left in the production page source. It is harmless but is surfaced in the built HTML and visible to anyone viewing source.

**Fix:** Remove lines 22–23:
```astro
// Delete:
// Welcome to Astro! Wondering what to do next? Check out the Astro documentation at https://docs.astro.build
// Don't want to use any of this? Delete everything in this file, the `assets`, `components`, and `layouts` directories, and start fresh.
```

---

_Reviewed: 2026-05-11T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
