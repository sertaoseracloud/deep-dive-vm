# Phase 3: SEO Optimization - Research

**Researched:** 2026-05-11
**Domain:** Astro image optimization, LHCI configuration, non-blocking font loading, static SEO test patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01** — Add `categories:performance: ["error", { "minScore": 0.8 }]` to `.lighthouserc.json`. Gate is blocking (error). Current file has no `categories:performance` entry.
- **D-02** — Promote `categories:accessibility` from `"warn"` to `"error"` at `minScore: 0.9`. No threshold change.
- **D-03** — Astro `<Image>` component from `astro:assets` for all 3 PNG images (claudio1, claudio2, marcelo). Auto-converts to WebP, generates width/height, zero new deps.
- **D-04** — `claudio1` (Hero) → `loading="eager"` + `fetchpriority="high"`. `claudio2` + `marcelo` → `loading="lazy"`.
- **D-05** — Convert render-blocking Google Fonts `<link rel="stylesheet">` to `<link rel="preload" as="style">` + `onload` swap + `<noscript>` fallback. No self-hosting, no new npm packages.
- **D-06** — Add 3 new SEO test assertions to `tests/seo/seo-meta.test.ts`: JSON-LD schema validation, heading hierarchy, sitemap presence.
- **D-07** — Add `@astrojs/sitemap` integration to `astro.config.mjs`. `site` is already set. No `customPages` needed.

### Claude's Discretion

None specified — all areas are locked decisions.

### Deferred Ideas (OUT OF SCOPE)

- Core Web Vitals raw metric thresholds (LCP ≤ 2500ms, CLS ≤ 0.1) — category score gate chosen instead.
- Self-hosting fonts via fontsource — preload approach is sufficient.
- FAQ JSON-LD schema expansion — deferred to Phase 4.
- Person schema for mentor — deferred to Phase 4.
</user_constraints>

---

## Summary

Phase 3 makes five discrete changes to the single-page Astro landing page: two CI gate promotions in `.lighthouserc.json`, three image migrations from raw `<img>` to the built-in `<Image>` component, a font-loading strategy change in `Layout.astro`, a new `@astrojs/sitemap` integration in `astro.config.mjs`, and three new static assertions appended to `tests/seo/seo-meta.test.ts`. All changes are surgical — no new pages, no new routes, no new npm runtime dependencies except `@astrojs/sitemap` (devDependency-level, bundled at build time).

The current codebase is in excellent shape for this phase: the JSON-LD schema is already in `Layout.astro`, the H1 tag is confirmed present (existing test 8), the `site` config is already set in `astro.config.mjs`, and all three PNG imports are already written. The implementation work is primarily search-and-replace pattern work with one new integration install.

TDD mode is enabled (`tdd: true` in config.json). For D-06, the three new assertions must be written first as failing tests, then the implementations (JSON-LD already present, heading hierarchy already correct, sitemap requires D-07 build) are confirmed to make them pass.

**Primary recommendation:** Implement in wave order — CI gates first (no build needed), then `@astrojs/sitemap` + new test assertions together (RED phase), then image migrations + font fix (GREEN phase), then verify Lighthouse gate is satisfied.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Image optimization (WebP, CLS prevention) | Frontend Server (SSR/SSG) | — | Astro processes images at build time; browser receives already-optimized files |
| LCP priority signal (fetchpriority) | Browser / Client | Frontend Server (SSG) | `fetchpriority="high"` is a browser hint emitted in the static HTML by Astro at build |
| Font loading (non-blocking) | Browser / Client | — | `rel="preload"` + onload pattern is pure HTML/JS browser behavior; no server logic |
| Sitemap generation | Frontend Server (SSG) | CDN / Static | `@astrojs/sitemap` runs at build time; output is a static XML file served directly |
| CI gate configuration | — (CI layer) | — | `.lighthouserc.json` is consumed by LHCI runner, not part of Astro tier |
| SEO static assertions | — (Test layer) | — | Vitest reads `dist/index.html` post-build; pure test infrastructure |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 6.3.1 (installed) | SSG framework + `astro:assets` Image component | Built-in, zero new deps; `<Image>` auto-WebP |
| `@astrojs/sitemap` | 3.7.2 (registry) | Sitemap XML generation at build | Official Astro integration; reads `site` config automatically |
| `@lhci/cli` | 0.14.0 (installed) | Lighthouse CI runner consuming `.lighthouserc.json` | Already in devDependencies; no change |
| `vitest` | 3.2.4 (installed) | Test runner for SEO static assertions | Already used in project; `tests/seo/` run via `npx vitest run tests/seo` in CI |

[VERIFIED: npm registry — @astrojs/sitemap 3.7.2, astro 6.3.1]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:fs` (built-in) | — | `existsSync` for sitemap file presence test | Already used in `tests/seo/seo-meta.test.ts` |
| `node:path` | — | `join` for constructing `dist/sitemap-index.xml` path | Already used |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@astrojs/sitemap` | hand-rolled sitemap template | Locked decision D-07 — not applicable |
| `astro:assets <Image>` | `<Picture>` component | `<Picture>` generates `<picture>` with `<source>` elements; `<Image>` is simpler and sufficient for single-format WebP output |
| preload + onload font pattern | fontsource npm package | Locked decision D-05 — fontsource deferred |

**Installation (only new package):**
```bash
npx astro add sitemap
# OR manually:
npm install @astrojs/sitemap
```

`npx astro add sitemap` is preferred — it also patches `astro.config.mjs` automatically. If using manual install, the config patch must be done by hand.

[VERIFIED: docs.astro.build/en/guides/integrations-guide/sitemap/]

---

## Architecture Patterns

### System Architecture Diagram

```
Build time (npm run build)
  index.astro
    └── Layout.astro
          ├── <head>
          │     ├── astro-seo (OG, Twitter, canonical) — unchanged
          │     ├── JSON-LD <script> — already present, assertion validates it
          │     ├── Google Fonts: rel="preload" as="style" + onload  ← D-05 change
          │     └── <noscript> fallback link                          ← D-05 addition
          └── <body>
                ├── Hero.astro
                │     └── <Image src={claudio1} loading="eager" fetchpriority="high" />  ← D-03/D-04
                ├── Mentor.astro
                │     ├── <Image src={claudio2} loading="lazy" />    ← D-03/D-04
                │     └── <Image src={marcelo}  loading="lazy" />    ← D-03/D-04
                └── Testimonials.astro — no images (text/avatar only, confirmed)

  @astrojs/sitemap (integration)  ← D-07
    └── reads site + base config
    └── emits dist/sitemap-index.xml + dist/sitemap-0.xml

dist/
  index.html  (target of SEO static assertions)
  sitemap-index.xml  (asserted by D-06 test 3)
  sitemap-0.xml
  _astro/
    claudio1.[hash].webp  (Astro-converted from PNG)
    claudio2.[hash].webp
    marcelo.[hash].webp

Test time (npx vitest run tests/seo)
  seo-meta.test.ts
    ├── assertions 1-10 (existing) — no change
    ├── assertion 11: JSON-LD parse + @context/@type  ← D-06 new
    ├── assertion 12: heading hierarchy (no H2 before H1, no skipped levels)  ← D-06 new
    └── assertion 13: existsSync(dist/sitemap-index.xml)  ← D-06 new

CI (lighthouse job in test.yml)
  npm run build
  npx vitest run tests/seo
  npx lhci autorun  (reads .lighthouserc.json)
    ├── categories:seo >= 0.9 [error]   — unchanged
    ├── categories:accessibility >= 0.9 [error]  ← D-02 promoted from warn
    ├── categories:best-practices >= 0.8 [warn]  — unchanged
    └── categories:performance >= 0.8 [error]    ← D-01 new gate
```

### Recommended Project Structure

No structural changes. New file: none. Modified files only.

```
src/
  layouts/Layout.astro         ← D-05: font preload pattern
  components/sections/
    Hero.astro                 ← D-03/D-04: <Image> eager
    Mentor.astro               ← D-03/D-04: <Image> lazy (claudio2 + marcelo)
    Testimonials.astro         ← NO CHANGE (no <img> tags — avatar uses CSS/text)
astro.config.mjs               ← D-07: sitemap integration
.lighthouserc.json             ← D-01/D-02: gate changes
tests/seo/seo-meta.test.ts     ← D-06: 3 new assertions
```

### Pattern 1: Astro `<Image>` Component Usage

**What:** Replace raw `<img src={asset.src}>` with `<Image src={asset} ... />` from `astro:assets`.
**When to use:** Any local image in `src/assets/` — width/height auto-inferred, format auto-converted to WebP.

```astro
---
// Source: docs.astro.build/en/reference/modules/astro-assets/
import { Image } from "astro:assets";
import claudio1 from "../../assets/claudio1.png";
---

<!-- Hero (LCP): eager load + high priority -->
<Image
  src={claudio1}
  alt="Cláudio Filipe Lima Raposo segurando uma chama elétrica azul"
  loading="eager"
  fetchpriority="high"
/>

<!-- Below-fold images: lazy load (default is already lazy, but explicit is better) -->
<Image
  src={claudio2}
  alt="Cláudio Filipe Lima Raposo"
  loading="lazy"
/>
```

**Key facts:**
- `src` must be the imported `ImageMetadata` object, NOT `.src` string. [VERIFIED: docs.astro.build]
- `width` and `height` are auto-inferred from the imported asset. Do NOT specify them manually unless overriding. [VERIFIED: docs.astro.build]
- Output format defaults to WebP. [VERIFIED: docs.astro.build]
- `fetchpriority` is a pass-through HTML attribute accepted by `<Image>`. [VERIFIED: docs.astro.build]
- `loading` accepts standard HTML values: `"eager"` | `"lazy"`. Default is `"lazy"`. [VERIFIED: docs.astro.build]
- `priority` shorthand (no value) sets `loading="eager" decoding="sync" fetchpriority="high"` all at once. [VERIFIED: docs.astro.build] — however, D-04 specifies explicit attributes, not shorthand. Either works.
- The existing CSS `.hero-portrait-wrap img { width: 100%; height: 100%; object-fit: cover; }` still applies to the generated `<img>` element. No CSS changes needed.

**CRITICAL — Hero.astro wrapper structure:** The `<Image>` component renders as an `<img>`. The existing CSS targets `.hero-portrait-wrap img`. This selector will still work. No wrapper `<div>` change needed.

**CRITICAL — Mentor.astro has two images:** `claudio2` AND `marcelo` are both in `Mentor.astro`, not in `Testimonials.astro`. The CONTEXT.md is accurate. Testimonials.astro has been confirmed to have no `<img>` tags — it uses text avatars with CSS gradient backgrounds. [VERIFIED: reading Testimonials.astro source]

### Pattern 2: Non-Blocking Google Fonts

**What:** Replace `<link rel="stylesheet">` with preload + onload + noscript.
**When to use:** Any Google Fonts link that is on the critical render path.

```html
<!-- Source: pagespeedchecklist.com/asynchronous-google-fonts (industry-standard pattern) -->
<!-- REPLACE this: -->
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Chakra+Petch:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>

<!-- WITH this: -->
<link
  rel="preload"
  as="style"
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Chakra+Petch:wght@400;500;600;700&display=swap"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Chakra+Petch:wght@400;500;600;700&display=swap"
  />
</noscript>
```

**Key facts:**
- The two `<link rel="preconnect">` tags that are already in `Layout.astro` remain unchanged and go BEFORE the preload link. [VERIFIED: existing Layout.astro]
- `&display=swap` is already in the URL — no change needed. [VERIFIED: existing Layout.astro]
- `onload="this.onload=null;this.rel='stylesheet'"` — `this.onload=null` prevents infinite loop in some browsers. [CITED: pagespeedchecklist.com/asynchronous-google-fonts]
- Alternative pattern using `media="print"` exists but is not needed here; the preload+onload pattern is the standard Lighthouse-recommended approach. [CITED: web.dev articles]
- FOUT (Flash of Unstyled Text) is managed by `&display=swap` already in the URL.
- In Astro `.astro` files, `onload` in HTML attributes works with `is:inline` — no special Astro handling needed for this pattern in `<head>`. [ASSUMED — standard Astro HTML head passthrough]

### Pattern 3: @astrojs/sitemap Integration

**What:** Add sitemap generation to Astro build output.

```javascript
// Source: docs.astro.build/en/guides/integrations-guide/sitemap/
// astro.config.mjs — final state:
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sertaoseracloud.github.io',   // already present
  base: '/deep-dive-vm',                        // already present
  outDir: 'dist',                               // already present
  integrations: [sitemap()],                    // ADD THIS
});
```

**Key facts:**
- `site` must be set to a full `http://` or `https://` URL — already satisfied by `astro.config.mjs`. [VERIFIED: docs.astro.build]
- Output files: `dist/sitemap-index.xml` and `dist/sitemap-0.xml`. The test should check `sitemap-index.xml` (as specified in CONTEXT.md D-06/D-07). [VERIFIED: docs.astro.build]
- The `base: '/deep-dive-vm'` config: Astro's sitemap integration uses the `base` path when generating URLs. The single `index.astro` generates one URL: `https://sertaoseracloud.github.io/deep-dive-vm/`. [CITED: docs.astro.build — base path handling]
- No `customPages` or `filter` configuration needed. [VERIFIED: CONTEXT.md D-07 confirms single page]
- `npx astro add sitemap` is the canonical install command and auto-patches `astro.config.mjs`. If run, the manual edit is not needed. [VERIFIED: docs.astro.build]

### Pattern 4: Lighthouse CI Assert Configuration

**What:** LHCI assert syntax for category score gates.

```json
// Source: googlechrome.github.io/lighthouse-ci/docs/configuration.html
// .lighthouserc.json — final state:
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],
        "categories:performance": ["error", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Changes from current state:**
1. `categories:accessibility`: `"warn"` → `"error"` (D-02)
2. `categories:performance`: new entry at `["error", { "minScore": 0.8 }]` (D-01)

**Key facts:**
- `"error"` causes non-zero exit code → CI fails. `"warn"` prints to stderr but does not fail. [VERIFIED: googlechrome.github.io/lighthouse-ci/docs/configuration.html]
- `minScore` is 0–1 decimal (0.8 = 80%). [VERIFIED: LHCI docs]
- `numberOfRuns: 3` with default `aggregationMethod: "optimistic"` means the best of 3 runs is used for assertion. This is relevant: if performance flaps, the optimistic run may still pass. [CITED: LHCI docs — aggregationMethod default]
- `staticDistDir` collects from `dist/` — no HTTP server needed for LHCI collection. [VERIFIED: existing .lighthouserc.json]

### Pattern 5: New SEO Test Assertions (TDD RED→GREEN)

**What:** Three new `it()` blocks appended to `tests/seo/seo-meta.test.ts`.
**TDD cycle:** Write RED (failing) assertions first, run tests to confirm failure, then implement fixes, then confirm GREEN.

```typescript
// Source: pattern based on existing helpers in seo-meta.test.ts
// New imports needed at top of file:
import { existsSync } from "node:fs";  // already imported
import { join } from "node:path";       // already imported

// Add DIST_DIR constant alongside existing DIST_INDEX:
const DIST_DIR = join(__dirname, "../../dist");

// ── New Assertions (append to existing describe block) ────────────────────────

it("11. JSON-LD <script type=application/ld+json> is present and parseable with @context and @type", () => {
  const match = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  expect(match).not.toBeNull();
  const parsed = JSON.parse(match![1]);
  expect(parsed["@context"]).toBeTruthy();
  expect(parsed["@type"]).toBeTruthy();
});

it("12. Heading hierarchy: no H2 before first H1, no heading level skip", () => {
  // Extract all heading tags in document order
  const headingMatches = [...html.matchAll(/<(h[1-6])[\s>]/gi)];
  const levels = headingMatches.map((m) => parseInt(m[1].slice(1), 10));

  // Must have at least one H1
  expect(levels).toContain(1);

  // No H2 before first H1
  const firstH1Index = levels.indexOf(1);
  const firstH2Index = levels.indexOf(2);
  if (firstH2Index !== -1) {
    expect(firstH2Index).toBeGreaterThan(firstH1Index);
  }

  // No heading level skip: each heading level must not jump more than 1 from previous
  for (let i = 1; i < levels.length; i++) {
    const diff = levels[i] - levels[i - 1];
    // Going deeper: must increase by at most 1
    if (diff > 0) {
      expect(diff).toBeLessThanOrEqual(1);
    }
    // Going up or staying same is always fine
  }
});

it("13. dist/sitemap-index.xml exists after build", () => {
  expect(existsSync(join(DIST_DIR, "sitemap-index.xml"))).toBe(true);
});
```

**TDD RED/GREEN analysis:**
- **Test 11 (JSON-LD):** Will be GREEN immediately — the JSON-LD `<script>` is already present in `Layout.astro` with `@context` and `@type`. Write test, run, expect PASS. If somehow GREEN already, the test is still valid as a regression guard.
- **Test 12 (Heading hierarchy):** Will be GREEN immediately — the current page has one H1 in Hero, H2s in sections. The heading structure must be verified during implementation to confirm no skip exists. [ASSUMED — based on reading Hero.astro and the existing test 8 confirming single H1; full H-tag ordering not verified by grep]
- **Test 13 (Sitemap):** Will be RED until D-07 (`@astrojs/sitemap`) is installed and `astro.config.mjs` is updated. This is the canonical RED→GREEN TDD test for this phase.

**IMPORTANT — vitest config scope:** `tests/seo/seo-meta.test.ts` is NOT in `vitest.config.ts` `include` globs (`tests/unit/**` and `tests/integration/**`). It is run explicitly in CI via `npx vitest run tests/seo`. Locally: `npx vitest run tests/seo`. This is already the established pattern — no vitest config change needed. [VERIFIED: vitest.config.ts + .github/workflows/test.yml]

### Anti-Patterns to Avoid

- **Passing `asset.src` to `<Image src=...>`:** The `<Image>` component requires the raw import object (`ImageMetadata`), not the `.src` string. Passing a string disables Astro's optimization pipeline. [VERIFIED: docs.astro.build]
- **Specifying `width` and `height` for local imported assets:** Astro infers these from the import metadata. Manual values that don't match the actual dimensions cause distortion. Omit unless deliberately overriding for responsive layout reasons.
- **Asserting `sitemap-0.xml` instead of `sitemap-index.xml`:** The index file is the canonical entry point. The numbered files are implementation details. Assert the index. [CITED: CONTEXT.md specifics + docs.astro.build sitemap output]
- **Removing `<noscript>` fallback from font preload pattern:** Without `<noscript>`, JS-disabled users never receive the custom fonts. Always include it.
- **Using `JSON.parse()` without try/catch in production code (not tests):** In the test context, letting `JSON.parse()` throw is acceptable — Vitest catches it as a test failure. No try/catch needed in the assertion.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image format conversion to WebP | Build script, sharp CLI, custom Vite plugin | `astro:assets <Image>` component | Already ships with Astro 6; handles WebP, CLS prevention, lazy/eager, all in one |
| Sitemap XML generation | String template + `fs.writeFile` in build hook | `@astrojs/sitemap` | Handles `lastmod`, `changefreq`, `priority`, encoding, and large-site sharding automatically |
| Heading hierarchy validation | Custom DOM parser | Regex on static HTML string | For static single-page HTML, regex `matchAll(/<(h[1-6])[\s>]/gi)` is sufficient and matches the existing test file's approach. No jsdom/parse5 needed. |

---

## Common Pitfalls

### Pitfall 1: `<Image>` Breaks Existing CSS Selector

**What goes wrong:** The `<Image>` component renders an `<img>` element, but the wrapper element (`.hero-portrait-wrap`) has CSS `img { ... }` styles. These still work. However, if a component wraps the image in an additional container div, the selector chain breaks.

**Why it happens:** Some Astro image wrappers in older docs showed a wrapper div. In current Astro 6, `<Image>` renders a bare `<img>` — no wrapper. [VERIFIED: docs.astro.build current]

**How to avoid:** After replacing `<img>` with `<Image>`, inspect the built HTML (`dist/index.html`) to confirm the generated element is a direct `<img>` inside `.hero-portrait-wrap`. The existing CSS `object-fit: cover` and `width: 100%; height: 100%` must remain on the `<img>`.

**Warning signs:** Hero image appears stretched or incorrectly sized after migration.

### Pitfall 2: Sitemap Not Generated — Missing `site` Config

**What goes wrong:** `@astrojs/sitemap` silently skips sitemap generation if `site` is not set. Test 13 would fail.

**Why it happens:** The integration requires `site` to construct absolute URLs. Without it, it cannot generate valid sitemap entries.

**How to avoid:** `site` is already set in `astro.config.mjs` as `'https://sertaoseracloud.github.io'`. Verify it is still present after adding the integration. [VERIFIED: existing astro.config.mjs]

### Pitfall 3: Font FOUT After Preload Pattern

**What goes wrong:** After switching to `rel="preload"`, there is a brief Flash of Unstyled Text (FOUT) before the font CSS loads and applies.

**Why it happens:** The font is no longer render-blocking. The browser renders with the fallback font first, then repaints when the Google Fonts CSS arrives.

**How to avoid:** This is expected and acceptable — it's why `&display=swap` is in the URL. The `font-display: swap` descriptor is baked into the Google Fonts response. The FOUT is brief and the tradeoff (no render block) is the desired outcome.

**Warning signs:** If FOUT is extremely long (>2s), the preconnect links may be missing or the font URL is wrong.

### Pitfall 4: JSON-LD Test Regex Fails to Find the Script Tag

**What goes wrong:** The regex `/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i` fails to match in the built HTML because Astro's minification changes the attribute quoting or order.

**Why it happens:** Astro's HTML minifier may reorder attributes or strip quotes. The `is:inline` directive on the script tag in `Layout.astro` should preserve the content, but attribute order is not guaranteed.

**How to avoid:** The regex uses alternating `["']` for quotes and checks both attribute orderings. The existing `extractMetaContent` helper in the test file already uses the same approach. Verify with `npm run build && npx vitest run tests/seo` after implementation. [VERIFIED: reviewing existing seo-meta.test.ts helper patterns]

### Pitfall 5: LHCI Performance Gate Flapping

**What goes wrong:** The new `categories:performance >= 0.8 [error]` gate causes intermittent CI failures because Lighthouse scores fluctuate between runs.

**Why it happens:** Lighthouse performance scoring is sensitive to CI machine load, network latency (even for local static serving), and CPU throttling simulation.

**How to avoid:** `numberOfRuns: 3` is already set, and the default `aggregationMethod: "optimistic"` uses the best run. This is the standard mitigation. The threshold of 0.8 (80%) provides headroom. [VERIFIED: LHCI docs — aggregationMethod: optimistic is default]

**Warning signs:** If the build consistently passes locally but fails in CI, the CI runner is too resource-constrained. Consider `aggregationMethod: "median"` for more stable but stricter behavior.

### Pitfall 6: Heading Hierarchy Test Incorrectly Fails on Valid Structure

**What goes wrong:** Test 12 flags valid heading structures as skipped levels.

**Why it happens:** The regex traversal checks sequential pairs. A jump from H2 back to H1 (going up) should be allowed. Only downward jumps of more than 1 level are invalid.

**How to avoid:** The test pattern above only checks `diff > 1` for downward moves (positive diff). Upward or lateral moves (negative or zero diff) are unconditionally accepted. This matches axe-core's heading-order rule. [CITED: dequeuniversity.com/rules/axe/4.8/heading-order]

---

## Code Examples

Verified patterns from official sources:

### Hero.astro — Final Image Block

```astro
---
// Replace existing import pattern
import { Image } from "astro:assets";
import claudio1 from "../../assets/claudio1.png";
---

<!-- Inside .hero-portrait-wrap, replace: -->
<!-- OLD: <img src={claudio1.src} alt="..." /> -->
<!-- NEW: -->
<Image
  src={claudio1}
  alt="Cláudio Filipe Lima Raposo segurando uma chama elétrica azul"
  loading="eager"
  fetchpriority="high"
/>
```

### Mentor.astro — Final Image Blocks

```astro
---
import { Image } from "astro:assets";
import claudio2 from "../../assets/claudio2.png";
import marcelo from "../../assets/marcelo.png";
---

<!-- First mentor portrait — replace <img src={claudio2.src}> -->
<Image
  src={claudio2}
  alt="Cláudio Filipe Lima Raposo"
  loading="lazy"
/>

<!-- Second mentor portrait — replace <img src={marcelo.src}> -->
<Image
  src={marcelo}
  alt="Marcelo Gonçalves · Cloud in Focus"
  loading="lazy"
/>
```

### astro.config.mjs — Final State

```javascript
// Source: docs.astro.build/en/guides/integrations-guide/sitemap/
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sertaoseracloud.github.io',
  base: '/deep-dive-vm',
  outDir: 'dist',
  integrations: [sitemap()],
});
```

### .lighthouserc.json — Final State

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],
        "categories:performance": ["error", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<img src={asset.src}>` raw PNG | `<Image src={asset}>` WebP via `astro:assets` | Astro 3+ (stable in Astro 5/6) | Auto-WebP, CLS prevention via inferred dimensions |
| `rel="stylesheet"` Google Fonts | `rel="preload" as="style"` + onload | Industry pattern since 2017, Lighthouse recommended | Eliminates render-blocking resource; improves FCP/LCP |
| LHCI `warn` for accessibility | `error` gate | Project-specific promotion (Phase 3) | CI now blocks on a11y regression |

**Deprecated/outdated:**
- `loading="lazy"` on LCP images: was a common mistake in early lazy-loading adoption. Now well understood — Hero images must be `eager`. Lighthouse explicitly flags lazy-loaded LCP elements.
- `<link rel="preload" as="font">` for individual font files: Valid but lower-level. The Google Fonts CSS preload approach preloads the CSS which then pulls individual font files — simpler for variable-weight fonts.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `Testimonials.astro` has no `<img>` tags — avatar uses CSS gradient text | Architecture Patterns (component list) | If wrong: a 4th `<Image>` migration is needed in Testimonials.astro; LOW risk (verified by reading source) |
| A2 | Heading hierarchy is already valid (no H1→H3 skip exists in current HTML) | Pattern 5 (TDD analysis), Pitfall 6 | Test 12 will unexpectedly be RED on first run; needs investigation of H-tag structure in all section components |
| A3 | `onload` in HTML attributes in Astro `<head>` works without `is:inline` or special directives | Pattern 2 (font preload) | Font loading fix may silently fail if Astro strips the onload handler; verify in dist/index.html after build |
| A4 | `npx astro add sitemap` patches `astro.config.mjs` correctly without breaking existing `base` and `outDir` settings | Pattern 3 | Config regression — verify astro.config.mjs after running `npx astro add sitemap` |

**A1 is LOW risk** — Testimonials.astro was read directly and confirmed to have no `<img>` tags.
**A2 is MEDIUM risk** — Hero H1 confirmed, but other section components (SectionHead.astro, etc.) have not been fully audited for H-tag structure.

---

## Open Questions (RESOLVED)

1. **Does `SectionHead.astro` use H2 tags, and is the hierarchy valid?**
   - What we know: `Hero.astro` has the single H1. `SectionHead.astro` is used by Mentor and other sections with `titleHtml` prop.
   - What's unclear: Whether `SectionHead.astro` emits `<h2>` (correct) or `<h3>` (potentially skipping), and whether any section uses a heading level that jumps from H1.
   - **RESOLVED:** Test 12 (heading hierarchy assertion) catches any violation automatically at test time. During Wave 0 execution, run `grep -ri "<h[1-6]" src/components` to enumerate all heading tags before writing Test 12. If a skip is found, the test will be RED and a production fix will be needed before confirming GREEN. The test is the enforcement mechanism.

2. **Will `npx astro add sitemap` conflict with the existing `// ... outras configurações` comment in astro.config.mjs?**
   - What we know: Current `astro.config.mjs` is minimal with a trailing comment.
   - What's unclear: Whether `npx astro add sitemap` handles commented-out config sections.
   - **RESOLVED:** Manual edit chosen in plan 03-01/Task 2. The final `astro.config.mjs` state is explicitly provided in the Code Examples section and in the task `<action>` block. The trailing comment is removed in the manual edit. `npx astro add sitemap` is not used.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build + test | ✓ | 24.14.1 | — |
| `@astrojs/sitemap` | D-07 | ✗ (not installed) | 3.7.2 (registry) | None — must install |
| `@lhci/cli` | D-01, D-02 | ✓ | 0.14.0 | — |
| `astro:assets` (built-in) | D-03, D-04 | ✓ | Astro 6.3.1 | — |

**Missing dependencies with no fallback:**
- `@astrojs/sitemap` must be installed before `npm run build` can produce `sitemap-index.xml`. This is a Wave 0 task.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run (SEO tests) | `npx vitest run tests/seo` |
| Full suite command | `npm run test:all` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | Performance CI gate blocks at < 0.8 | manual (LHCI) | `npx lhci autorun` | ✅ `.lighthouserc.json` edit |
| D-02 | Accessibility CI gate blocks at < 0.9 | manual (LHCI) | `npx lhci autorun` | ✅ `.lighthouserc.json` edit |
| D-03 | Images render as WebP `<img>` tags | unit (static HTML) | `npx vitest run tests/unit` | ✅ existing Hero.test.ts (img present) |
| D-04 | Hero img has `loading="eager"` + `fetchpriority="high"` | unit (static HTML) | `npx vitest run tests/seo` | ❌ Wave 0 gap — add to seo-meta.test.ts or Hero.test.ts |
| D-05 | No render-blocking Google Fonts `<link rel="stylesheet">` in `<head>` | unit (static HTML) | `npx vitest run tests/seo` | ❌ Wave 0 gap — add assertion |
| D-06a | JSON-LD `@context` + `@type` present and parseable | unit (static HTML) | `npx vitest run tests/seo` | ❌ Wave 0 (new assertion 11) |
| D-06b | Heading hierarchy valid | unit (static HTML) | `npx vitest run tests/seo` | ❌ Wave 0 (new assertion 12) |
| D-06c | `dist/sitemap-index.xml` exists | unit (static file) | `npx vitest run tests/seo` | ❌ Wave 0 (new assertion 13) |
| D-07 | Sitemap integration in astro.config.mjs | integration | `npm run build` + assertion 13 | ❌ Wave 0 gap |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/seo`
- **Per wave merge:** `npm run test:all && npm run build && npx lhci autorun`
- **Phase gate:** Full suite green + LHCI green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/seo/seo-meta.test.ts` — add assertions 11 (JSON-LD), 12 (heading), 13 (sitemap). Write RED first, then confirm RED before implementing.
- [ ] Optionally add to `tests/unit/components/Hero.test.ts`: assert `loading="eager"` and `fetchpriority="high"` on the hero `<img>` (D-04 coverage).
- [ ] Optionally add to `tests/seo/seo-meta.test.ts`: assert absence of `rel="stylesheet"` Google Fonts link (D-05 coverage — confirms non-blocking pattern is in place).
- [ ] Install `@astrojs/sitemap`: `npm install @astrojs/sitemap`

*(The 3 mandatory new assertions (D-06) are the only hard gaps. The D-04 and D-05 test coverage is optional but recommended for regression safety.)*

---

## Security Domain

> `security_enforcement` not set in config.json — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (static site, no auth) |
| V3 Session Management | no | — (no sessions) |
| V4 Access Control | no | — (public content only) |
| V5 Input Validation | no | — (no user input in this phase) |
| V6 Cryptography | no | — (no crypto operations) |

**Security notes for this phase:**
- Google Fonts preload pattern: the `onload` attribute contains inline JavaScript. Astro does not apply a CSP by default, so this does not introduce a new vulnerability. If a CSP with `script-src 'self'` were present, the inline `onload` would need a nonce or hash. [ASSUMED — no CSP currently configured, no CLAUDE.md security directives found]
- `@astrojs/sitemap` output is static XML — no injection surface.
- `<Image>` component processes local files at build time — no runtime risk.

---

## Sources

### Primary (HIGH confidence)

- `docs.astro.build/en/reference/modules/astro-assets/` — `<Image>` component API, props, WebP default, `fetchpriority`, dimension inference [VERIFIED via WebFetch]
- `docs.astro.build/en/guides/integrations-guide/sitemap/` — install command, config syntax, output files (`sitemap-index.xml`, `sitemap-0.xml`), `site` requirement [VERIFIED via WebFetch]
- `googlechrome.github.io/lighthouse-ci/docs/configuration.html` — `assert` syntax, `minScore`, `error`/`warn` semantics, `aggregationMethod` options [VERIFIED via WebFetch]
- Project source files (direct read): `Layout.astro`, `Hero.astro`, `Mentor.astro`, `Testimonials.astro`, `astro.config.mjs`, `.lighthouserc.json`, `tests/seo/seo-meta.test.ts`, `vitest.config.ts`, `.github/workflows/test.yml`, `package.json` [VERIFIED]
- npm registry: `@astrojs/sitemap@3.7.2`, `astro@6.3.1` [VERIFIED via npm view]

### Secondary (MEDIUM confidence)

- `pagespeedchecklist.com/asynchronous-google-fonts` — `onload="this.onload=null;this.rel='stylesheet'"` pattern [WebSearch verified against multiple sources]
- `dequeuniversity.com/rules/axe/4.8/heading-order` — heading hierarchy validation rule: each heading may increase by at most 1 level [CITED]

### Tertiary (LOW confidence)

- None — all critical claims verified from primary sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry and installed package.json
- Architecture: HIGH — all source files read directly; component structure confirmed
- Image component API: HIGH — verified via official Astro docs (WebFetch)
- Sitemap integration: HIGH — verified via official Astro docs (WebFetch)
- LHCI config syntax: HIGH — verified via official LHCI docs (WebFetch)
- Font preload pattern: MEDIUM — industry-standard pattern verified across multiple sources; exact Astro behavior for `onload` in `<head>` is ASSUMED not to need special handling
- TDD test patterns: HIGH — derived from existing test file conventions in the codebase

**Research date:** 2026-05-11
**Valid until:** 2026-06-11 (stable ecosystem; Astro docs stable for 30 days)
