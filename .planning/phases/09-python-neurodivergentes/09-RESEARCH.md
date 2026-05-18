# Phase 9: Python para Neurodivergentes LP — Research

**Researched:** 2026-05-17
**Domain:** Astro static LP migration, data-driven component refactoring, Playwright/Vitest testing
**Confidence:** HIGH — all findings verified directly from codebase source files

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 — Route:** `/deep-dive-python-neurodivergentes/` → `src/pages/deep-dive-python-neurodivergentes/index.astro`. Hub card status `'active'`, 3rd entry in `src/data/courses.ts`.
- **D-02 — Architecture:** Refactor existing section components to data-driven (props-based). VM LP and Python LP share the SAME component files. `Pricing.astro` is refactored FIRST as the model for all courses.
- **D-03 — Pricing:** Full `PricingProps` interface (documented in 09-UI-SPEC.md §9). VM LP backward-compatible after refactor.
- **D-04 — CTA:** Hotmart placeholder `https://pay.hotmart.com/`. Text: "Quero começar agora". Sticky: "DESDE 12× R$ 78,92" · "Quero começar →".
- **D-05 — OG Image:** `public/python-neurodivergentes-og.png`, 1200×630, sharp inline script, base `src/assets/claudio2.png`, `fit: 'cover'`, `position: 'top'`.
- **D-06 — Content:** Wireframe `Python para Neurodivergentes - Standalone.html` is source of truth. Full content extracted in 09-CONTEXT.md and 09-UI-SPEC.md.

### Claude's Discretion

- Section internal spacing: follow project standard (96px desktop / 64px mobile via global `section` primitive)
- Expandable details behavior: M.01 open, M.02–M.06 closed
- Hover states and transitions: cyan on hover, `transition: 0.2s ease` pattern
- Section order: Hero → TrustBand → PainPoints → Method → Curriculum → Mentor → ForWho → Bonuses → Pricing → Faq → FinalCTA → Footer
- Brackets decorativos on mentor photo: 4 spans `.brackets`, same pattern as hub

### Deferred Ideas (OUT OF SCOPE)

- Testimonials for Python LP — deferred until first students
- Real Hotmart URL — placeholder only; user configures before deploy
- Definitive og:image — placeholder via sharp; replaces when final visual identity ready
- Section analytics (scroll depth, CTA click rate) — future milestone
- SSR / pre-registration form — static site only

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PY-01 | Route `/deep-dive-python-neurodivergentes/` exists and serves complete LP with all wireframe sections (Hero, ForWho, Curriculum, Pricing) — no 404 | File-based routing confirmed; `src/pages/deep-dive-python-neurodivergentes/index.astro` creates the route automatically at build |
| PY-02 | Design faithful to wireframe — same design system (palette, CSS tokens, typography, grid, `[data-reveal]` animations) | All tokens declared globally in `Layout.astro <style is:global>`; no new tokens needed; components inherit unchanged |
| PY-03 | Hub displays active card for Python LP with direct link, no "Em breve" badge | Hub auto-renders from `courses` array; adding 3rd entry with `status: 'active'` is sufficient; existing hub E2E tests need count update (2 → 3) |
| PY-04 | LP has complete OG meta tags: `og:title`, `og:description`, `og:image` → `python-neurodivergentes-og.png` (1200×630), `og:url` | `Layout.astro` accepts `ogImage?: string` prop; generates full absolute URL via `siteOrigin + ogImage`; `astro-seo` package handles all OG tags |
| PY-05 | Test suite green — E2E spec for Python LP, SEO Vitest test (og:image), no regression on existing LPs | Vitest test is test 17 in `seo-meta.test.ts`; E2E spec follows `journeys.spec.ts` pattern; hub E2E count assertion needs updating from 2 to 3 |

</phase_requirements>

---

## Summary

Phase 9 migrates the "Python para Neurodivergentes" wireframe to a full Astro landing page at `/deep-dive-python-neurodivergentes/`. The core technical work is a **props-based refactor** of all 11 section components (Pricing first as the model), plus creating the new page file, the `FinalCTA` component (new), the OG image (sharp script), a data constants file, and the test suite.

All content decisions are fully specified in `09-CONTEXT.md` and `09-UI-SPEC.md`. The codebase is mature and consistent — no architectural ambiguity remains. Every component currently uses hardcoded VM content directly in the template; refactoring adds a Props interface and replaces inline literals with prop references. The CSS stays **unchanged** — only content changes.

The critical sequencing constraint is: **generate OG image before running build** (confirmed by HOWTO anti-pattern #3). The critical test constraint is: **hub E2E must be updated** to expect 3 course cards, not 2, because adding Python as `status: 'active'` breaks the hardcoded `toHaveCount(2)` assertion in `hub.spec.ts`.

**Primary recommendation:** Execute in this order: (1) generate OG PNG, (2) refactor Pricing.astro with props, (3) refactor remaining section components, (4) create `src/data/python-course.ts` and extend `courses.ts`, (5) create `FinalCTA.astro`, (6) create `index.astro` for the Python LP, (7) update tests.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page routing | Frontend Server (Astro SSG) | — | File-based routing: `src/pages/[slug]/index.astro` creates route |
| Section content | Frontend Server (Astro SSG) | — | Props passed at build time; no runtime data fetching |
| Design tokens / global CSS | Frontend Server (Astro SSG) | — | All tokens in `Layout.astro <style is:global>` — inherited by all pages |
| OG image generation | Build-time script | CDN/Static | sharp script runs once at dev time; output committed to `public/` |
| Hub card rendering | Frontend Server (Astro SSG) | — | Hub page maps over `courses` array; no server needed |
| Sitemap | CDN/Static | — | `@astrojs/sitemap` auto-discovers all routes at build |
| JSON-LD structured data | Frontend Server (Astro SSG) | — | Passed as `jsonLd` prop to Layout; rendered inline `<script type=application/ld+json>` |
| E2E tests | Test (Playwright) | — | Tests the static built output via `npm run build && npm run preview` |
| SEO meta tests | Test (Vitest) | — | Parses `dist/` HTML files statically; requires prior build |
| Animations | Browser / Client | — | IntersectionObserver in `Layout.astro <script>`; CSS transitions only — no JS framework |

---

## Standard Stack

### Core (existing — no new packages)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Astro | ^6.3.1 | Static site generator, file-based routing, component model | Already installed [VERIFIED: package.json] |
| astro-seo | ^1.1.0 | OG tags, canonical URL, Twitter card meta generation | Already in Layout.astro [VERIFIED: package.json] |
| @astrojs/sitemap | ^3.7.2 | Auto-generates sitemap-0.xml from all routes | Already configured in astro.config.mjs [VERIFIED: package.json] |
| sharp | ^0.34.5 | OG image generation (1200×630 PNG from claudio2.png) | Already installed as dependency [VERIFIED: package.json] |

### Test Stack (existing — no new packages)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Playwright | ^1.59.1 | E2E browser tests | Already configured [VERIFIED: package.json] |
| @axe-core/playwright | ^4.10.1 | WCAG axe accessibility smoke checks in E2E | Already used in hub.spec.ts [VERIFIED: package.json] |
| Vitest | ^3.2.4 | Unit/SEO static tests | Already configured [VERIFIED: package.json] |

**Installation:** No new packages required. Zero new runtime dependencies per REQUIREMENTS.md constraint.

---

## Package Legitimacy Audit

No new packages are installed in this phase. All dependencies are pre-existing in `package.json`.

**Packages removed due to slopcheck:** none
**Packages flagged as suspicious:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Wireframe HTML (source of truth)
        |
        v
src/data/python-course.ts       src/data/courses.ts
  (PYTHON_COURSE constants)       (3-entry array)
        |                               |
        v                               v
src/pages/deep-dive-python-neurodivergentes/index.astro
  ├── Layout (ogImage, jsonLd, url, title, description)
  ├── UrgencyBar (props: Python values)
  ├── NavBar
  └── <main id="main">
        ├── Hero (props: HeroProps — Python content)
        ├── TrustBand (props: TrustBandProps — ND conditions)
        ├── PainPoints (props: PainPointsProps — 5 cards)
        ├── Method (props: MethodProps — 5 frentes)
        ├── Curriculum (props: CurriculumProps — 6 modules)
        │     └── ModuleDetails × 6 (unchanged component)
        ├── Mentor (props: MentorProps — Python bio)
        ├── ForWho (props: ForWhoProps — ND audience)
        ├── Bonuses (props: BonusesProps — 3 bonuses)
        ├── Pricing (props: PricingProps — Python pricing) ← PRIORITY REFACTOR
        ├── Faq (props: FaqProps — 8 questions)
        ├── FinalCTA (NEW component)
        └── Footer
  StickyCta (props: StickyCtaProps)
  LegalModals

public/python-neurodivergentes-og.png  ← generated via sharp script before build
                                            base: src/assets/claudio2.png
                                            1200×630, fit: cover, position: top
```

```
src/pages/index.astro (Hub)
  └── courses array (now 3 entries, Python as active)
        → .course-card.active × 2 (VM + Python)
        → .course-card.coming-soon × 1 (EC2)
```

### Recommended Project Structure (new/modified files only)

```
src/
├── data/
│   ├── courses.ts              # MODIFIED — add Python as 3rd entry (status: 'active')
│   └── python-course.ts        # NEW — PYTHON_COURSE constants (hotmartUrl, route, ogImage)
├── pages/
│   └── deep-dive-python-neurodivergentes/
│       └── index.astro         # NEW — Python LP page
├── components/
│   ├── sections/
│   │   ├── Pricing.astro       # REFACTORED — props-based (FIRST, model for all)
│   │   ├── Hero.astro          # REFACTORED — props-based
│   │   ├── TrustBand.astro     # REFACTORED — props-based
│   │   ├── PainPoints.astro    # REFACTORED — props-based
│   │   ├── Method.astro        # REFACTORED — props-based
│   │   ├── Curriculum.astro    # REFACTORED — props-based
│   │   ├── Mentor.astro        # REFACTORED — props-based
│   │   ├── ForWho.astro        # REFACTORED — props-based
│   │   ├── Bonuses.astro       # REFACTORED — props-based
│   │   ├── Faq.astro           # REFACTORED — props-based
│   │   └── FinalCTA.astro      # NEW — final CTA section (Python only, no VM equivalent)
│   └── layout/
│       ├── StickyCta.astro     # REFACTORED — props-based (priceLabel, ctaHref, ctaText)
│       └── UrgencyBar.astro    # REFACTORED — props-based (Python 60h values)
public/
└── python-neurodivergentes-og.png  # NEW — generated via sharp script
tests/
├── e2e/
│   ├── hub.spec.ts             # MODIFIED — update course card count 2 → 3
│   └── python-lp.spec.ts       # NEW — E2E for Python LP
└── seo/
    └── seo-meta.test.ts        # MODIFIED — add test 17 (og:image python)
```

---

## Component-by-Component Refactor Map

### Pattern: Props-Based Refactor

Every hardcoded section component follows this identical refactor pattern:

**Before (hardcoded):**
```astro
---
// No props
---
<section ...>
  <SectionHead eyebrow="HARDCODED VALUE" titleHtml="HARDCODED HTML" ... />
  <!-- hardcoded content -->
</section>
```

**After (data-driven):**
```astro
---
interface Props {
  eyebrow: string;
  titleHtml: string;
  // ... other typed props
}
const { eyebrow, titleHtml, ... } = Astro.props;
---
<section ...>
  <SectionHead eyebrow={eyebrow} titleHtml={titleHtml} ... />
  <!-- content rendered from props -->
</section>
```

CSS block stays **completely unchanged** in every component.

---

### Pricing.astro — Priority Refactor (FIRST)

**Current state:** Fully hardcoded VM content. `SectionHead` receives hardcoded strings. `price-ribbon`, `price-tier`, `price-name`, `price-display`, `price-or`, `price-includes` list (8 items), `Button href` hardcoded to `https://www.hotmart.com`, guarantee text hardcoded. [VERIFIED: direct file read]

**Current includes count:** 8 items (VM has 8; Python needs 7). The `data-stagger` `animation-delay` increments by 80ms per item — Python goes 0ms to 480ms (7 items × 80ms).

**Refactor interface** (from 09-UI-SPEC.md §9, complete):
```ts
interface PricingProps {
  eyebrow: string;
  titleHtml: string;
  lede: string;
  ribbon: string;
  tierLabel: string;
  courseName: string;
  originalPrice: string;
  installments: { count: number; value: string; cents: string };
  pixPrice: string;
  pixNote?: string;
  includes: Array<{ html: string; delay?: number }>;
  ctaHref: string;
  ctaText: string;
  guarantee: { days: number; heading: string; body: string };
}
```

**VM backward-compat:** After refactor, `src/pages/deep-dive-vm/index.astro` passes VM's own content via these props. The VM data values are embedded in the current Pricing.astro — extract them verbatim before replacing with prop bindings. VM has 8 includes; Python has 7.

**Critical:** The `price-cta` CTA button uses `customClass="price-cta"` which triggers a global `:global(.price-cta)` rule in Button.astro that forces `display: flex; width: 100%; justify-content: center`. This styling is already correct and must not change.

---

### Hero.astro — Refactor

**Current state:** Imports `claudio1.png` at the top level (hardcoded). Python LP needs `claudio2.png`. The `portrait.src` prop must be `ImageMetadata` type (Astro asset import). [VERIFIED: direct file read]

**Key insight:** The image import cannot be a string path — it must be an imported Astro asset. The Python LP's `index.astro` will need to `import claudio2 from "../../assets/claudio2.png"` and pass it as `portrait={{ src: claudio2, alt: "..." }}`. The Hero component removes its own top-level import and accepts the image via props.

**Prop interface:** As specified in 09-UI-SPEC.md §1. The `eyebrow` in Hero renders differently than `SectionHead` — it has the `.bar` + `.idx` + description span pattern (distinct from `SectionHead.eyebrow`).

---

### TrustBand.astro — Refactor

**Current state:** Hardcoded label "PROFISSIONAIS\nDE EMPRESAS COMO" and 4 trust-items (ENTERPRISE, FINTECH, SAAS B2B, STARTUP). Python needs "DESENHADO COM\nE PARA PESSOAS" and 4 ND conditions (TDAH, AUTISMO, DISLEXIA, ANSIEDADE) with different icons. [VERIFIED: direct file read]

**Icon strategy:** Python TrustBand items use inline SVG icons representing ND concepts (brain, focus/circle, text-lines, heart-rate). 16×16 viewBox, `stroke="currentColor"` style, consistent with existing trust-item pattern. Exact SVG paths at executor's discretion (Claude's Discretion per 09-CONTEXT.md).

**Note:** TrustBand renders as `<div class="trust">` not `<section>` — no `data-reveal` per UI-SPEC. This must be preserved in refactor.

---

### Curriculum.astro — Refactor

**Current state:** Uses `ModuleDetails` component via `<slot />` with hardcoded VM track children (TEORIA, PORTAL, AZURE CLI, TERRAFORM, SDD+WAF). [VERIFIED: direct file read]

**ModuleDetails interface (already props-based):** `num`, `title`, `subtitle`, `hours`, `isOpen` — all already props. Track children rendered via `<slot />`. [VERIFIED: ModuleDetails.astro]

**Python curriculum approach:** Curriculum.astro refactor accepts `modules` array prop. The component iterates over modules and renders `ModuleDetails` for each. Track content (5 tracks per module: VISUAL, HANDS-ON, REPETIÇÃO, PROJETO, BODY DOUBLING) is passed as props to the track template.

**Track grid:** Already `repeat(5, 1fr)` → 3 cols ≤1180px → 2 cols ≤760px → 1 col ≤520px. This is exactly right for Python's 5 tracks. No CSS change needed. [VERIFIED: ModuleDetails.astro]

**Key decision for planner:** The `tracks` content inside `ModuleDetails` is currently rendered via slot (raw HTML children). To make Curriculum fully data-driven without slots, the tracks array must be passed as props to `ModuleDetails` OR Curriculum renders the track divs inline via `set:html`. Recommended: add `tracks: Array<{ head: string; body: string }>` to `ModuleDetails` props and render the track grid internally — eliminates the slot pattern entirely and allows full data-drive from the `modules` array.

---

### Mentor.astro — Refactor

**Current state:** Imports `claudio1.png` hardcoded. Python uses `claudio2.png`. Same image-as-props pattern as Hero refactor applies. Mentor bio and credentials are hardcoded VM text.

---

### StickyCta.astro — Refactor

**Current state:** Fully hardcoded: `divido em <b>12× R$ 78,92</b>`, `href="#investimento"`, button text "Quero começar →". [VERIFIED: direct file read]

**Note typo in current component:** "divido em" (should be "desde"). Python LP uses "DESDE 12× R$ 78,92" per D-04. The refactor fixes this by accepting `priceLabel` prop. VM LP passes its own label.

---

### UrgencyBar.astro — Refactor

**Current state:** Hardcoded "54h de imersão + 6 sessões 1:1 + Toolkit Terraform · acesso por 12 meses". Python needs "60H DE CONTEÚDO · 6 SESSÕES 1:1 · BODY DOUBLING SEMANAL · ACESSO 12 MESES". [VERIFIED: direct file read]

The component comment already anticipates parameterization: `const { horas = "54h", sessoes = "6" } = Astro.props` is commented out. The refactor activates this pattern with a `content: string` prop or structured items array.

---

### FinalCTA.astro — NEW Component

**No equivalent in VM LP.** This is the only genuinely new section component.

**Interface:**
```ts
interface FinalCtaProps {
  eyebrow: string;       // "PYTHON PARA NEURODIVERGENTES"
  headlineHtml: string;  // "Python do jeito que seu <span class=\"flame\">cérebro pede</span>."
  ctaHref: string;       // "#investimento"
  ctaText: string;       // "Quero começar agora"
}
```

**CSS spec (all new — no existing styles to inherit):**
- `section.final-cta` with `data-reveal`
- Background: `transparent` + `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,255,255,0.06), transparent 70%)`
- `border-top: 1px solid var(--hairline-strong)`
- Layout: `text-align: center`, single column, `.final-cta-inner` max-width 640px centered
- Eyebrow: JetBrains Mono 11px, `letter-spacing: 0.28em`, `--nucleo-eletrico`, `margin-bottom: 16px`
- Headline: Chakra Petch `clamp(28px, 3vw, 44px)` weight 600, `text-wrap: balance`, `margin-bottom: 32px`
- `.flame`: `--nucleo-eletrico`, italic, `text-shadow: 0 0 32px rgba(0,255,255,0.6)`
- CTA: `<Button variant="primary" size="massive">` centered via `margin: 0 auto`
- Mobile: CTA button `width: 100%`

---

### src/data/python-course.ts — NEW File

```ts
export const PYTHON_COURSE = {
  hotmartUrl: "https://pay.hotmart.com/", // placeholder — replace before deploy
  route: "/deep-dive-python-neurodivergentes/",
  ogImage: "/python-neurodivergentes-og.png",
} as const;
```

---

### src/pages/deep-dive-python-neurodivergentes/index.astro — NEW File

**Layout props:**
```astro
<Layout
  title="Python para Neurodivergentes · O Sertao será Cloud"
  description="Deep Dive em Python para devs com TDAH, autismo, dislexia ou ansiedade. 60h em micro-aulas, 5 frentes, Body Doubling semanal. Com Cláudio Raposo, Microsoft MVP."
  url="https://mentoria.sertaoseracloud.com/deep-dive-python-neurodivergentes/"
  ogImage="/python-neurodivergentes-og.png"
  jsonLd={{ ... Python Course schema }}
>
```

**JSON-LD (Course schema):**
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Python para Neurodivergentes · O Sertao será Cloud",
  "description": "Deep Dive em Python...",
  "courseCode": "PY-ND-DEEP-DIVE",
  "educationalLevel": "Beginner",
  "provider": {
    "@type": "Person",
    "name": "Cláudio Filipe Lima Raposo",
    "sameAs": ["https://www.linkedin.com/in/cfraposo/", "https://github.com/sertaoseracloud"]
  },
  "offers": {
    "@type": "Offer",
    "price": "947.00",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock",
    "url": "https://mentoria.sertaoseracloud.com/deep-dive-python-neurodivergentes/#investimento"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Online",
    "duration": "PT60H",
    "instructor": {
      "@type": "Person",
      "name": "Cláudio Filipe Lima Raposo",
      "jobTitle": "Microsoft MVP"
    }
  }
}
```

**Section composition order** (per 09-UI-SPEC.md §0):
```
skip-link → UrgencyBar → NavBar → <main id="main" tabindex="-1">
  Hero → TrustBand → PainPoints → Method → Curriculum → Mentor →
  ForWho → Bonuses → Pricing → Faq → FinalCTA → Footer
</main>
StickyCta → LegalModals
```

**Note:** VM LP has `Testimonials` between `Bonuses` and `Pricing` — Python LP omits Testimonials entirely (deferred per CONTEXT.md).

---

## OG Image Generation

**Pattern** (from HOWTO-new-landing-page.md, verified against existing ec2-og.png generation): [VERIFIED: HOWTO-new-landing-page.md]

```js
// gen-python-neurodivergentes-og.mjs (DELETE AFTER RUN)
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
await sharp(join(__dirname, 'src/assets/claudio2.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png()
  .toFile(join(__dirname, 'public/python-neurodivergentes-og.png'));
console.log('Generated public/python-neurodivergentes-og.png');
```

**Verification:**
```bash
node -e "import('sharp').then(s=>s.default('public/python-neurodivergentes-og.png').metadata().then(m=>console.log(m.width,m.height,m.format)))"
# Expected: 1200 630 png
```

**Generate BEFORE creating index.astro** — anti-pattern #3 from HOWTO.

**Key difference from hub-og and ec2-og:** Uses `claudio2.png` (not `claudio1.png`). hub-og.png also uses `claudio2.png` per index.astro — consistent with Python LP being the same mentor portrait.

---

## Sitemap Behavior

**Finding:** `astro.config.mjs` sitemap filter currently excludes ONLY the hub root (`/`). [VERIFIED: astro.config.mjs]

```js
sitemap({
  filter: (page) => !page.endsWith('https://mentoria.sertaoseracloud.com/'),
})
```

The new Python LP route will be **automatically included** in `sitemap-0.xml` at build — no config change needed. The existing SEO test 14 checks that sitemap contains `deep-dive-vm` but has no exclusion test for Python LP. The sitemap test 15 checks hub is NOT in sitemap (unchanged). No sitemap config changes required.

---

## Test Strategy

### Existing Tests Requiring Updates

**1. `tests/e2e/hub.spec.ts` — MUST UPDATE**

```ts
// Line 42: Change 2 → 3
test("2 course cards are present", ...)  // BREAKS: Python added as active
await expect(page.locator(".course-card")).toHaveCount(2);  // Must become 3

// Line 47: Still passes (VM is still active)
test("active course card is visible", ...)

// Line 52: Still passes (EC2 is still coming-soon)
test("coming-soon course card is visible", ...)

// Line 58: Still passes (EC2 coming-soon has no course-link)
test("coming-soon course card has no clickable course-link", ...)

// Line 77: Still passes (VM link still contains /deep-dive-vm/)
test("active course card link href contains /deep-dive-vm/", ...)
```

**New assertion needed in hub.spec.ts:**
```ts
test("python active course card link href contains /deep-dive-python-neurodivergentes/", async ({ page }) => {
  await page.goto("./");
  const courseLinks = page.locator(".course-card.active .course-link");
  const hrefs = await courseLinks.evaluateAll(els => els.map(el => el.getAttribute("href")));
  expect(hrefs).toContain("/deep-dive-python-neurodivergentes/");
});
```

**2. `tests/seo/seo-meta.test.ts` — ADD test 17**

Following the exact HOWTO pattern (anti-pattern #1 warning — always use local variable, never reuse `DIST_INDEX`):

```ts
it("17. dist/deep-dive-python-neurodivergentes/index.html og:image points to python-neurodivergentes-og.png", () => {
  const pythonIndexPath = join(DIST_DIR, "deep-dive-python-neurodivergentes/index.html");
  expect(
    existsSync(pythonIndexPath),
    `dist/deep-dive-python-neurodivergentes/index.html not found. Run 'npm run build' first.`
  ).toBe(true);
  const pythonHtml = readFileSync(pythonIndexPath, "utf-8");
  const ogImage = extractMetaContent(pythonHtml, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("python-neurodivergentes-og.png");
});
```

Also **add sitemap assertion** for Python LP:
```ts
it("18. sitemap-0.xml contains /deep-dive-python-neurodivergentes/", () => {
  const sitemap = readFileSync(join(DIST_DIR, "sitemap-0.xml"), "utf-8");
  expect(sitemap).toContain("deep-dive-python-neurodivergentes");
});
```

### New Tests to Create

**`tests/e2e/python-lp.spec.ts`** — Pattern: `journeys.spec.ts` for the VM LP, adapted for Python. Cover:

```ts
// 1. Page load
test("GET /deep-dive-python-neurodivergentes/ returns HTTP 200")
test("<h1> is visible and contains Python copy")
test("hero primary CTA has href #investimento", data-testid="hero-cta-primary")
test("hero ghost CTA has href #ementa", data-testid="hero-cta-ghost")

// 2. Section anchors
test("#ementa section exists and scrolls into viewport")
test("#investimento section exists and scrolls into viewport")
test("#faq section exists and scrolls into viewport")

// 3. Sticky CTA
test("sticky CTA is present in DOM with href to #investimento")
test("sticky CTA visible on mobile 375px viewport")

// 4. Accessibility
test("skip link has href='#main' and correct text")
test("no critical axe-core violations (WCAG 2.0 A/AA)")

// 5. Responsive
test("mobile 375x812: h1 visible, no horizontal overflow")
```

**Note on skip-link:** The Python LP's skip-link targets `#main` (per 09-UI-SPEC.md: `<a href="#main" class="skip-link">`). The hub and EC2 use `#conteudo-principal`. The VM LP uses `#main`. Python follows the VM LP pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image generation | Custom image compositor | `sharp` (already installed) | Already in package.json; same pattern used for hub-og.png and ec2-og.png |
| OG/SEO meta tags | Manual `<meta>` tags | `astro-seo` via `Layout.astro` | Already wired; passes all SEO tests; handles canonical URL correctly |
| Sitemap | Manual sitemap.xml | `@astrojs/sitemap` auto-discovery | Auto-discovers all routes; no config change needed for new route |
| Animation system | Custom JS observer | Existing `[data-reveal]` + `[data-stagger]` in Layout.astro | Already declared globally; new sections just add the attribute |
| Button variants | New button component | Existing `Button.astro` (primary/ghost/solid-core, normal/massive) | All variants already implemented; just pass `variant` and `size` props |
| Section heading | Custom eyebrow+h2+lede | `SectionHead.astro` (eyebrow, titleHtml, lede, center props) | Already handles `.flame` class via `:global`, text-wrap: balance, all typography |
| Module expandable | Custom accordion | `ModuleDetails.astro` (num, title, subtitle, hours, isOpen props) | Already handles `<details>/<summary>`, track grid, 5-column layout, toggle animation |
| JSON-LD | Custom script tag | `Layout.astro jsonLd` prop | Already renders `<script type=application/ld+json>` with JSON.stringify |

---

## Common Pitfalls

### Pitfall 1: VM LP Regression from Pricing Refactor
**What goes wrong:** After refactoring `Pricing.astro` to accept props, the VM LP's `index.astro` still calls `<Pricing />` with no props — component renders empty or throws TypeScript errors.
**Why it happens:** Forgetting to update `src/pages/deep-dive-vm/index.astro` with VM's own content as props.
**How to avoid:** Treat the Pricing refactor as a two-step atomic change: (1) extract VM's current hardcoded values → (2) add Props interface and bindings → (3) update VM's index.astro to pass extracted values as props. All three steps must land in one commit.
**Warning signs:** VM LP loads blank pricing section, or `astro build` throws TypeScript error about missing required props.

### Pitfall 2: ogImage without leading slash
**What goes wrong:** `Layout.astro` concatenates `siteOrigin + ogImage` directly. Without leading `/`, the URL is malformed: `https://mentoria.sertaoseracloud.compython-neurodivergentes-og.png`.
**How to avoid:** Always pass `ogImage="/python-neurodivergentes-og.png"` (with leading slash). [VERIFIED: HOWTO anti-pattern #2]

### Pitfall 3: Build before OG image generation
**What goes wrong:** `npm run build` succeeds but the og:image meta tag points to a missing file. SEO test passes vacuously at runtime but social previews are broken.
**How to avoid:** Run the sharp script first, verify the file exists in `public/`, then create `index.astro`. [VERIFIED: HOWTO anti-pattern #3]

### Pitfall 4: Hub test count regression
**What goes wrong:** `tests/e2e/hub.spec.ts` line 42 asserts `toHaveCount(2)`. Adding Python as active breaks this immediately.
**How to avoid:** Update hub.spec.ts as part of the same plan wave that updates `courses.ts`. Never commit `courses.ts` change without the test update.

### Pitfall 5: SEO test false positive (reusing DIST_INDEX)
**What goes wrong:** SEO test for Python og:image passes even though it's actually checking the VM page (both `DIST_INDEX` and `html` are module-level variables pointing to `dist/deep-dive-vm/index.html`).
**How to avoid:** Declare a local `pythonIndexPath` and `pythonHtml` inside the `it()` block. Never reference `DIST_INDEX` or `html` from the module scope for a new route's test. [VERIFIED: HOWTO anti-pattern #1]

### Pitfall 6: ImageMetadata vs string for portrait props
**What goes wrong:** Passing `portrait.src` as a string path to `<Image>` component throws a TypeScript/runtime error — Astro requires `ImageMetadata` (the imported asset object).
**How to avoid:** Import `claudio2` in `index.astro` and pass the imported object: `portrait={{ src: claudio2, alt: "..." }}`. The Hero component removes its own hardcoded `import claudio1` and uses the prop value.

### Pitfall 7: Curriculum tracks via slot vs props
**What goes wrong:** If Curriculum.astro renders tracks via slot children (current pattern), the data-driven approach requires raw HTML strings in the template, making the tracks untyped and error-prone.
**How to avoid:** Extend `ModuleDetails` to accept `tracks: Array<{ head: string; body: string }>` prop and render them internally. This eliminates the slot pattern and allows the `modules` array in Curriculum.astro to be fully typed.

### Pitfall 8: FinalCTA `.flame` span not styled
**What goes wrong:** `.flame` class is defined in `SectionHead`'s scoped style with `:global(.flame)`. The FinalCTA renders its headline via `set:html` — the `.flame` span in `headlineHtml` needs to be covered by a `:global(.flame)` rule in FinalCTA's own `<style>` block.
**How to avoid:** Add `:global(.flame)` rule in `FinalCTA.astro <style>` identical to the one in `SectionHead.astro`.

---

## Code Examples

### Pricing.astro Refactor Pattern (complete skeleton)

```astro
---
import Button from "../ui/Button.astro";
import SectionHead from "../ui/SectionHead.astro";

interface PricingProps {
  eyebrow: string;
  titleHtml: string;
  lede: string;
  ribbon: string;
  tierLabel: string;
  courseName: string;
  originalPrice: string;
  installments: { count: number; value: string; cents: string };
  pixPrice: string;
  pixNote?: string;
  includes: Array<{ html: string; delay?: number }>;
  ctaHref: string;
  ctaText: string;
  guarantee: { days: number; heading: string; body: string };
}

const {
  eyebrow, titleHtml, lede, ribbon, tierLabel, courseName,
  originalPrice, installments, pixPrice, pixNote, includes,
  ctaHref, ctaText, guarantee
} = Astro.props;
---

<section class="pricing" id="investimento" data-reveal>
  <div class="container">
    <SectionHead center={true} {eyebrow} {titleHtml} {lede} />
    <div class="price-card">
      <div class="price-ribbon">{ribbon}</div>
      <div class="price-body">
        <div class="price-tier">{tierLabel}</div>
        <h3 class="price-name">{courseName}</h3>
        <div class="price-anchor">
          <span class="total">DE <s>{originalPrice}</s> · POR</span>
        </div>
        <div class="price-display">
          <span class="x">{installments.count}×</span>
          <span class="currency">R$</span>
          <span class="num">{installments.value}</span>
          <span class="cents">{installments.cents}</span>
        </div>
        <div class="price-or">
          OU <b>{pixPrice}</b> {pixNote ?? "à vista no PIX · sem juros, sem pegadinha."}
        </div>
        <ul class="price-includes">
          {includes.map((item, i) => (
            <li data-stagger style={`animation-delay: ${item.delay ?? i * 80}ms`}>
              <!-- checkmark SVG (unchanged) -->
              <span set:html={item.html} />
            </li>
          ))}
        </ul>
        <Button href={ctaHref} variant="primary" size="massive" customClass="price-cta">
          {ctaText}
          <span class="arrow"><!-- arrow SVG --></span>
        </Button>
        <!-- price-secure badges (unchanged) -->
      </div>
    </div>
    <div class="guarantee">
      <div class="guarantee-seal">
        <span class="big">{guarantee.days}</span>
        <span class="small">DIAS</span>
      </div>
      <div>
        <h3>{guarantee.heading}</h3>
        <p>{guarantee.body}</p>
      </div>
    </div>
  </div>
</section>

<style>
  /* UNCHANGED — identical CSS block from current Pricing.astro */
</style>
```

### VM LP backward-compat (deep-dive-vm/index.astro addition)

```astro
import vmPricingData from "../../data/vm-course.ts"; // or inline object
<Pricing
  eyebrow="INVESTIMENTO · TURMA CHAMA AZUL 01"
  titleHtml='A diferença entre <span class="flame">executor e arquiteto</span> está aqui.'
  lede="Acesso por 12 meses, todos os bônus liberados, certificado e comunidade. Pagamento via Hotmart · cartão, PIX ou boleto."
  ribbon="⟡ ACESSO COMPLETO · ECONOMIA DE R$ 1.050"
  tierLabel="O Sertao será Cloud"
  courseName="DEEP DIVE · AZURE VM"
  originalPrice="R$ 1.997"
  installments={{ count: 12, value: "78", cents: ",92" }}
  pixPrice="R$ 947"
  includes={[...vmIncludes]}
  ctaHref="https://www.hotmart.com"
  ctaText="Quero garantir minha vaga agora"
  guarantee={{ days: 7, heading: "Garantia incondicional de 7 dias.", body: "Acesse a mentoria..." }}
/>
```

### courses.ts extension

```ts
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
  {
    title: 'Python para Neurodivergentes',
    description: 'Deep Dive em Python desenhado para devs com TDAH, autismo, dislexia ou ansiedade. 60h em micro-aulas, 5 frentes, Body Doubling semanal.',
    url: '/deep-dive-python-neurodivergentes/',
    status: 'active',
  },
];
```

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 9 |
|--------------|------------------|-------------------|
| Each LP has its own copy of components | All LPs share same component files (data-driven via props) | This IS the Phase 9 refactor — first time applied to this codebase |
| Static OG images per-page | `sharp` inline script generates PNG at dev time | Already established pattern (hub-og, ec2-og) — Python follows same |
| Hardcoded section content | `Props` interface + destructuring + prop bindings | The entire refactor work — CSS stays, only props layer added |

---

## Open Questions

1. **Should VM LP extract its data into `src/data/vm-course.ts`?**
   - What we know: VM LP's `index.astro` currently passes nothing to Pricing (all hardcoded in component). After refactor, VM must pass its data as props — this data can live inline in `index.astro` or in a separate `vm-course.ts` data file.
   - What's unclear: Whether D-02 implies creating a `vm-course.ts` data file or just inlining the VM data directly in `deep-dive-vm/index.astro`.
   - Recommendation: Inline the VM data directly in `deep-dive-vm/index.astro` for this phase (simpler, no new file). Only Python gets `python-course.ts` per D-01/09-UI-SPEC data file contract. A `vm-course.ts` extraction is a future cleanup.

2. **Testimonials.astro handling**
   - What we know: `src/pages/deep-dive-vm/index.astro` imports and renders `Testimonials.astro`. Python LP omits it.
   - What's unclear: Does the refactor need to make Testimonials optional/props-based? Or just skip importing it in Python LP?
   - Recommendation: Simply don't import `Testimonials` in the Python LP's `index.astro`. No refactor of Testimonials needed in this phase.

3. **UrgencyBar content strategy**
   - What we know: UrgencyBar is hardcoded to VM values. Comment in file already proposes parameterization.
   - What's unclear: Whether to pass a single `content: string` prop or a structured items array.
   - Recommendation: Single `content: string` or `items: string[]` prop — keep it simple. Planner decides exact interface.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | sharp script, build | Implied by project running | ≥22.12.0 per engines | — |
| sharp | OG image generation | Yes (in dependencies) | ^0.34.5 | — |
| Astro CLI | Build | Yes | ^6.3.1 | — |
| Playwright | E2E tests | Yes (devDependencies) | ^1.59.1 | — |
| Vitest | SEO/unit tests | Yes (devDependencies) | ^3.2.4 | — |

No missing dependencies. All tools available.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 (unit/SEO) + Playwright ^1.59.1 (E2E) |
| Config files | `vitest.config.ts` (implied), `playwright.config.ts` |
| Quick run (Vitest) | `npx vitest run tests/seo/seo-meta.test.ts` |
| Quick run (E2E) | `npx playwright test tests/e2e/python-lp.spec.ts --project=chromium` |
| Full suite | `npm run test:all && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PY-01 | Route returns HTTP 200 and all sections visible | E2E | `npx playwright test tests/e2e/python-lp.spec.ts` | ❌ Wave 0 |
| PY-02 | Design tokens present, animations fire, no new CSS tokens | E2E (visual check) + build | `npm run build` exits 0 | N/A — build gate |
| PY-03 | Hub shows 3 cards, Python card is active with correct link | E2E | `npx playwright test tests/e2e/hub.spec.ts` | ✅ (needs update) |
| PY-04 | og:image points to python-neurodivergentes-og.png | Vitest (static) | `npx vitest run tests/seo/seo-meta.test.ts` | ✅ (test 17 to add) |
| PY-05 | Full suite green, no regression | Both | `npm run test:all && npx playwright test` | ✅ (updates + new files) |

### Sampling Rate

- **Per task commit:** `npm run build` (smoke — exits 0, dist created)
- **Per wave merge:** `npm run test:all` (Vitest) + `npx playwright test --project=chromium` (E2E)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/e2e/python-lp.spec.ts` — covers PY-01, PY-05 (new file)
- [ ] `tests/e2e/hub.spec.ts` line 42 — update count 2 → 3 (covers PY-03)
- [ ] `tests/seo/seo-meta.test.ts` — add test 17 python og:image, test 18 sitemap (covers PY-04, PY-05)

---

## Security Domain

This phase is a static site generation task with no authentication, user input, API endpoints, or cryptographic operations. ASVS categories V2/V3/V4/V6 do not apply.

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V2 Authentication | No | Static site, no auth |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | All content public |
| V5 Input Validation | No | No forms or user input |
| V6 Cryptography | No | No cryptographic operations |

Security-relevant observations:
- Hotmart CTA URL is a placeholder — no user data transmitted from this page
- `noindex` is NOT set (Python LP should be indexed — same as VM LP pattern)
- No new external script tags, CDN dependencies, or third-party services introduced

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | VM LP's data values for Pricing (ribbon, tier, course name, etc.) can be extracted directly from current `Pricing.astro` hardcoded content | Component Refactor Map | Low — these values were verified by direct file read; risk is copy-paste error only |
| A2 | Hub E2E test `toHaveCount(2)` on line 42 is the only count assertion that breaks when Python is added | Test Strategy | Low — verified by reading hub.spec.ts in full; all other assertions are non-count or status-specific |

---

## Sources

### Primary (HIGH confidence — verified by direct codebase read)

- `src/components/sections/Pricing.astro` — current hardcoded state, CSS, include count
- `src/components/sections/Hero.astro` — hardcoded image import (claudio1.png), eyebrow pattern
- `src/components/sections/Curriculum.astro` — ModuleDetails composition, modules-meta structure
- `src/components/ui/ModuleDetails.astro` — Props interface, track grid CSS, breakpoints
- `src/components/ui/Button.astro` — variant/size API, `.price-cta` global rule
- `src/components/ui/SectionHead.astro` — Props interface, `.flame` :global rule
- `src/components/layout/StickyCta.astro` — current hardcoded content + typo
- `src/components/layout/UrgencyBar.astro` — hardcoded content + commented parameterization
- `src/layouts/Layout.astro` — Props interface (ogImage, jsonLd, url), global CSS tokens, ambient
- `src/pages/deep-dive-vm/index.astro` — section composition pattern, JSON-LD shape
- `src/pages/index.astro` — hub courses array rendering, `.course-card` CSS classes
- `src/data/courses.ts` — CourseStatus type, Course interface, current 2-entry array
- `astro.config.mjs` — sitemap filter (hub-only exclusion)
- `tests/e2e/hub.spec.ts` — count assertions, active/coming-soon card structure
- `tests/e2e/journeys.spec.ts` — VM LP E2E pattern (model for python-lp.spec.ts)
- `tests/seo/seo-meta.test.ts` — test numbering (16 is last), DIST_DIR variable, helpers
- `HOWTO-new-landing-page.md` — 7-step process, 4 anti-patterns
- `package.json` — all dependency versions, test scripts

### Secondary (HIGH confidence — planning documents verified against codebase)

- `.planning/phases/09-python-neurodivergentes/09-CONTEXT.md` — all content decisions (D-01–D-06)
- `.planning/phases/09-python-neurodivergentes/09-UI-SPEC.md` — complete props interfaces, visual specs, section specs
- `.planning/REQUIREMENTS.md` — PY-01 through PY-05 with exact acceptance criteria

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages from package.json, no new dependencies
- Component interfaces: HIGH — read directly from source files and UI-SPEC
- Architecture: HIGH — file-based routing and component composition verified against existing LP pattern
- Pitfalls: HIGH — derived from HOWTO (documented anti-patterns from Phase 8) and direct code read
- Test strategy: HIGH — test files read directly, count assertions verified at source

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable Astro static codebase — no fast-moving external dependencies)
