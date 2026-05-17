# Phase 8: Multi-LP Scaffold - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 5 (4 new, 1 modified)
**Analogs found:** 4 / 4 code files (HOWTO is documentation — no code analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/deep-dive-ec2/index.astro` | page (SSG component) | request-response | `src/pages/index.astro` | exact — same Layout.astro without NavBar/Footer, same ogImage prop, same skip-link + main structure |
| `public/ec2-og.png` | static asset | file-I/O (build-time script) | `public/hub-og.png` | exact — same sharp script, same 1200×630 dimensions |
| `tests/e2e/ec2-coming-soon.spec.ts` | test (E2E) | request-response | `tests/e2e/hub.spec.ts` | exact — same 3 describe blocks, same AxeBuilder pattern, same responsive test |
| `tests/seo/seo-meta.test.ts` (MODIFY — add test 16) | test (unit/SEO) | file-I/O | `tests/seo/seo-meta.test.ts` test 15 (same file) | exact — test 15 is the direct template |
| `HOWTO-new-landing-page.md` | documentation | n/a | none | no code analog — use RESEARCH.md Q5 for content |

---

## Pattern Assignments

### `src/pages/deep-dive-ec2/index.astro` (page, request-response)

**Analog:** `src/pages/index.astro`

**Imports pattern** (lines 1-8 of analog):
```astro
---
import Layout from "../layouts/Layout.astro";
// EC2 page does NOT need Image, socialLinks, courses, or SocialIcon
// Minimal import — Layout only:
import Layout from "../../layouts/Layout.astro";
---
```
Note: relative path differs because the file is two levels deep (`src/pages/deep-dive-ec2/`), matching the LP analog at `src/pages/deep-dive-vm/index.astro` line 2.

**Layout props pattern** (lines 10-15 of analog — hub page):
```astro
<Layout
  title="Cláudio Rapôso — O Sertão será Cloud"
  description="Formação técnica de alto impacto em cloud. Azure VM, EC2 e mais."
  url="https://mentoria.sertaoseracloud.com/"
  ogImage="/hub-og.png"
>
```
Copy this pattern for EC2; substitute all four prop values:
- `title` → `"Deep Dive EC2 — Em breve · O Sertão será Cloud"`
- `description` → `"Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática. Em breve na plataforma."`
- `url` → `"https://mentoria.sertaoseracloud.com/deep-dive-ec2/"`
- `ogImage` → `"/ec2-og.png"` (leading slash is mandatory — see Pitfall 3 in RESEARCH.md)
- Do NOT pass `noindex` (omit prop entirely — Layout defaults to `false`)
- Do NOT pass `jsonLd` (not required for LP-lite teaser)

**Skip-link + main structure** (lines 16-18 of analog):
```astro
  <a href="#conteudo-principal" class="skip-link">Pular para o conteúdo</a>

  <main id="conteudo-principal" tabindex="-1" aria-label="Página do curso Deep Dive EC2">
```
Copy verbatim; update `aria-label` for EC2.

**CSS token pattern** (lines 102-108, 215-234 of analog — shared via Layout.astro `:root`):
```css
/* Available design tokens — do NOT redefine these in the EC2 page <style> */
--nucleo-eletrico: #00ffff;   /* hover color for back-link */
--texto-principal: #ffffff;    /* h1 color */
--texto-secundario: #d1d9e6;  /* paragraph color */
--texto-terciario: #8a99b5;   /* back-link default color */
--alerta: #ffb547;             /* badge-coming-soon color */
```

**Badge pattern** (lines 215-234 of analog — hub course cards use the same badge):
```css
.badge {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  padding: 2px 8px;
  border-radius: 2px;
  white-space: nowrap;
}

.badge-coming-soon {
  color: var(--alerta);
  border: 1px solid var(--alerta);
}
```
Copy this CSS block directly into the EC2 page `<style>` tag.

**Container + responsive pattern** (lines 76-82, 258-260 of analog):
```css
.hub-container {         /* rename to .ec2-container in EC2 page */
  max-width: 480px;
  margin: 0 auto;
  padding: 48px 32px;
  position: relative;
  z-index: 1;
}

@media (max-width: 480px) {
  .hub-container { padding: 48px 16px; }
}
```

**Heading typography** (lines 102-109 of analog):
```css
h1 {
  font-family: "Chakra Petch", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--texto-principal);
  margin: 0;
}
```

---

### `public/ec2-og.png` (static asset, file-I/O build-time script)

**Analog:** `public/hub-og.png` (generated in Phase 7, Plan 01, Task 4)

**Sharp script pattern** (from `07-01-PLAN.md` Task 4 — verified via `sharp().metadata()` returning `{format:'png',width:1200,height:630}`):
```javascript
// Script: gerar-ec2-og.mjs (run then delete — do NOT commit the script)
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

await sharp(join(__dirname, 'src/assets/claudio1.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png()
  .toFile(join(__dirname, 'public/ec2-og.png'));

console.log('ec2-og.png gerado: 1200x630');
```

**Verification command** (run after script, before first `npm run build`):
```bash
node -e "import('sharp').then(s=>s.default('public/ec2-og.png').metadata().then(m=>console.log(m.width,m.height,m.format)))"
# Expected output: 1200 630 png
```

**Critical ordering constraint:** Generate `public/ec2-og.png` BEFORE `src/pages/deep-dive-ec2/index.astro` is built for the first time. The build will succeed without the file, but the deployed og:image URL will 404.

---

### `tests/e2e/ec2-coming-soon.spec.ts` (test, request-response)

**Analog:** `tests/e2e/hub.spec.ts`

**Imports pattern** (lines 1-2 of analog):
```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
```
Copy verbatim — no changes needed.

**Describe block structure** (lines 22-134 of analog — 3 describe blocks):
```typescript
test.describe("Hub load", () => { ... });       // → "EC2 coming-soon load"
test.describe("Hub accessibility", () => { ... }); // → "EC2 coming-soon accessibility"
test.describe("Hub responsive", () => { ... }); // → "EC2 coming-soon responsive"
```
Mirror this 3-block structure; rename descriptors to EC2.

**HTTP 200 test pattern** (lines 23-26 of analog):
```typescript
test("GET / returns HTTP 200", async ({ page }) => {
  const response = await page.goto("./");
  expect(response?.status()).toBe(200);
});
```
For EC2: `page.goto("./deep-dive-ec2/")` — note the relative path matches the Playwright baseURL config.

**Visibility test pattern** (lines 28-31 of analog):
```typescript
test("<h1> is visible on the page", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("h1")).toBeVisible();
});
```
EC2 version adds `.toContainText("Deep Dive EC2")` assertion.

**axe-core critical violations pattern** (lines 102-120 of analog):
```typescript
test("no critical axe-core violations on hub (WCAG 2.0 A/AA)", async ({ page }) => {
  await page.goto("./");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  const criticalViolations = results.violations.filter(
    (v) => v.impact === "critical"
  );

  if (criticalViolations.length > 0) {
    console.error(
      "Critical a11y violations:",
      JSON.stringify(criticalViolations, null, 2)
    );
  }

  expect(criticalViolations).toHaveLength(0);
});
```
Copy verbatim; change `page.goto("./")` to `page.goto("./deep-dive-ec2/")`.

**Responsive test pattern** (lines 123-134 of analog):
```typescript
test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await expect(page.locator("h1")).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);
});
```
Copy verbatim; change goto URL.

**EC2-specific tests** (no analog — new assertions for this page):
```typescript
// Badge visibility — uses CSS class from the EC2 page
test("badge EM BREVE is visible", async ({ page }) => {
  await page.goto("./deep-dive-ec2/");
  await expect(page.locator(".badge-coming-soon")).toBeVisible();
  await expect(page.locator(".badge-coming-soon")).toContainText("EM BREVE");
});

// Back link — specific to LP-lite pattern
test("back link to hub is present and points to /", async ({ page }) => {
  await page.goto("./deep-dive-ec2/");
  const backLink = page.locator("a.back-link");
  await expect(backLink).toBeVisible();
  const href = await backLink.getAttribute("href");
  expect(href).toBe("/");
});
```

---

### `tests/seo/seo-meta.test.ts` — test 16 addition (test, file-I/O)

**Analog:** test 15 in the same file (lines 177-184)

**Test 15 — direct template** (lines 177-184 of `tests/seo/seo-meta.test.ts`):
```typescript
it("15. dist/index.html og:image points to hub-og.png", () => {
  const hubIndexPath = join(DIST_DIR, "index.html");
  expect(existsSync(hubIndexPath), `dist/index.html not found at ${hubIndexPath}`).toBe(true);
  const hubHtml = readFileSync(hubIndexPath, "utf-8");
  const ogImage = extractMetaContent(hubHtml, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("hub-og.png");
});
```

**Test 16 — copy and substitute** (append after line 184, inside the same `describe` block):
```typescript
it("16. dist/deep-dive-ec2/index.html og:image points to ec2-og.png", () => {
  const ec2IndexPath = join(DIST_DIR, "deep-dive-ec2/index.html");
  expect(
    existsSync(ec2IndexPath),
    `dist/deep-dive-ec2/index.html not found at ${ec2IndexPath}`
  ).toBe(true);
  const ec2Html = readFileSync(ec2IndexPath, "utf-8");
  const ogImage = extractMetaContent(ec2Html, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("ec2-og.png");
});
```

**Critical constraint — do NOT reuse module-level variables** (lines 18-29 of `tests/seo/seo-meta.test.ts`):
```typescript
// These are declared at module level and point to deep-dive-vm, NOT deep-dive-ec2:
const DIST_INDEX = join(__dirname, "../../dist/deep-dive-vm/index.html");
let html = "";
// beforeAll() loads DIST_INDEX into html

// Test 16 MUST declare its own path inline (same pattern as tests 14 and 15)
// NEVER use `html` or `DIST_INDEX` in test 16 — silent false positive risk
```

**Available helpers — no new imports needed** (lines 1-4, 17-19 of analog):
```typescript
// Already imported and available in test 16:
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
const DIST_DIR = join(__dirname, "../../dist");  // line 19 — use this constant
// extractMetaContent() — defined at line 39, available module-wide
```

**Optional addition — test 14 sitemap assertion** (lines 169-175 of analog, extend inside existing test):
```typescript
// Current test 14 verifies / and /deep-dive-vm/
// Per RESEARCH.md Q2 open question: add EC2 assertion as a third expect in test 14
expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/deep-dive-ec2/");
```
This is at Claude's discretion (RESEARCH.md Open Question 2). Adding it to test 14 is the least disruptive approach.

---

### `HOWTO-new-landing-page.md` (documentation)

**No code analog.** Content is fully specified in RESEARCH.md Q5 (7 steps), referencing EC2 as the live example. See RESEARCH.md lines 471-506 for the complete step outline.

---

## Shared Patterns

### Layout.astro Props Interface
**Source:** `src/layouts/Layout.astro` lines 5-13
**Apply to:** `src/pages/deep-dive-ec2/index.astro` and HOWTO documentation
```typescript
interface Props {
  title: string;
  description?: string;
  url?: string;
  offersUrl?: string;
  ogImage?: string;    // path with leading slash, e.g. "/ec2-og.png"
  noindex?: boolean;   // default: false — omit to keep page indexed
  jsonLd?: Record<string, unknown>;
}
```
Key rule: `ogImage` concatenated as `${siteOrigin}${ogImage}` (line 19) — leading slash is mandatory.

### CSS Design Tokens
**Source:** `src/layouts/Layout.astro` lines 120-137 (`:root` block in global style)
**Apply to:** `src/pages/deep-dive-ec2/index.astro` `<style>` block
```css
/* Consume via var() — do NOT redefine these */
--nucleo-eletrico: #00ffff;
--texto-principal: #ffffff;
--texto-secundario: #d1d9e6;
--texto-terciario: #8a99b5;
--alerta: #ffb547;
--hairline: rgba(209, 217, 230, 0.12);
--hairline-strong: rgba(0, 255, 255, 0.32);
```

### Skip-Link Accessibility Pattern
**Source:** `src/pages/index.astro` line 16 + `src/layouts/Layout.astro` lines 102-116 (global `.skip-link` CSS)
**Apply to:** `src/pages/deep-dive-ec2/index.astro`
```astro
<a href="#conteudo-principal" class="skip-link">Pular para o conteúdo</a>
<main id="conteudo-principal" tabindex="-1" aria-label="...">
```
The `.skip-link` CSS is already in Layout.astro global styles — do not add it again.

### Playwright Page Navigation Pattern
**Source:** `tests/e2e/hub.spec.ts` lines 24, 29, etc.
**Apply to:** `tests/e2e/ec2-coming-soon.spec.ts`
```typescript
// All tests use relative goto — matches playwright.config.ts baseURL: "http://localhost:4321/"
await page.goto("./deep-dive-ec2/");
// NOT: page.goto("http://localhost:4321/deep-dive-ec2/")
// NOT: page.goto("/deep-dive-ec2/")
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `HOWTO-new-landing-page.md` | documentation | n/a | No existing developer HOWTO docs in the repo. Content fully specified in RESEARCH.md Q5 (7 steps). Use that outline directly. |
| `public/ec2-og.png` (the PNG itself) | static asset | n/a | Binary file — the pattern is the sharp generation script, not the file. See Pattern Assignment above. |

---

## Anti-Patterns (from RESEARCH.md — apply during planning)

| Anti-Pattern | Risk | Correct Pattern |
|---|---|---|
| Reuse `html` or `DIST_INDEX` in test 16 | Silent false positive — test passes against LP content, not EC2 | Declare `ec2IndexPath` and `ec2Html` locally inside the `it()` |
| Pass `ogImage="ec2-og.png"` (no leading slash) | OG URL becomes `https://mentoria.sertaoseracloud.comec2-og.png` | Always `ogImage="/ec2-og.png"` |
| Create `index.astro` before generating PNG | Build succeeds but deployed og:image 404s | Generate PNG first, verify with `.metadata()`, then create page |
| Add `filter()` to sitemap config | Prevents EC2 from appearing in sitemap | Sitemap auto-discovers all routes — no `astro.config.mjs` changes needed |

---

## Metadata

**Analog search scope:** `src/pages/`, `src/layouts/`, `tests/e2e/`, `tests/seo/`
**Files read:** 5 source files (`src/pages/index.astro`, `src/layouts/Layout.astro`, `src/pages/deep-dive-vm/index.astro` first 40 lines, `tests/e2e/hub.spec.ts`, `tests/seo/seo-meta.test.ts`)
**Pattern extraction date:** 2026-05-17
