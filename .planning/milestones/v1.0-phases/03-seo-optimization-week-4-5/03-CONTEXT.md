# Phase 3: SEO Optimization - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand the Phase 1 SEO baseline (static meta-tag assertions + Lighthouse CI gate at SEO ≥ 90) into full technical SEO optimization: enforce the missing performance and accessibility CI gates, convert raw PNG images to WebP with correct loading strategy, fix the render-blocking Google Fonts link, and add three new static SEO assertions (JSON-LD validation, heading hierarchy, sitemap presence).

This phase does NOT add new page routes, forms, or auth. It only optimizes the single existing landing page and hardens the existing CI gates.

</domain>

<decisions>
## Implementation Decisions

### D-01 — Performance CI Gate

- **Chosen:** Add `categories:performance: ["error", { "minScore": 0.8 }]` to `.lighthouserc.json`
- Gate is **blocking** (error, not warn) to match REQUIREMENTS.md threshold of Performance ≥ 80
- The current `.lighthouserc.json` has no `categories:performance` entry at all — this adds it

### D-02 — Accessibility CI Gate

- **Chosen:** Promote `categories:accessibility` from `"warn"` → `"error"` at `minScore: 0.9`
- Rationale: Phase 2 axe-core E2E tests pass; skip-link + keyboard nav are implemented; the baseline is solid enough to gate on
- No change to the minScore threshold (stays at 0.9)

### D-03 — Image Optimization Strategy

- **Chosen:** Astro `<Image>` component from `astro:assets` for all 3 PNG images
- Auto-converts to WebP at build time, generates `width`/`height` (prevents CLS), uses Astro's built-in optimizer — zero new dependencies
- Files affected: `src/components/sections/Hero.astro`, `src/components/sections/Mentor.astro` (claudio2), and whichever component renders `marcelo.png` (Testimonials section)

### D-04 — Hero Image Loading Priority

- **Chosen:** `claudio1` (Hero) → `loading="eager"` + `fetchpriority="high"`
- All other images (`claudio2`, `marcelo`) → `loading="lazy"` (below the fold)
- Rationale: The hero image is the LCP element; making it lazy would hurt the Lighthouse LCP metric

### D-05 — Font Loading Strategy

- **Chosen:** Convert render-blocking Google Fonts `<link rel="stylesheet">` to non-blocking `<link rel="preload" as="style">` + `onload` swap + `<noscript>` fallback
- Pattern:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Chakra+Petch:wght@400;500;600;700&display=swap"
    onload="this.onload=null;this.rel='stylesheet'" />
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?..." />
  </noscript>
  ```
- Eliminates render-blocking; fonts load after first paint; no self-hosting, no new npm packages
- CSS `font-display: swap` is already baked into the Google Fonts URL via `&display=swap` param

### D-06 — New SEO Test Assertions (tests/seo/seo-meta.test.ts)

All three expansions selected:

1. **JSON-LD schema validation** — Assert `<script type="application/ld+json">` is present and `JSON.parse()`-able with non-empty `@context` and `@type` fields
2. **Heading hierarchy** — Assert no H2 appears before the first H1 in document order; assert headings don't skip a level (no direct H1→H3 jump)
3. **Sitemap presence** — Assert `dist/sitemap-index.xml` exists. Requires adding `@astrojs/sitemap` integration to `astro.config.mjs`.

Sitemap scope: **root only** — single-page site at `/deep-dive-vm/`. No custom URL configuration needed; `@astrojs/sitemap` auto-detects the built page.

### D-07 — Sitemap Integration

- **Chosen:** Add `@astrojs/sitemap` to `astro.config.mjs`
- Config: `site: 'https://sertaoseracloud.github.io'` is already set; the integration uses it automatically
- No `customPages` needed — the single `index.astro` generates one URL

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current SEO Implementation
- `src/layouts/Layout.astro` — All meta tags, OG, Twitter, JSON-LD schema, Google Fonts link (target of font loading fix)
- `src/pages/index.astro` — Page entry point; `<Image>` imports will go here or in child components
- `astro.config.mjs` — `site` + `base` already set; `@astrojs/sitemap` integration goes here

### Existing Tests
- `tests/seo/seo-meta.test.ts` — 10 existing static assertions on `dist/index.html`; Phase 3 adds 3 more

### CI / Lighthouse Config
- `.lighthouserc.json` — Current: SEO ≥ 90 (error), a11y ≥ 90 (warn), best-practices ≥ 80 (warn). Phase 3 changes: performance ≥ 80 (error), a11y promoted to error
- `.github/workflows/test.yml` — `lighthouse` job (runs after `unit-and-integration`); no structural changes expected

### Requirements
- `.planning/REQUIREMENTS.md` §SEO Requirements — Performance SEO thresholds (LCP < 2.5s, CLS < 0.1, FCP < 1.8s) listed but we chose category-score gate over raw metric thresholds (D-01)

### Images
- `src/assets/claudio1.png` — Hero LCP image; needs `loading="eager"` + `fetchpriority="high"` via `<Image>`
- `src/assets/claudio2.png` — Mentor/below-fold; needs `loading="lazy"` via `<Image>`
- `src/assets/marcelo.png` — Testimonials/below-fold; needs `loading="lazy"` via `<Image>`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `astro-seo` (already installed) — handles OG, Twitter, canonical. No changes needed for Phase 3.
- `astro:assets` `<Image>` component — built into Astro 6; no extra package. Already available to import in any `.astro` file.

### Established Patterns
- All images are currently imported as PNG modules (`import claudio1 from "../../assets/claudio1.png"`) and referenced via `.src`. The `<Image>` migration replaces `<img src={claudio1.src}>` with `<Image src={claudio1} alt="…" />`.
- Layout.astro uses `is:global` style block — font loading change goes in the `<head>` slot above the Google Fonts `<link>` tags.
- `.lighthouserc.json` uses LHCI `assert` format; both `categories:*` and raw metric keys (`largest-contentful-paint`) are valid. We chose category score (D-01).

### Integration Points
- `astro.config.mjs` — add `import sitemap from "@astrojs/sitemap"` + `integrations: [sitemap()]`
- `tests/seo/seo-meta.test.ts` — new assertions append to the existing `describe` block; `DIST_INDEX` helper already in place; add `DIST_DIR = join(__dirname, "../../dist")` for sitemap file existence check
- `tests/unit/setup.ts` globalSetup — already builds `dist/` once before tests; sitemap test benefits from this automatically

</code_context>

<specifics>
## Specific Ideas

- Font preload pattern: use `onload="this.onload=null;this.rel='stylesheet'"` (the standard non-blocking fonts pattern); add `&display=swap` to the URL if not already present (it IS already present in the current `Layout.astro` URL)
- `<Image>` usage: `<Image src={claudio1} alt="Cláudio Raposo, Microsoft MVP" width={600} height={600} />` — `width` and `height` prevent CLS; Astro infers them from the imported asset so explicit values may be optional
- Sitemap: after adding `@astrojs/sitemap`, `npm run build` produces `dist/sitemap-index.xml` and `dist/sitemap-0.xml`. Test asserts `existsSync(join(DIST_DIR, "sitemap-index.xml"))`

</specifics>

<deferred>
## Deferred Ideas

- **Core Web Vitals raw metric thresholds** (LCP ≤ 2500ms, CLS ≤ 0.1) — deferred; category score ≥ 80 chosen instead (D-01). Could be added to `.lighthouserc.json` in Phase 4 if more granular signal is needed.
- **Self-hosting fonts via fontsource** — deferred; preload approach (D-05) is sufficient for Phase 3 and avoids new npm dependencies.
- **FAQ JSON-LD schema expansion** — the FAQ section on the landing page could benefit from `FAQPage` schema markup. Deferred to Phase 4 (continuous validation).
- **Person schema for mentor** — could add a `Person` schema for Cláudio Raposo. Deferred to Phase 4.

</deferred>

---

*Phase: 3-SEO Optimization*
*Context gathered: 2026-05-11*
