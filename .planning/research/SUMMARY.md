# Research Summary: v1.3 Multi-LP Platform

**Project:** mentoria.sertaoseracloud.com -- Hub page + multi-landing-page platform
**Domain:** Linktree-style hub + Astro multi-page restructure
**Researched:** 2026-05-16
**Confidence:** HIGH

---

## Stack Additions

No new dependencies. The entire migration runs on the existing stack.

**File changes required -- exact locations:**

| File | Change |
|------|--------|
| `astro.config.mjs` | Remove `base` entirely -- keep `site` |
| `src/pages/index.astro` | Replace with hub page (linktree-style) |
| `src/pages/deep-dive-vm/index.astro` | New file -- current `index.astro` moved here |
| `src/layouts/Layout.astro:48` | `/deep-dive-vm/favicon.svg` -> `/favicon.svg` |
| `src/layouts/Layout.astro:16` | Extract `offersUrl` / JSON-LD Course schema to `LpLayout.astro` |
| `playwright.config.ts` | Both `baseURL` and `webServer.url` -> `http://localhost:4321/` |
| `package.json` | Update `lighthouse` script target; add second entry for hub |
| `tests/seo/seo-meta.test.ts` | `DIST_INDEX` -> `dist/deep-dive-vm/index.html`; add hub assertions |
| `public/CNAME` | Create with content `mentoria.sertaoseracloud.com` |

`astro-seo` v1.1.0, `@astrojs/sitemap` v3.7.2, and the GitHub Actions deploy workflow all require zero changes.

---

## Feature Table Stakes

Without these, the hub fails its job (routing WhatsApp/Instagram/LinkedIn traffic to the right course):

1. **Profile photo + name + one-line bio** -- trust signal before any text is read; establishes instructor identity
2. **Link cards (3-5 max)** -- the entire purpose of the page; ordered by priority, not alphabetically
3. **Mobile-first layout at 375px** -- >90% of social traffic is mobile; min 48x48px tap targets
4. **Open Graph meta tags (full set)** -- without them WhatsApp shows a bare URL; no image, no title, no click
5. **og:image 1200x630 PNG, <300KB, HTTPS** -- the preview image IS the first impression on WhatsApp; hard requirement
6. **Sub-2s load time** -- every second adds ~32% bounce; static Astro output with no client JS satisfies this
7. **HTTPS + canonical URL** -- WhatsApp refuses to render og:image from non-HTTPS origins

**Defer to post-launch:**
- Click analytics (Plausible) -- add after go-live, does not affect sharing
- Thumbnail images per link card -- only if course assets are production-quality
- Entrance animations -- motion/react already installed; add after core is validated

**Never add:** email capture, embedded video, cookie consent banners, popups, more than 7 link cards, client-side rendering (SPA breaks WhatsApp crawler), social share counts.

---

## Architecture Decision

**Use file-based directories (Option A). Do not use [slug] dynamic routing.**

Each LP is independently authored and structurally distinct. Dynamic routing adds getStaticPaths() boilerplate with no benefit for 2-5 pages. File-based routing makes the URL-to-file mapping obvious; adding a new LP is one action: create `src/pages/new-lp/index.astro`.

**Target structure:**

```
src/
  pages/
    index.astro                         <- NEW hub at /
    deep-dive-vm/index.astro            <- MOVED existing LP at /deep-dive-vm/
    deep-dive-ec2/index.astro           <- SCAFFOLD for next LP
  components/
    hub/LpCard.astro                    <- NEW hub-only component
    deep-dive-vm/{layout,sections,ui}/  <- MOVED current components
    shared/                             <- optional: shared across LPs
  layouts/
    Layout.astro                        <- KEEP, make course-agnostic
    LpLayout.astro                      <- NEW: extends Layout, adds Course JSON-LD slot
public/
  CNAME                                 <- ADD here (not repo root)
```

**Key layout refactor:** Extract the JSON-LD Course schema and offersUrl out of shared Layout.astro into LpLayout.astro. Hub uses Layout.astro directly with hub-specific title/description. This prevents course-specific structured data leaking into the hub head.

**Optional:** Path aliases in tsconfig.json (`@deep-dive-vm/*`, `@hub/*`, `@shared/*`) prevent fragile relative import paths after the component move.

---

## Critical Pitfalls (ordered by risk)

1. **CRIT-01 -- No public/CNAME file (silent domain loss on every deploy)**
   Root-level CNAME is NOT copied into Astro's dist/. Without public/CNAME, GitHub Pages reverts to the github.io URL on every deploy -- no build error, no warning. Create public/CNAME first, before any other change. CI assertion to add: `test -f dist/CNAME && grep -q "mentoria.sertaoseracloud.com" dist/CNAME`.

2. **CRIT-02 -- Hardcoded /deep-dive-vm/ strings in Layout.astro (favicon 404 + JSON-LD mismatch)**
   astro.config.mjs changes do NOT rewrite string literals. Layout.astro:48 (favicon href) will 404 from every non-VM route. Layout.astro:16 (offersUrl) misrepresents structured data. Audit first: `grep -r "deep-dive-vm" src/` -- zero results required before go-live.

3. **CRIT-04 -- SEO tests read dist/index.html which becomes the hub (tests silently validate wrong page)**
   After the file move, dist/index.html is the hub. All course-specific SEO assertions either pass vacuously or fail misleadingly. The landing page SEO quality is no longer gated. Update DIST_INDEX in both seo-meta.test.ts and Layout.test.ts to `dist/deep-dive-vm/index.html` before the file move.

4. **CRIT-05 -- Playwright webServer.url polls /deep-dive-vm/ (CI E2E job times out)**
   playwright.config.ts health-check polls http://localhost:4321/deep-dive-vm/. After base removal that path is gone. CI waits 60 seconds then times out -- all E2E tests fail. Update both baseURL and webServer.url to `http://localhost:4321/` before running any E2E tests.

5. **MOD-03 -- LHCI audits all pages in staticDistDir (minimal hub fails score thresholds)**
   Lighthouse CI discovers and audits both dist/index.html and dist/deep-dive-vm/index.html. A hub placeholder with no meta description fails accessibility >= 0.9 and seo >= 0.9, breaking the CI gate. Add proper OG meta to the hub before enabling LHCI, or restrict LHCI urls to specific paths.

---

## Recommended Build Order

**Phase 1 -- Structural migration (highest risk; validate before adding anything new)**
1. Create public/CNAME -- verify dist/CNAME appears after `npm run build`
2. Grep and fix all hardcoded deep-dive-vm strings in src/, tests/, config files
3. Remove `base` from astro.config.mjs
4. Move src/pages/index.astro -> src/pages/deep-dive-vm/index.astro
5. Move components into src/components/deep-dive-vm/; update all import paths
6. Update playwright.config.ts (baseURL + webServer.url)
7. Update SEO test DIST_INDEX constants
8. Gate: `npm run build` -- confirm dist/deep-dive-vm/index.html exists, dist/CNAME exists, dist/sitemap-0.xml has correct loc values, no stray deep-dive-vm refs in asset hrefs

**Phase 2 -- Hub page (net-new; isolated from migration risk)**
1. Create src/layouts/LpLayout.astro -- extract Course JSON-LD from Layout.astro
2. Create src/pages/index.astro -- profile photo, name, credentialing strip, 3-5 link cards
3. Create src/components/hub/LpCard.astro
4. Add all required OG tags + og:image (1200x630 PNG, <300KB, Abismo #0a0f1e background, Chakra Petch headline)
5. Add theme-color and Twitter Card tags
6. Validate hub with WhatsApp link preview tool before deploy

**Phase 3 -- Polish and EC2 scaffold (pure additions)**
1. Scaffold src/pages/deep-dive-ec2/index.astro placeholder
2. Add Sitemap: directive to public/robots.txt
3. Update LHCI config to audit both pages or restrict to specific paths
4. Update package.json lighthouse script to cover hub URL
5. Optionally add entrance animations (motion/react already installed)
6. Optionally configure Plausible analytics (cookieless, no banner required)

---

## Watch Out For

- **base removal does not rewrite string literals.** Astro only rewrites paths processed through its asset pipeline (ES import). Any hardcoded href/src referencing the old subpath must be found and fixed manually. Audit command: `grep -r "deep-dive-vm" src/ tests/ *.json *.mjs *.ts`

- **LHCI audits everything it finds in dist/.** Adding a second page means CI now grades the hub too. A placeholder hub with no meta description tanks the SEO score and fails the build gate even if the landing page is perfect.

- **WhatsApp's crawler does not execute JavaScript.** All OG tags must be in the initial HTML response. Astro's static output is correct by default -- but any runtime-rendered meta tag from a client component is invisible to all social crawlers.

- **dist/CNAME must survive every deploy.** Correct location: public/CNAME, not repo root. A root-level CNAME is silently ignored by Astro's build pipeline -- the domain appears to work until the next deploy wipes it.

- **The JSON-LD Course schema in Layout.astro is course-specific.** If it stays in the shared layout, every hub visitor gets Course structured data in their head -- Google will flag a content/schema mismatch. Extract to LpLayout.astro before the hub goes live.
