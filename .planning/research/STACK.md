# Stack Research: Multi-LP Platform

**Researched:** 2026-05-16
**Confidence:** HIGH — based on current Astro docs + direct project file audit

---

## What's Already Sufficient

### Astro file-based routing
No routing plugin needed. Astro's built-in file-based routing covers the entire multi-page structure natively. `src/pages/index.astro` → `/`, `src/pages/deep-dive-vm/index.astro` → `/deep-dive-vm/`, `src/pages/deep-dive-ec2/index.astro` → `/deep-dive-ec2/`. No configuration required — the file layout is the route config. Source: https://docs.astro.build/en/guides/routing/

### Open Graph meta tags
No new library needed. `astro-seo` is already installed (`v1.1.0` in `package.json`) and is already fully wired in `src/layouts/Layout.astro` with `og:title`, `og:type`, `og:image`, `og:description`, `twitter:card`, and `twitter:image`. The hub page just needs a new Layout invocation (or the same Layout with hub-specific props). OG tags are plain HTML `<meta>` tags — the existing `astro-seo` component handles them correctly.

### GitHub Actions deploy workflow
`.github/workflows/deploy.yaml` does not reference the base path anywhere. The workflow just calls `npm run build` and uploads `./dist`. It does not need changes when `base` changes. Source: confirmed by reading the file directly.

### GitHub Pages custom domain
A `CNAME` file with `mentoria.sertaoseracloud.com` is not present in `public/` right now, but the domain already resolves. GitHub Pages preserves the CNAME setting via the repository Pages settings in the UI. If a `public/CNAME` file is added, it will persist across deploys (the file is copied to `dist/` by Astro). Either way, the custom domain behavior is independent of the `base` config change — the domain keeps working.

### `@astrojs/sitemap`
Already installed. When `base` is removed, the sitemap integration will automatically generate correct root-relative URLs. No config change needed for the integration itself, only `astro.config.mjs` changes (described below).

---

## Changes Required

### 1. `astro.config.mjs` — remove `base`, keep `site`

Current:
```js
export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  base: '/deep-dive-vm/',
  outDir: 'dist',
  integrations: [sitemap()],
});
```

Target:
```js
export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  outDir: 'dist',
  integrations: [sitemap()],
});
```

Rationale: Astro docs state explicitly — "Do not set a value for `base`, and remove one if it exists" when deploying to a custom domain (apex or subdomain). With `base` removed, `import.meta.env.BASE_URL` becomes `/`, and all `_astro/` asset hashes resolve from root.

### 2. `src/pages/` restructuring

The current `src/pages/index.astro` is the Azure VM landing page. With the hub at `/`, the file layout must change:

```
src/pages/index.astro                    → hub (Linktree-style)
src/pages/deep-dive-vm/index.astro      → Azure VM landing page (moved from root)
```

The current `src/pages/index.astro` becomes `src/pages/deep-dive-vm/index.astro`. A new `src/pages/index.astro` is created for the hub.

### 3. `src/layouts/Layout.astro` — remove hardcoded `/deep-dive-vm/` references

Two locations embed the old base path as string literals:

- **Line 16:** `const offersUrl = \`${siteOrigin}/deep-dive-vm#investimento\`;`
  — This is the `offers.url` in JSON-LD. After the move, the VM page lives at `/deep-dive-vm/`, so the URL itself stays correct (`/deep-dive-vm/#investimento` or `/deep-dive-vm#investimento`). But if Layout is shared with the hub, this field needs to be a prop or computed per-page rather than a constant.

- **Line 48:** `href: "/deep-dive-vm/favicon.svg"` (in the `<link rel="icon">` extend)
  — After `base` is removed, the favicon path should be `/favicon.svg`. The hardcoded `/deep-dive-vm/favicon.svg` will 404 from the hub page (and from any non-VM route). Change to `"/favicon.svg"`.

### 4. `playwright.config.ts` — update `baseURL` and `webServer.url`

Current (line 11 and 34):
```ts
baseURL: "http://localhost:4321/deep-dive-vm/",
url: "http://localhost:4321/deep-dive-vm/",
```

After `base` is removed from Astro config, the dev/preview server runs at `http://localhost:4321/`. Playwright E2E tests will fail to reach the preview server and will navigate to wrong URLs until updated:

```ts
baseURL: "http://localhost:4321/",
url: "http://localhost:4321/",
```

Any Playwright test that navigates to `./` will now hit the hub. Tests specific to the Azure VM landing page should navigate to `./deep-dive-vm/` explicitly, or a separate E2E suite scoped to that path.

### 5. `package.json` — update `lighthouse` script URL

Line 18:
```json
"lighthouse": "lighthouse https://mentoria.sertaoseracloud.com/deep-dive-vm/ ..."
```

The hub should become the primary Lighthouse target. The VM page can be audited separately if needed. Update target URL to `https://mentoria.sertaoseracloud.com/` for the hub, and optionally add a second script for `/deep-dive-vm/`.

### 6. `tests/seo/seo-meta.test.ts` — update `DIST_INDEX` path

Current (line 18):
```ts
const DIST_INDEX = join(__dirname, "../../dist/index.html");
```

This test reads `dist/index.html`. After the restructure, `dist/index.html` will be the hub page, not the Azure VM landing page. The test assertions (JSON-LD `@type: "Course"`, course-specific keywords, `og:title` mentioning Azure VM) will fail against the hub's HTML.

Two options:
- Keep the SEO test pointing at `dist/index.html` and update assertions to match hub content.
- Add a second SEO test file that reads `dist/deep-dive-vm/index.html` and asserts course-specific tags.

### 7. `.lhcirc.json` / `.lighthouserc.json` — `staticDistDir` works as-is

Both configs use `staticDistDir: "./dist"` with no URL path specified. LHCI discovers pages from the dist directory automatically. This continues to work after the restructure — it will now discover and audit both `/index.html` (hub) and `/deep-dive-vm/index.html` (VM page). No change needed, but score thresholds apply to all discovered pages; the hub must also meet them.

---

## New Dependencies (if any)

None. The entire migration is achievable with the existing stack:
- Astro file-based routing handles multi-page natively
- `astro-seo` already handles full OG/Twitter card output
- GitHub Actions workflow requires no changes
- No routing plugins, no new meta-tag libraries, no additional deploy tooling needed

---

## Versions to Verify

### `astro` v6.3.1 — base removal behavior
Confirmed HIGH confidence: Astro docs explicitly state that when using a custom domain with GitHub Pages, `base` must be removed entirely (not set to `'/'`). Setting `base: '/'` is equivalent to no base but may cause double-slash edge cases in some versions. Omit the key entirely.

### `astro-seo` v1.1.0
The installed version is `^1.1.0`. The package README notes the latest documented release as `v0.3.14` for some features, with `v1.x` being the current series. The `extend` prop used in Layout.astro (for the favicon link and twitter meta) is a current-series feature. No breaking change concerns for this migration — the component interface is unchanged.

### `@astrojs/sitemap` v3.7.2
When `base` is removed, the sitemap integration generates URLs rooted at `site` (`https://mentoria.sertaoseracloud.com/`). The hub will be included as the root URL, and all sub-pages as `/deep-dive-vm/`, `/deep-dive-ec2/`, etc. No configuration change needed. Verify after build that `dist/sitemap-0.xml` contains the expected entries.

---

## Summary of Files Touched by This Migration

| File | Change |
|------|--------|
| `astro.config.mjs` | Remove `base: '/deep-dive-vm/'` |
| `src/pages/index.astro` | Replace with hub page |
| `src/pages/deep-dive-vm/index.astro` | New file — current `index.astro` moved here |
| `src/layouts/Layout.astro` | Fix hardcoded `/deep-dive-vm/favicon.svg` → `/favicon.svg`; make `offersUrl` a prop or per-layout constant |
| `playwright.config.ts` | Update `baseURL` and `webServer.url` to `http://localhost:4321/` |
| `package.json` | Update `lighthouse` script target URL |
| `tests/seo/seo-meta.test.ts` | Update assertions for hub page OR split into hub + VM suites |
| `public/CNAME` | Add `mentoria.sertaoseracloud.com` (optional — domain already works via GH Pages settings, but explicit file prevents accidental removal) |
