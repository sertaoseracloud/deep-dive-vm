# Phase 7: Hub Page - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 9 (new/modified)
**Analogs found:** 9 / 9

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/pages/index.astro` | page/view | request-response (SSG) | `src/pages/deep-dive-vm/index.astro` | exact |
| `src/data/social-links.ts` | data/model | static export | `src/data/` (new pattern — no analog) | none |
| `src/data/courses.ts` | data/model | static export | `src/data/` (new pattern — no analog) | none |
| `src/components/ui/SocialIcon.astro` | component/ui | transform (prop → SVG) | `src/components/layout/Footer.astro` (SVG inline) | partial |
| `src/layouts/Layout.astro` | layout | request-response (SSG) | itself (surgical modification) | exact — self |
| `public/hub-og.png` | static asset | file-I/O | `public/` (claudio1.png style) | exact |
| `tests/e2e/hub.spec.ts` | test/E2E | event-driven | `tests/e2e/homepage.spec.ts` | exact |
| `tests/unit/components/Layout.test.ts` | test/unit | CRUD (read dist HTML) | itself (add new `it()` blocks) | exact — self |
| `tests/seo/seo-meta.test.ts` | test/seo | CRUD (read dist HTML) | itself (add new `it()` blocks) | exact — self |

---

## Pattern Assignments

### `src/pages/index.astro` (page/view, request-response SSG)

**Analog:** `src/pages/deep-dive-vm/index.astro`

**Imports pattern** (lines 1-21 of analog):
```astro
---
import Layout from "../../layouts/Layout.astro";
import { Image } from "astro:assets";
import claudio2 from "../../assets/claudio2.png";
import { socialLinks } from "../../data/social-links";
import { courses } from "../../data/courses";
import SocialIcon from "../../components/ui/SocialIcon.astro";
---
```
Note: hub uses `../` (one level deep from `src/pages/`) instead of `../../` (two levels from `src/pages/deep-dive-vm/`).

**Layout invocation pattern** (lines 23-28 of analog):
```astro
<Layout
  title="Deep Dive Azure VM · O Sertao será Cloud"
  description="Formação de 54h..."
  url={Astro.url.toString()}
  offersUrl="https://..."
>
```
Hub equivalent — passes `ogImage` prop (new) and `url` with literal string (no `Astro.url` needed for canonical):
```astro
<Layout
  title="Cláudio Rapôso — O Sertão será Cloud"
  description="Formação técnica de alto impacto em cloud. Azure VM, EC2 e mais. Acesse os cursos e redes do mentor."
  url="https://mentoria.sertaoseracloud.com/"
  ogImage="/hub-og.png"
>
```

**Skip link pattern** (line 29 of analog):
```astro
<a href="#main" class="skip-link">Pular para o conteúdo</a>
```
Hub uses `#conteudo-principal` per UI-SPEC (different anchor ID than the LP):
```astro
<a href="#conteudo-principal" class="skip-link">Pular para o conteúdo</a>
```

**Main element pattern** (line 32 of analog):
```astro
<main id="main" tabindex="-1">
```
Hub equivalent (UI-SPEC §Interaction Contract):
```astro
<main id="conteudo-principal" tabindex="-1" aria-label="Hub de cursos e redes sociais">
```

**Image usage pattern** — from `src/components/sections/Mentor.astro` lines 4-13:
```astro
import { Image } from "astro:assets";
import claudio2 from "../../assets/claudio2.png";

<Image src={claudio2} alt="Cláudio Filipe Lima Raposo" loading="lazy" />
```
Hub uses `loading="eager"` (photo is above the fold — LCP critical) and adds circular styles:
```astro
<Image
  src={claudio2}
  alt="Cláudio Filipe Lima Raposo — mentor"
  width={128}
  height={128}
  class="mentor-photo"
  loading="eager"
/>
```

**CSS design token pattern** — from `src/layouts/Layout.astro` lines 148-165 (`:root` block). Hub-specific scoped CSS inherits all global tokens; local declarations use:
```css
/* tokens already global — use directly */
var(--abismo-profundo)    /* background */
var(--sub-nivel)          /* card background */
var(--nucleo-eletrico)    /* accent: photo border, hover states */
var(--texto-principal)    /* h1, card titles */
var(--texto-secundario)   /* bio, card descriptions */
var(--texto-terciario)    /* icon base color */
var(--sucesso)            /* ATIVO badge */
var(--alerta)             /* EM BREVE badge */
var(--hairline)           /* card border base */
var(--hairline-strong)    /* card border hover, hr divider */
```

**Reduced-motion pattern** — from `src/components/ui/Button.astro` lines 122-130:
```css
@media (prefers-reduced-motion: reduce) {
  .btn {
    will-change: auto;
    transition: none;
  }
  .btn:hover {
    transform: none;
  }
}
```
Apply to all transitions in hub (icon hover, card hover, card translateY).

---

### `src/layouts/Layout.astro` (layout, request-response — surgical modification)

**Analog:** itself (self-modification — no separate analog needed)

**Current Props interface** (lines 5-10):
```astro
interface Props {
  title: string;
  description?: string;
  url?: string;
  offersUrl?: string;
}
```
Add two new optional props (zero breaking change to LP):
```astro
interface Props {
  title: string;
  description?: string;
  url?: string;
  offersUrl?: string;
  ogImage?: string;   // NEW — path from site root e.g. "/hub-og.png"
  noindex?: boolean;  // NEW — astro-seo native prop; default false
}
```

**Current ogImageUrl computation** (line 15):
```astro
const ogImageUrl = `${siteOrigin}${claudio1.src}`;
```
Replace with conditional fallback (LP keeps claudio1.png; hub gets hub-og.png):
```astro
const ogImageUrl = ogImage
  ? `${siteOrigin}${ogImage}`
  : `${siteOrigin}${claudio1.src}`;
```

**Current `<SEO>` component invocation** (lines 23-70) — add `noindex` prop:
```astro
<SEO
  title={title}
  description={resolvedDescription}
  noindex={noindex ?? false}   <!-- ADD THIS LINE -->
  openGraph={{ ... }}
  twitter={{ ... }}
  extend={{ ... }}
/>
```

**Destructuring line** (line 12) — extend to include new props:
```astro
const { title, description, url, offersUrl, ogImage, noindex } = Astro.props;
```

---

### `src/components/ui/SocialIcon.astro` (component/ui, transform)

**Analog:** `src/components/layout/Footer.astro` (SVG inline pattern) + `src/components/ui/Button.astro` (Props interface pattern)

**Props interface pattern** — from `src/components/ui/Button.astro` lines 1-8:
```astro
---
interface Props {
  href: string;
  variant?: "primary" | "ghost" | "solid-core";
  ...
}
const { href, variant = "primary", ... } = Astro.props;
---
```
Applied to SocialIcon:
```astro
---
interface Props {
  name: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin';
  ariaLabel: string;
}
const { name, ariaLabel } = Astro.props;
---
```

**SVG inline pattern** — from `src/components/layout/Footer.astro` line 9:
```astro
<svg class="star-mark" viewBox="0 0 24 24" fill="url(#bgs2)">
```
SocialIcon uses Bootstrap Icons viewBox (16×16) and `fill="currentColor"` for CSS color inheritance:
```astro
<svg
  viewBox="0 0 16 16"
  width="24"
  height="24"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path d={paths[name]} />
</svg>
```

**`aria-hidden="true"` pattern for decorative SVG:** The `aria-label` belongs on the `<a>` wrapper in `index.astro`, not on the SVG. The SVG is `aria-hidden="true"` + `focusable="false"` (IE11 compat).

**Record-based variant switching** — analogous to `Button.astro` classList construction (lines 19-26). For SocialIcon, use a `Record<Props['name'], string>` for path data:
```astro
const paths: Record<Props['name'], string> = {
  instagram: "M8 0C5.829 ...",
  youtube: "M8.051 1.999h...",
  whatsapp: "M13.601 2.326...",
  linkedin: "M0 1.146C0 ..."
};
```
Full path data is in `07-RESEARCH.md` §SVG Paths para Ícones Sociais.

---

### `src/data/social-links.ts` (data/model, static export)

**No existing analog** — `src/data/` directory does not yet exist in the project. This is a new pattern.

**TypeScript interface pattern** — modeled after the typed Props interfaces used consistently in `.astro` files (`Button.astro`, `SectionHead.astro`). Use `interface` + `export const array`:

```typescript
export type SocialIcon = 'instagram' | 'youtube' | 'whatsapp' | 'linkedin';

export interface SocialLink {
  name: string;
  url: string;
  icon: SocialIcon;
  ariaLabel: string;  // cultural context baked in — not derivable from name
}

export const socialLinks: SocialLink[] = [
  { name: 'Instagram', url: 'https://instagram.com/sertaoseracloud', icon: 'instagram', ariaLabel: 'Seguir no Instagram' },
  { name: 'YouTube', url: 'https://youtube.com/@sertaoseracloud', icon: 'youtube', ariaLabel: 'Assistir no YouTube' },
  { name: 'WhatsApp', url: 'https://wa.me/PLACEHOLDER', icon: 'whatsapp', ariaLabel: 'Contato via WhatsApp' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/cfraposo/', icon: 'linkedin', ariaLabel: 'Conectar no LinkedIn' },
];
```

---

### `src/data/courses.ts` (data/model, static export)

**No existing analog** — same new pattern as `social-links.ts`.

```typescript
export type CourseStatus = 'active' | 'coming-soon';

export interface Course {
  title: string;
  description: string;
  url: string;
  status: CourseStatus;
}

export const courses: Course[] = [
  {
    title: 'Deep Dive Azure VM',
    description: 'Formação técnica de 54h — Azure VMs, Terraform e Well-Architected Framework.',
    url: '/deep-dive-vm/',
    status: 'active',
  },
  {
    title: 'Deep Dive EC2',
    description: 'Formação técnica focada em AWS EC2 — em preparação.',
    url: '/deep-dive-ec2/',
    status: 'coming-soon',
  },
];
```

---

### `public/hub-og.png` (static asset, file-I/O)

**Analog:** `src/assets/claudio1.png` (source) + `public/` convention (destination)

**Creation pattern** — `sharp` is already installed (`^0.34.5` in `package.json`). Use a one-shot script to resize `claudio1.png` to 1200×630:
```javascript
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
await sharp(join(__dirname, 'src/assets/claudio1.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png()
  .toFile(join(__dirname, 'public/hub-og.png'));
```

**Constraint:** File must exist in `public/` before `npm run build`. Astro copies `public/` to `dist/` verbatim without processing. The file is referenced as `/hub-og.png` which resolves to `dist/hub-og.png` after build.

---

### `tests/e2e/hub.spec.ts` (test/E2E, event-driven)

**Analog:** `tests/e2e/homepage.spec.ts` (exact role match)

**Imports + setup pattern** (lines 1-15 of analog):
```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// baseURL is configured in playwright.config.ts as http://localhost:4321/
// Requires: npm run build && npm run preview
```

**Smoke test pattern** (lines 16-31 of analog):
```typescript
test.describe("Homepage load", () => {
  test("GET / returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./deep-dive-vm/");
    expect(response?.status()).toBe(200);
  });

  test("<h1> is visible on the page", async ({ page }) => {
    await page.goto("./deep-dive-vm/");
    await expect(page.locator("h1")).toBeVisible();
  });
```
Hub equivalent navigates to `"./"` (root) instead of `"./deep-dive-vm/"`.

**Responsive viewport pattern** (lines 79-107 of analog):
```typescript
test.describe("Responsive viewports", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-vm/");
    await expect(page.locator("h1")).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
  });
```

**Axe accessibility check pattern** (lines 109-131 of analog):
```typescript
test.describe("Accessibility smoke check", () => {
  test("no critical axe-core violations on homepage (level A/AA)", async ({ page }) => {
    await page.goto("./deep-dive-vm/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical"
    );
    expect(criticalViolations).toHaveLength(0);
  });
});
```

**Skip link test pattern** — from `tests/e2e/accessibility.spec.ts` lines 59-79. Hub uses `#conteudo-principal` not `#main`:
```typescript
test("skip link is present with href='#conteudo-principal' and correct text", async ({ page }) => {
  await page.goto("./");
  const skipLink = page.locator("a.skip-link");
  await expect(skipLink).toHaveAttribute("href", "#conteudo-principal");
  await expect(skipLink).toHaveText("Pular para o conteúdo");
});
```

**Hub-specific assertions to add** (new patterns not in analog):
```typescript
// Social icons: 4 anchors with aria-label
test("4 social icon links are present and have aria-label", async ({ page }) => {
  await page.goto("./");
  const socialLinks = page.locator(".social-icon-link");
  await expect(socialLinks).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const label = await socialLinks.nth(i).getAttribute("aria-label");
    expect(label).toBeTruthy();
  }
});

// Course cards: at least 2 cards
test("course cards are visible", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".course-card")).toHaveCount(2);
  await expect(page.locator(".course-card.active")).toBeVisible();
});
```

---

### `tests/unit/components/Layout.test.ts` (test/unit — surgical addition)

**Analog:** itself (add new `it()` blocks to existing `describe`)

**Existing file structure** (lines 1-13):
```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

let builtHtml = "";

beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/deep-dive-vm/index.html"), "utf-8");
});
```
New `ogImage` test reads `dist/index.html` (hub), not `dist/deep-dive-vm/index.html`. Two separate `beforeAll` or a second `describe` block with its own file read is needed.

**Pattern for new ogImage test block:**
```typescript
let hubHtml = "";
beforeAll(() => {
  builtHtml = readFileSync(join(PROJECT_ROOT, "dist/deep-dive-vm/index.html"), "utf-8");
  hubHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
});

// inside describe("Layout component"):
it("hub og:image points to hub-og.png (not claudio1.png)", () => {
  const ogImageMatch = hubHtml.match(/property="og:image"[^>]+content="([^"]+)"/);
  const content = ogImageMatch?.[1] ?? hubHtml.match(/content="([^"]+)"[^>]+property="og:image"/)?.[1];
  expect(content).toContain("hub-og.png");
  expect(content).not.toContain("claudio1");
});

it("LP og:image still uses claudio1 fallback (not hub-og.png)", () => {
  expect(builtHtml).toContain("og:image");
  expect(builtHtml).not.toContain("hub-og.png");
});
```

**Existing assertion style** (lines 26-30 of existing file):
```typescript
it("Open Graph og:title meta tag is present", () => {
  expect(builtHtml).toContain("og:title");
  expect(builtHtml).toMatch(/property="og:title"/);
});
```

---

### `tests/seo/seo-meta.test.ts` (test/seo — surgical addition)

**Analog:** itself (add `it()` blocks after test 13)

**Existing helper functions** (lines 33-59) — reuse `extractMetaContent`, `existsSync`:
```typescript
function extractMetaContent(h: string, name: string): string | null { ... }
```

**Existing `DIST_DIR` constant** (line 19):
```typescript
const DIST_DIR = join(__dirname, "../../dist");
```
Already available for sitemap path checks.

**Pattern for new sitemap test** (modeled after test 13, line 165-167):
```typescript
it("13. dist/sitemap-index.xml exists after build", () => {
  expect(existsSync(join(DIST_DIR, "sitemap-index.xml"))).toBe(true);
});
```
New test 14 follows same pattern:
```typescript
it("14. sitemap-0.xml contains root / and /deep-dive-vm/", () => {
  const sitemapPath = join(DIST_DIR, "sitemap-0.xml");
  if (!existsSync(sitemapPath)) return; // skip if not generated
  const sitemap = readFileSync(sitemapPath, "utf-8");
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/");
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/deep-dive-vm/");
});
```
Note: `readFileSync` is already imported in the file (line 3).

**Pattern for new hub OG test (test 15):**
```typescript
it("15. dist/index.html og:image points to hub-og.png", () => {
  const hubIndexPath = join(DIST_DIR, "index.html");
  if (!existsSync(hubIndexPath)) return;
  const hubHtml = readFileSync(hubIndexPath, "utf-8");
  const ogImage = extractMetaContent(hubHtml, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("hub-og.png");
});
```

---

## Shared Patterns

### Design Tokens (CSS Custom Properties)
**Source:** `src/layouts/Layout.astro` lines 148-165 (`<style is:global>` `:root` block)
**Apply to:** All scoped `<style>` blocks in hub components

All tokens are globally available — hub CSS uses them directly without declaring local variables:
```css
var(--nucleo-eletrico)   /* #00ffff — accent, borders, glow */
var(--abismo-profundo)   /* #0a0f1e — background */
var(--sub-nivel)         /* #1b293c — card backgrounds */
var(--texto-principal)   /* #ffffff */
var(--texto-secundario)  /* #d1d9e6 */
var(--texto-terciario)   /* #8a99b5 */
var(--sucesso)           /* #00e5a8 — ATIVO badge */
var(--alerta)            /* #ffb547 — EM BREVE badge */
var(--hairline)          /* rgba(209,217,230,0.12) */
var(--hairline-strong)   /* rgba(0,255,255,0.32) */
```

### Hover Transition Pattern
**Source:** `src/components/ui/Button.astro` lines 49-50, 59-62
**Apply to:** Social icon links, active course cards

```css
transition: transform 0.15s, color 0.2s ease, filter 0.2s ease;
/* reduced motion override — copy exactly */
@media (prefers-reduced-motion: reduce) {
  /* element */ { transition: none; }
  /* element */:hover { transform: none; }
}
```

### `<Image>` from astro:assets Pattern
**Source:** `src/components/sections/Mentor.astro` lines 2-4, 12-13
**Apply to:** `src/pages/index.astro` mentor photo

```astro
import { Image } from "astro:assets";
import claudio2 from "../../assets/claudio2.png";
// In template:
<Image src={claudio2} alt="..." loading="lazy" />
```
Hub uses `loading="eager"` (above fold, LCP element) and explicit `width={128} height={128}`.

### Typography Families
**Source:** `src/layouts/Layout.astro` line 77 (Google Fonts preload) + `src/components/ui/SectionHead.astro`
**Apply to:** All text in `src/pages/index.astro`

| Role | Family | Used In |
|------|--------|---------|
| Display / h1 | `"Chakra Petch", sans-serif` | Mentor name |
| Heading / h2 | `"Space Grotesk", system-ui` | Section titles, course title |
| Body | `"Space Grotesk", system-ui` | Bio, course description |
| Label / eyebrow | `"JetBrains Mono", monospace` | Badges (ATIVO, EM BREVE) |

### Security Pattern: External Links
**Source:** `src/pages/deep-dive-vm/index.astro` (convention), `07-RESEARCH.md §Domínio de Segurança`
**Apply to:** All social icon `<a>` elements

```astro
<a
  href={link.url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={link.ariaLabel}
>
```

### Vitest Unit Test Structure
**Source:** `tests/unit/components/Layout.test.ts` lines 1-13
**Apply to:** New `it()` blocks in both test files

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/data/social-links.ts` | data/model | static export | No data files exist in `src/data/` — entirely new pattern for this project |
| `src/data/courses.ts` | data/model | static export | Same as above — `src/data/` directory does not exist yet |

**Planner action for these files:** Use the TypeScript interface + exported const array pattern documented directly in `07-RESEARCH.md` §Padrão para src/data/ — the patterns are fully specified there and replicated in this document above.

---

## Metadata

**Analog search scope:** `src/`, `tests/` — all Astro components, TypeScript files, E2E and unit test specs
**Files scanned:** 21 Astro components + 13 test files
**Key findings:**
- The `skip-link` CSS is in `Layout.astro` globally but the `<a>` element is in each page individually (confirmed: `deep-dive-vm/index.astro` line 29 has `<a href="#main" class="skip-link">`)
- Hub uses `#conteudo-principal` (UI-SPEC) vs LP's `#main` — two separate anchors, no conflict
- No existing data files in project — `src/data/` is a wholly new directory
- SVG inline used in Footer and section components — no prior "icon component" pattern; SocialIcon.astro is the first reusable SVG component
- `noindex` currently applied via `<meta slot="head">` in `src/pages/index.astro` line 9 — must be removed entirely; Layout post-modification handles it via astro-seo prop
- `astro.config.mjs` already has no sitemap filter — no change needed there
**Pattern extraction date:** 2026-05-17
