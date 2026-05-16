# Pitfalls Research: Astro Base Config Migration

**Project:** Deep Dive Azure VM landing page  
**Migration:** `base: '/deep-dive-vm/'` → `base: '/'` (removed), hub at root, landing at `/deep-dive-vm/` via file routing  
**Researched:** 2026-05-16  
**Confidence:** HIGH (verified against Astro official docs, GitHub issues, Playwright docs)

---

## Critical (will break silently or loudly)

### CRIT-01: CNAME file does not exist — GitHub Pages will not serve the custom domain

**What goes wrong:** The project has no `public/CNAME` file. Without it, GitHub Pages serves the site at the default `<org>.github.io/<repo>` URL, not at `mentoria.sertaoseracloud.com`. This means every deploy silently discards the custom domain if the DNS is pointed but the CNAME file is absent.

**Why it happens:** GitHub Pages requires a CNAME file at the root of the published branch. Static site generators that force-push to `gh-pages` will overwrite a CNAME that was added only through the GitHub UI. Astro's build does not generate one automatically.

**Consequences:** The custom domain either 404s or reverts to the github.io URL on every deploy. Silent — no build error.

**Prevention:** Add `public/CNAME` containing exactly one line: `mentoria.sertaoseracloud.com`. The `public/` directory is copied verbatim into `dist/` at build time. Verify the file survives CI by grepping `dist/` after `npm run build`.

**Detection:** After any deploy, `curl -I https://mentoria.sertaoseracloud.com` returns a redirect or 404 to github.io.

---

### CRIT-02: Two hardcoded `/deep-dive-vm/` paths in Layout.astro will survive the config change

**What goes wrong:** `src/layouts/Layout.astro` contains two hardcoded strings that reference the old subpath:

- Line 16: `const offersUrl = \`${siteOrigin}/deep-dive-vm#investimento\`;` — used in JSON-LD structured data
- Line 48: `href: "/deep-dive-vm/favicon.svg"` — the favicon `<link>` tag

After removing `base`, the favicon path `/deep-dive-vm/favicon.svg` resolves against the domain root and the file won't be there (it will be at `/favicon.svg`). The JSON-LD offer URL will point to the wrong path if the landing page moves to `/deep-dive-vm/` via file routing instead of root.

**Why it happens:** Hardcoded strings do not react to `astro.config.mjs` changes. `import.meta.env.BASE_URL` was not used here.

**Consequences:** Favicon 404 (visible in browser DevTools). JSON-LD structured data URL mismatch (SEO penalty risk; Google Search Console warning).

**Prevention:** Replace hardcoded paths with `import.meta.env.BASE_URL`:
- Favicon: `href: \`${import.meta.env.BASE_URL}favicon.svg\``
- offersUrl: derive from `Astro.url` or from `site` config, not from a hardcoded string.

**Detection:** `grep -r "deep-dive-vm" src/` — must return zero results before go-live. The SEO test suite (`tests/seo/seo-meta.test.ts`) reads `dist/index.html` and will catch a malformed JSON-LD if the URL changes, but only if the test is run.

---

### CRIT-03: `_astro/` hashed asset paths break if base changes and public assets use absolute paths

**What goes wrong:** Astro prefixes all compiled asset URLs (`/_astro/index.DRf8.css`, `/_astro/...js`) with `import.meta.env.BASE_URL`. When `base` was `/deep-dive-vm/`, these resolved to `/deep-dive-vm/_astro/...`. After removing `base`, they resolve to `/_astro/...`. Any component that constructs asset src strings with an absolute `/` prefix (rather than using Astro's `import` pipeline) will break in the opposite direction.

**Special case — public/ images:** The project serves images from `public/images/claudio1.webp` etc. When referenced as absolute paths like `/images/claudio1.webp`, these worked because GitHub Pages was serving the repo at `/deep-dive-vm/` and the CNAME redirect handled root resolution. After the migration, if `base` is removed and a CNAME is in place, absolute `/images/...` paths resolve correctly to the domain root. However, any component that manually prepended `/deep-dive-vm/` to image src attributes will produce broken URLs.

**Why it happens:** Astro does not rewrite arbitrary strings — only paths processed through its asset pipeline (`import img from '../assets/img.png'`) or explicit `import.meta.env.BASE_URL` usage.

**Consequences:** Broken images, missing CSS, broken JS bundles — hard failures, immediately visible.

**Prevention:** Audit every `src=`, `href=`, and `url()` in components. Use Astro's image pipeline (`import`) for processed images, and `import.meta.env.BASE_URL` for public-directory references if base is non-root.

**Detection:** `npm run build && npx astro preview` — check browser DevTools Network tab for 404s on assets.

---

### CRIT-04: SEO test reads `dist/index.html` — path changes if the hub page structure changes

**What goes wrong:** `tests/seo/seo-meta.test.ts` and `tests/unit/components/Layout.test.ts` both hardcode `dist/index.html` as the file they parse. In the new architecture, `dist/index.html` will be the **hub page**, not the landing page. The landing page will be at `dist/deep-dive-vm/index.html`. All SEO assertions (title, description, OG tags, JSON-LD, `<h1>` count) are written for the landing page content. After migration, these tests will run against the hub page and likely pass vacuously or fail with wrong assertions.

**Why it happens:** The tests assume a single-page site. A two-page site with a hub breaks that assumption.

**Consequences:** SEO tests pass but test the wrong page. The landing page's SEO quality is no longer gated.

**Prevention:** Update tests to read `dist/deep-dive-vm/index.html` for landing page assertions. Add separate assertions for `dist/index.html` (hub page). Update the `DIST_INDEX` constant in both test files.

**Detection:** Run `npm run build` then check that `dist/deep-dive-vm/index.html` exists and `tests/seo/seo-meta.test.ts` references it.

---

### CRIT-05: Playwright `webServer.url` and `baseURL` both hardcode `/deep-dive-vm/`

**What goes wrong:** `playwright.config.ts` has:
```
baseURL: "http://localhost:4321/deep-dive-vm/"
webServer.url: "http://localhost:4321/deep-dive-vm/"
```
`astro preview` with `base: '/'` (or removed) serves at `http://localhost:4321/`. The `webServer` health check will fail or time out because it polls the old URL, which no longer exists. Tests that navigate to `./` via Playwright will resolve to `http://localhost:4321/deep-dive-vm/`, which is now the landing page — this part may accidentally still work, but tests targeting specific sections will be off.

**Why it happens:** Playwright's `webServer.url` is a liveness check — it polls that URL until the server responds. If the path is wrong, the CI job times out.

**Consequences:** CI E2E job hangs for 60 seconds then times out. All E2E tests fail in CI. Local tests also fail because the server health check points to the wrong URL.

**Prevention:** Update `playwright.config.ts`:
- `baseURL: "http://localhost:4321/"` for hub (or `"http://localhost:4321/deep-dive-vm/"` if testing the landing page directly)
- `webServer.url: "http://localhost:4321/"` to match
- Add a second project or override per-test-file for landing page tests at `/deep-dive-vm/`

**Detection:** Run `npm run build && npx playwright test --project=chromium` locally and observe the first connection failure.

---

### CRIT-06: Sitemap will generate incorrect URLs if `site` remains pointed at root but pages are at subpath

**What goes wrong:** `@astrojs/sitemap` uses `site` config (`https://mentoria.sertaoseracloud.com`) combined with discovered routes. With `base: '/'` removed and the landing page now at `src/pages/deep-dive-vm/index.astro`, the sitemap will emit `https://mentoria.sertaoseracloud.com/deep-dive-vm/` for the landing page and `https://mentoria.sertaoseracloud.com/` for the hub. This is actually correct — but only if `site` is set to the custom domain root and not the old subpath.

**The actual risk:** If anyone attempted to set `site: 'https://mentoria.sertaoseracloud.com/deep-dive-vm'` to preserve old behavior, the sitemap would emit double-prefixed paths like `https://mentoria.sertaoseracloud.com/deep-dive-vm/deep-dive-vm/`. This is a common cargo-cult error.

**Prevention:** Keep `site: 'https://mentoria.sertaoseracloud.com'` (current value). Remove `base`. Let file-based routing handle the `/deep-dive-vm/` path. Verify `dist/sitemap-0.xml` after build contains the correct absolute URLs.

**Detection:** `cat dist/sitemap-0.xml | grep loc` — all `<loc>` values must start with `https://mentoria.sertaoseracloud.com/` without double path segments.

---

## Moderate (degrades experience)

### MOD-01: Internal nav links in NavBar use fragment anchors — no change needed, but verify on hub page

**What goes wrong:** `NavBar.astro` uses `href="#metodo"`, `href="#ementa"`, etc. These are relative fragment links, so they correctly resolve regardless of `base`. On the landing page, they work fine. On the hub page, they will attempt to scroll to sections that don't exist, silently doing nothing.

**Why it happens:** The NavBar component is shared. The hub page likely needs a different navigation (links to `/deep-dive-vm/` rather than fragments).

**Consequences:** Broken navigation on the hub page — no error, just no scrolling.

**Prevention:** Either create a separate hub layout without the course NavBar, or pass a prop to NavBar to switch between "hub mode" (absolute links) and "landing mode" (fragment links).

---

### MOD-02: `package.json` `lighthouse` script points to `/deep-dive-vm/` — will test wrong URL

**What goes wrong:** The `lighthouse` script in `package.json` hardcodes `https://mentoria.sertaoseracloud.com/deep-dive-vm/`. After migration, the landing page will still be at that URL, so the script remains nominally correct. However, the hub at root will never be audited unless the script is updated or a second entry is added.

**Consequences:** No Lighthouse score for the hub page. If the hub has performance or SEO issues, CI won't catch them.

**Prevention:** Add a second `lighthouse` invocation for `https://mentoria.sertaoseracloud.com/` or use LHCI URL arrays to audit both pages.

---

### MOD-03: Lighthouse CI `staticDistDir` audits root `dist/` — new multi-page structure changes which page is audited

**What goes wrong:** `.lighthouserc.json` uses `staticDistDir: "./dist"`. LHCI with this setting starts a local static server and audits all discovered HTML files. With a second page added (`dist/index.html` for hub, `dist/deep-dive-vm/index.html` for landing), LHCI will now audit both. The hub page may fail the accessibility or SEO score thresholds (`categories:accessibility >= 0.9`, `categories:seo >= 0.9`) if it is minimal HTML.

**Why it happens:** LHCI crawls all pages in `staticDistDir`. A minimal hub page placeholder can score low on SEO (no meta description, no structured data).

**Consequences:** CI lighthouse job fails on the hub page even if the landing page is fine.

**Prevention:** Either add proper SEO meta tags to the hub page from the start, or configure LHCI `urls` to target only specific paths rather than relying on discovery from `staticDistDir`.

---

### MOD-04: `astro preview` base URL mismatch breaks local E2E workflow

**What goes wrong:** `npm run preview` with no `base` serves at `http://localhost:4321/`. The `npm run test:visual` script uses the Playwright config which was pointed at `/deep-dive-vm/`. Local developers running `npm run test:visual` will connect to the wrong URL until the config is updated.

**Consequences:** False test failures in local development. Developer confusion.

**Prevention:** Update Playwright config before running any tests post-migration.

---

### MOD-05: `offersUrl` in JSON-LD uses hardcoded subpath — will be stale if landing page moves

**What goes wrong:** In `Layout.astro`, the JSON-LD `offers.url` is:
```js
const offersUrl = `${siteOrigin}/deep-dive-vm#investimento`;
```
After migration, the landing page is served at `/deep-dive-vm/` via file routing. The URL `/deep-dive-vm#investimento` (no trailing slash before the fragment) may or may not resolve correctly depending on how GitHub Pages serves the directory index. Most servers redirect `/deep-dive-vm` to `/deep-dive-vm/` before the fragment resolves, but the JSON-LD anchor will still be off.

**Prevention:** Use `Astro.url` derived from the page's actual URL for structured data URLs. Or keep this hardcoded but verify the anchor resolves in Google's Rich Results Test after deploy.

---

### MOD-06: `robots.txt` is permissive but does not reference `Sitemap:` directive

**What goes wrong:** `public/robots.txt` contains only `User-agent: * / Allow: /`. It has no `Sitemap:` directive pointing to the generated sitemap. This is an existing gap, not introduced by the migration, but the migration changes the sitemap URL base (from a subpath to root), making this the right moment to fix it.

**Consequences:** Search crawlers must discover the sitemap through other means (Google Search Console submission). Not a hard failure, but a missed SEO opportunity.

**Prevention:** Add `Sitemap: https://mentoria.sertaoseracloud.com/sitemap-index.xml` to `public/robots.txt`.

---

## Prevention Strategies

### Strategy 1: Grep-based audit before config change

Before touching `astro.config.mjs`, run:
```bash
grep -r "deep-dive-vm" src/ tests/ public/ *.json *.mjs *.ts
```
Every result is a migration item. The current known list:
- `src/layouts/Layout.astro:16` — offersUrl
- `src/layouts/Layout.astro:48` — favicon href
- `playwright.config.ts:11` — baseURL
- `playwright.config.ts:36` — webServer.url
- `package.json:18` — lighthouse script URL

### Strategy 2: Build-and-inspect gate

After any config change, run `npm run build` and inspect `dist/`:
```bash
npm run build
ls dist/
ls dist/_astro/
cat dist/sitemap-0.xml
grep -r "deep-dive-vm" dist/
```
The last grep should only return intentional `/deep-dive-vm/` references (landing page path), not broken asset references.

### Strategy 3: CNAME verification in CI

Add a CI step after build to assert `dist/CNAME` exists and contains the correct domain:
```bash
test -f dist/CNAME && grep -q "mentoria.sertaoseracloud.com" dist/CNAME
```
This prevents silent domain loss on deploy.

### Strategy 4: Playwright webServer liveness before test run

Before migrating tests, verify the `webServer.url` actually responds:
```bash
npm run build && npm run preview &
sleep 3
curl -I http://localhost:4321/
```
If 404, the baseURL needs updating before any test can pass.

### Strategy 5: SEO test path update

Update `tests/seo/seo-meta.test.ts` and `tests/unit/components/Layout.test.ts`:
```diff
- const DIST_INDEX = join(__dirname, "../../dist/index.html");
+ const DIST_LANDING = join(__dirname, "../../dist/deep-dive-vm/index.html");
```
Run the SEO suite after every structural change to catch meta tag regressions.

### Strategy 6: Post-deploy smoke test

After the first deploy, run a minimal curl check:
```bash
curl -I https://mentoria.sertaoseracloud.com/          # hub — expect 200
curl -I https://mentoria.sertaoseracloud.com/deep-dive-vm/  # landing — expect 200
curl -I https://mentoria.sertaoseracloud.com/_astro/   # assets directory — expect 200 or 301
curl -I https://mentoria.sertaoseracloud.com/favicon.svg    # favicon — expect 200
```

---

## Phase-Specific Warnings

| Phase Topic | Pitfall | Mitigation |
|---|---|---|
| Remove/change `base` in `astro.config.mjs` | CRIT-02: Two hardcoded `/deep-dive-vm/` paths in Layout.astro will not auto-update | Grep src/ for all hardcoded paths before touching config. Fix favicon and offersUrl first. |
| Add `public/CNAME` | CRIT-01: Missing CNAME file means custom domain fails on every deploy | Create `public/CNAME` as the very first task; verify it appears in `dist/` after build |
| Move landing page to `src/pages/deep-dive-vm/index.astro` | CRIT-04: SEO tests read `dist/index.html` which will now be the hub page | Update `DIST_INDEX` in both SEO and Layout tests to point to `dist/deep-dive-vm/index.html` |
| Update Playwright config | CRIT-05: `webServer.url` polls old path, causing CI timeout | Change both `baseURL` and `webServer.url` to `http://localhost:4321/` before running any E2E |
| Build and deploy | CRIT-06: Sitemap may double-prefix paths if `site` is misconfigured | Keep `site` at root domain, not at subpath. Inspect `dist/sitemap-0.xml` before every deploy. |
| Add hub page | MOD-01: NavBar fragment links (#section) are meaningless on hub page | Create hub-specific layout without landing NavBar, or guard with a prop |
| Lighthouse CI | MOD-03: LHCI audits all pages in `staticDistDir` — minimal hub may fail score thresholds | Add proper SEO meta to hub page before enabling LHCI, or restrict LHCI `urls` to specific paths |
| JSON-LD structured data | MOD-05: `offersUrl` hardcoded to `/deep-dive-vm#investimento` may break with routing change | Verify anchor resolves post-deploy; consider deriving URL from `Astro.url` |
| robots.txt | MOD-06: No `Sitemap:` directive — missed opportunity to fix during migration | Add `Sitemap: https://mentoria.sertaoseracloud.com/sitemap-index.xml` to `public/robots.txt` |

---

## Sources

- [Astro Configuration Reference — `base`](https://docs.astro.build/en/reference/configuration-reference/#base)
- [Astro Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [Astro Sitemap Integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Astro issue #4229 — base option producing unexpected asset paths](https://github.com/withastro/astro/issues/4229)
- [Astro issue #6504 — image asset paths not resolved with base in site config](https://github.com/withastro/astro/issues/6504)
- [Static assets in Astro with base config — spuxx.dev](https://spuxx.dev/blog/2023/astro-assets-base/)
- [GitHub Docs — Managing a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Docs — Troubleshooting custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
- [Playwright Test Configuration — baseURL](https://playwright.dev/docs/test-configuration)
- [Playwright Web Server configuration](https://playwright.dev/docs/test-webserver)
- [Lighthouse CI configuration reference](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html)
