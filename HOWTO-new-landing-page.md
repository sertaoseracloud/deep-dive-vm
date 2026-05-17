# HOWTO: Adding a New Landing Page

This checklist documents the canonical process for adding a new LP-lite "coming soon" page
to the platform. It is derived from the EC2 page created in Phase 8 (`src/pages/deep-dive-ec2/`),
which is the live, in-repo proof these steps produce a working page.

**Live example:** `src/pages/deep-dive-ec2/index.astro` + `public/ec2-og.png`

---

## 1. Create src/pages/[slug]/index.astro

Copy `src/pages/deep-dive-ec2/index.astro` verbatim and substitute the five props:

```astro
<Layout
  title="[Course Name] — Em breve · O Sertão será Cloud"
  description="[2-3 sentence description of the course.]"
  url="https://mentoria.sertaoseracloud.com/[slug]/"
  ogImage="/[slug]-og.png"
>
```

**Critical constraints (both required — do not omit):**

- `ogImage` MUST have a leading slash: `/[slug]-og.png`. Without it, Layout.astro concatenates
  `siteOrigin + ogImage` and produces `https://mentoria.sertaoseracloud.com[slug]-og.png`
  — an invalid URL (Pitfall 2: ogImage without leading slash).
- `noindex` and `jsonLd` MUST be omitted for coming-soon LPs. These pages are indexed from day
  one to generate early SEO signals. Adding `noindex` blocks crawling; adding `jsonLd` adds
  structured data not appropriate for a teaser page.

Keep the `<main>` structure (`.back-link → h1 → .badge-coming-soon → p`) and CSS tokens
(`--nucleo-eletrico`, `--texto-principal`, Space Grotesk) identical to the EC2 analog.

---

## 2. Add entry to src/data/courses.ts

Append an object to the `courses` array:

```typescript
{
  title: '[Course Name]',
  description: '[Short description — 1 sentence max.]',
  url: '/[slug]/',
  status: 'coming-soon',
},
```

The hub (`src/pages/index.astro`) renders the `courses` array automatically — no changes to
the hub page are needed. EC2 is already declared in this array as the live reference.

---

## 3. Generate public/[slug]-og.png placeholder (1200x630)

**Do this BEFORE creating the page** (Pitfall 3: creating `index.astro` before generating PNG).
The build succeeds even without the PNG, but the `og:image` meta tag will point to a missing
asset, breaking social previews silently.

Create a temporary helper script (e.g., `gen-[slug]-og.mjs`) at the repo root:

```js
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
await sharp(join(__dirname, 'src/assets/claudio1.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png()
  .toFile(join(__dirname, 'public/[slug]-og.png'));
console.log('Generated public/[slug]-og.png');
```

Run it: `node gen-[slug]-og.mjs`

Verify dimensions:

```bash
node -e "import('sharp').then(s=>s.default('public/[slug]-og.png').metadata().then(m=>console.log(m.width,m.height,m.format)))"
```

Expected output: `1200 630 png`

**DELETE the helper script after running.** Commit only the PNG, not `gen-[slug]-og.mjs`.

---

## 4. Create tests/e2e/[slug]-coming-soon.spec.ts

Copy `tests/e2e/ec2-coming-soon.spec.ts` verbatim and substitute:

- Describe titles: replace `"EC2 Coming Soon"` with `"[Course Name] Coming Soon"`
- Navigation: replace `./deep-dive-ec2/` with `./[slug]/`
- Text assertions: replace h1 and badge text where the EC2 course name is referenced

**Critical:** Use **relative** `./[slug]/` URLs in `page.goto()` — NOT absolute URLs, NOT
leading-slash paths. Playwright's `baseURL` in `playwright.config.ts` handles the prefix.

The spec follows the 3-describe-block structure (page load, accessibility, responsive). Do not
collapse or rename these blocks — CI auto-discovers all specs in `tests/e2e/` via glob and any
change in structure may affect the job summary output.

---

## 5. Add SEO test to tests/seo/seo-meta.test.ts

Append an `it()` block at the end of the `"Sitemap content assertions"` describe, or create a
new `describe` block immediately after:

```typescript
it("16. deep-dive-[slug] og:image references [slug]-og.png", () => {
  const ec2IndexPath = join(DIST_DIR, "[slug]/index.html");
  if (!existsSync(ec2IndexPath)) {
    throw new Error(
      `dist/[slug]/index.html not found. Run 'npm run build' first.`
    );
  }
  const [slug]Html = readFileSync(ec2IndexPath, "utf-8");
  const ogImage = extractMetaContent([slug]Html, "og:image");
  expect(ogImage).toContain("[slug]-og.png");
});
```

**CRITICAL — Pitfall 1 (silent false positive):** NEVER reuse the module-level `DIST_INDEX`
or `html` variables. Both point to `dist/deep-dive-vm/index.html`. Reusing them means the test
verifies the VM page's `og:image`, not the new page — but the test passes anyway (false positive).
Always declare a local `[slug]IndexPath` and local `[slug]Html` inside the `it()` block,
as shown above. `DIST_DIR` is already declared at module scope and can be reused safely.

Available helpers (no additional imports needed): `existsSync`, `readFileSync`, `join`,
`DIST_DIR`, `extractMetaContent`.

---

## 6. Validate locally

Run these commands in order:

```bash
npm run build
```

Expected: exits 0, `dist/[slug]/index.html` created, `dist/sitemap-0.xml` includes the new URL.

```bash
npx playwright test tests/e2e/[slug]-coming-soon.spec.ts --project=chromium
```

Expected: exits 0, all tests in the spec pass. Playwright's `webServer` config in
`playwright.config.ts` starts the dev server automatically — no manual server startup needed.

```bash
npx vitest run tests/seo/seo-meta.test.ts
```

Expected: exits 0, including the new test 16 you added. If this fails with "file not found",
run `npm run build` first.

Full suite (run before pushing):

```bash
npm run test:all && npx playwright test
```

Both must exit 0.

---

## 7. Deploy checklist

**Stage only these files** — do NOT commit the helper sharp script:

- `src/pages/[slug]/index.astro` (new)
- `public/[slug]-og.png` (new)
- `src/data/courses.ts` (modified — new entry appended)
- `tests/e2e/[slug]-coming-soon.spec.ts` (new)
- `tests/seo/seo-meta.test.ts` (modified — new it() block appended)

After pushing to `main`:

1. Verify GitHub Actions test workflow goes green (job: `e2e-chromium` + `unit-and-seo`).
2. Verify CNAME survives in `dist/`:
   ```bash
   grep mentoria.sertaoseracloud.com dist/CNAME
   ```
   Expected output: `mentoria.sertaoseracloud.com`
3. Verify the live route returns HTTP 200:
   ```bash
   curl -I https://mentoria.sertaoseracloud.com/[slug]/
   ```
   Expected: `HTTP/2 200`

**No changes needed to:**
- `.lhcirc.json` or `.lighthouserc.json` — these audit `/deep-dive-vm/` explicitly; new coming-soon
  pages are out of scope for Lighthouse audits until they have real content.
- `astro.config.mjs` — sitemap auto-discovers all routes; no filter additions needed.
- `.github/workflows/` — CI auto-discovers `tests/e2e/[slug]-coming-soon.spec.ts` via glob.

---

## Live Example

These files are the concrete proof these 7 steps produce a working page:

| Step | File |
|------|------|
| 1 — Page | `src/pages/deep-dive-ec2/index.astro` |
| 2 — courses.ts entry | `src/data/courses.ts` (EC2 entry, lines 17-22) |
| 3 — OG placeholder | `public/ec2-og.png` (1200×630, generated via sharp) |
| 4 — E2E spec | `tests/e2e/ec2-coming-soon.spec.ts` |
| 5 — SEO test | `tests/seo/seo-meta.test.ts` (test 16) |

---

## Anti-patterns

Avoid these four pitfalls confirmed during Phase 8 implementation:

1. **Reusing `DIST_INDEX` / `html` in SEO test** — both point to `dist/deep-dive-vm/index.html`.
   Always declare a local path and local HTML variable inside the `it()` block (see Step 5).

2. **`ogImage` without leading slash** — Layout.astro concatenates `siteOrigin + ogImage`
   directly. `"ec2-og.png"` produces `https://mentoria.sertaoseracloud.comec2-og.png`.
   Always use `"/[slug]-og.png"` (see Step 1).

3. **Creating `index.astro` before generating the PNG** — the build succeeds but the `og:image`
   meta tag references a missing asset. Generate the PNG first (see Step 3).

4. **Adding a `filter()` to `astro.config.mjs` sitemap** — the sitemap has no filter since
   Phase 7. New indexed routes appear automatically. Do not add exclusion filters
   unless a page explicitly opts out via the `noindex` prop.
