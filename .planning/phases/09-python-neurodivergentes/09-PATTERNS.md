# Phase 9: Python para Neurodivergentes LP - Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 17 new/modified files
**Analogs found:** 16 / 17 (FinalCTA.astro has no existing analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/deep-dive-python-neurodivergentes/index.astro` | page | request-response | `src/pages/deep-dive-vm/index.astro` | exact |
| `src/data/python-course.ts` | config | static | `src/data/social-links.ts` | role-match |
| `src/data/courses.ts` | data | static | self (modify) | exact |
| `public/python-neurodivergentes-og.png` | asset | build-script | `public/hub-og.png` (via HOWTO) | exact |
| `src/components/sections/Pricing.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/Hero.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/TrustBand.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/Curriculum.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/ForWho.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/PainPoints.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/Method.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/Mentor.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/Bonuses.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/Faq.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/sections/FinalCTA.astro` | component | request-response | none | no-analog |
| `src/components/layout/StickyCta.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `src/components/layout/UrgencyBar.astro` | component | request-response | self (refactor — hardcoded → props) | exact |
| `tests/seo/seo-meta.test.ts` | test | static | self (modify — add test 17) | exact |
| `tests/e2e/hub.spec.ts` | test | e2e | self (modify — count 2→3) | exact |
| `tests/e2e/python-lp.spec.ts` | test | e2e | `tests/e2e/hub.spec.ts` + `tests/e2e/ec2-coming-soon.spec.ts` | role-match |

---

## Pattern Assignments

### `src/pages/deep-dive-python-neurodivergentes/index.astro` (page, request-response)

**Analog:** `src/pages/deep-dive-vm/index.astro`

**Imports pattern** (lines 1–21):
```astro
---
import Layout from "../../layouts/Layout.astro";
import UrgencyBar from "../../components/layout/UrgencyBar.astro";
import NavBar from "../../components/layout/NavBar.astro";
import Footer from "../../components/layout/Footer.astro";
import StickyCta from "../../components/layout/StickyCta.astro";
import Hero from "../../components/sections/Hero.astro";
// ... all section imports
import LegalModals from "../../components/ui/LegalModals.astro";
---
```

**Layout / OG / JSON-LD pattern** (lines 23–60):
```astro
<Layout
  title="Python para Neurodivergentes · O Sertao será Cloud"
  description="Deep Dive em Python para devs com TDAH, autismo, dislexia ou ansiedade. 60h em micro-aulas, 5 frentes, Body Doubling semanal. Com Cláudio Raposo, Microsoft MVP."
  url="https://mentoria.sertaoseracloud.com/deep-dive-python-neurodivergentes/"
  ogImage="/python-neurodivergentes-og.png"
  jsonLd={{
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Python para Neurodivergentes · O Sertao será Cloud",
    "courseCode": "PY-ND-DEEP-DIVE",
    "educationalLevel": "Beginner",
    "provider": { "@type": "Person", "name": "Cláudio Filipe Lima Raposo", "sameAs": ["https://www.linkedin.com/in/cfraposo/", "https://github.com/sertaoseracloud"] },
    "offers": { "@type": "Offer", "price": "947.00", "priceCurrency": "BRL", "availability": "https://schema.org/InStock", "url": "https://mentoria.sertaoseracloud.com/deep-dive-python-neurodivergentes/#investimento" },
    "hasCourseInstance": { "@type": "CourseInstance", "courseMode": "Online", "duration": "PT60H", "instructor": { "@type": "Person", "name": "Cláudio Filipe Lima Raposo", "jobTitle": "Microsoft MVP" } }
  }}
>
```

**Section composition pattern** (lines 61–80):
```astro
  <a href="#main" class="skip-link">Pular para o conteúdo</a>
  <UrgencyBar content="60H DE CONTEÚDO · 6 SESSÕES 1:1 · BODY DOUBLING SEMANAL · ACESSO 12 MESES" />
  <NavBar />
  <main id="main" tabindex="-1">
    <Hero {...heroProps} />
    <TrustBand {...trustBandProps} />
    <PainPoints {...painPointsProps} />
    <Method {...methodProps} />
    <Curriculum {...curriculumProps} />
    <Mentor {...mentorProps} />
    <ForWho {...forWhoProps} />
    <Bonuses {...bonusesProps} />
    <Pricing {...pricingProps} />
    <Faq {...faqProps} />
    <FinalCTA {...finalCtaProps} />
    <Footer />
  </main>
  <StickyCta priceLabel="DESDE 12× R$ 78,92" ctaHref="#investimento" ctaText="Quero começar →" />
  <LegalModals />
</Layout>
```

**Key difference from VM LP:** No `<Testimonials />` between Bonuses and Pricing. Adds `<FinalCTA />` before `<Footer />`. All section components receive typed props instead of zero-prop invocations.

**Image import pattern** — Python LP must import `claudio2.png` and pass it to Hero and Mentor:
```astro
import claudio2 from "../../assets/claudio2.png";
// Then pass as prop:
<Hero portrait={{ src: claudio2, alt: "Cláudio Filipe Lima Raposo" }} ... />
<Mentor portrait={{ src: claudio2, alt: "Cláudio Filipe Lima Raposo" }} ... />
```

---

### `src/data/python-course.ts` (config, static)

**Analog:** `src/data/social-links.ts` (lines 1–50)

**Typed export + build-time guard pattern:**
```typescript
// social-links.ts pattern: named export with `as const`, inline build-time guard
export const socialLinks: SocialLink[] = [ ... ];

for (const link of socialLinks) {
  if (link.url.includes('PLACEHOLDER')) {
    throw new Error(`[social-links] URL placeholder detected...`);
  }
}
```

**Apply to python-course.ts:**
```typescript
export const PYTHON_COURSE = {
  hotmartUrl: "https://pay.hotmart.com/", // placeholder — replace before deploy
  route: "/deep-dive-python-neurodivergentes/",
  ogImage: "/python-neurodivergentes-og.png",
} as const;

// Build-time guard — prevents deploying with placeholder Hotmart URL
if (PYTHON_COURSE.hotmartUrl === "https://pay.hotmart.com/") {
  // This is expected in development — log a warning only.
  // Do NOT throw here: the placeholder is intentional until user configures URL.
}
```

---

### `src/data/courses.ts` (data, static — MODIFY)

**Current file** (lines 1–23): typed `Course[]` array with `CourseStatus` union type. Python is the 3rd entry.

**Modification pattern** — add after EC2 entry:
```typescript
{
  title: 'Python para Neurodivergentes',
  description: 'Deep Dive em Python para devs com TDAH, autismo, dislexia ou ansiedade. 60h em micro-aulas, 5 frentes, Body Doubling semanal.',
  url: '/deep-dive-python-neurodivergentes/',
  status: 'active',
},
```

**Critical side-effect:** Adding a 3rd `status: 'active'` course causes `hub.spec.ts` line 44 `toHaveCount(2)` to fail. This test must be updated in the same PR.

---

### `public/python-neurodivergentes-og.png` (asset, build-script)

**Analog:** HOWTO-new-landing-page.md step 3 — sharp script pattern (same as hub-og.png and ec2-og.png)

**OG image generation script pattern:**
```javascript
// gen-python-neurodivergentes-og.mjs (run once, delete after)
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

**CRITICAL:** Generate this file BEFORE running `astro build`. Anti-pattern #3 from HOWTO.

---

### `src/components/sections/Pricing.astro` (component, request-response — PRIORITY REFACTOR)

**Analog:** Self — current `src/components/sections/Pricing.astro` (lines 1–525)

**Current frontmatter** (lines 1–4) — NO props, just imports:
```astro
---
import Button from "../ui/Button.astro";
import SectionHead from "../ui/SectionHead.astro";
---
```

**Refactored frontmatter pattern:**
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
  ctaHref, ctaText, guarantee,
} = Astro.props;
---
```

**Core template replacements** (hardcoded → prop bindings):

| Element | Before (hardcoded) | After (prop binding) |
|---------|-------------------|----------------------|
| `SectionHead eyebrow=` | `"INVESTIMENTO · TURMA CHAMA AZUL 01"` | `{eyebrow}` |
| `SectionHead titleHtml=` | `'A diferença entre <span class="flame">executor e arquiteto</span>...'` | `{titleHtml}` |
| `SectionHead lede=` | hardcoded string | `{lede}` |
| `.price-ribbon` text | `⟡ ACESSO COMPLETO · ECONOMIA DE R$ 1.050` | `{ribbon}` |
| `.price-tier` | `O Sertao será Cloud` | `{tierLabel}` |
| `.price-name` | `DEEP DIVE · AZURE VM` | `{courseName}` |
| `<s>R$ 1.997</s>` | hardcoded | `<s>{originalPrice}</s>` |
| `.x` | `12×` | `{installments.count}×` |
| `.num` | `78` | `{installments.value}` |
| `.cents` | `,92` | `{installments.cents}` |
| `.price-or` PIX price | `R$ 947` | `{pixPrice}` |
| `.price-includes` list | 8 hardcoded `<li>` blocks | `{includes.map(item => <li set:html={item.html} style={...} />)}` |
| `Button href=` | `"https://www.hotmart.com"` | `{ctaHref}` |
| `Button` text | `Quero garantir minha vaga agora` | `{ctaText}` |
| `.guarantee-seal .big` | `7` | `{guarantee.days}` |
| `guarantee h3` | `Garantia incondicional de 7 dias.` | `{guarantee.heading}` |
| `guarantee p` | hardcoded body | `{guarantee.body}` |

**`data-stagger` animation-delay pattern** (lines 39–168) — VM has 8 items at 0ms, 80ms, 160ms...560ms. Python has 7 items at 0ms...480ms. Use `delay` field in `includes` array:
```astro
{includes.map((item, i) => (
  <li data-stagger style={`animation-delay: ${item.delay ?? i * 80}ms`}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span set:html={item.html} />
  </li>
))}
```

**CSS block:** Unchanged — copy exactly from current file lines 253–525.

**VM backward-compat values to extract from current Pricing.astro:**
```typescript
// VM LP passes these values after Pricing.astro refactor:
const vmPricing = {
  eyebrow: "INVESTIMENTO · TURMA CHAMA AZUL 01",
  titleHtml: 'A diferença entre <span class="flame">executor e arquiteto</span> está aqui.',
  lede: "Acesso por 12 meses, todos os bônus liberados, certificado e comunidade. Pagamento via Hotmart · cartão, PIX ou boleto.",
  ribbon: "⟡ ACESSO COMPLETO · ECONOMIA DE R$ 1.050",
  tierLabel: "O Sertao será Cloud",
  courseName: "DEEP DIVE · AZURE VM",
  originalPrice: "R$ 1.997",
  installments: { count: 12, value: "78", cents: ",92" },
  pixPrice: "R$ 947",
  includes: [/* 8 items from lines 39–168 */],
  ctaHref: "https://www.hotmart.com",
  ctaText: "Quero garantir minha vaga agora",
  guarantee: { days: 7, heading: "Garantia incondicional de 7 dias.", body: "Acesse a mentoria..." },
};
```

---

### `src/components/sections/Hero.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/Hero.astro` (lines 1–553)

**Critical insight:** Line 4 hardcodes `import claudio1 from "../../assets/claudio1.png"`. Python LP uses `claudio2.png`. The image import CANNOT be a string — it must be `ImageMetadata`. Remove top-level import; accept via `portrait` prop.

**Refactored frontmatter pattern:**
```astro
---
import Button from "../ui/Button.astro";
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";

interface HeroProps {
  eyebrowIdx: string;              // "DEEP DIVE"
  eyebrowDesc: string;             // "Curso 60h · Python · 6 Sessões 1:1 · Body Doubling"
  titleHtml: string;               // H1 HTML (may contain .flame, .crossed)
  sub: string;                     // paragraph HTML
  points: Array<{ html: string }>; // 4 bullet items
  ctaPrimaryHref: string;
  ctaPrimaryText: string;
  ctaGhostHref: string;
  ctaGhostText: string;
  metaBadges: Array<{ iconHtml: string; label: string }>; // 4 meta badges
  portrait: { src: ImageMetadata; alt: string };
  portraitStats: Array<{ html: string }>;  // e.g. "⟡ <b>2× MVP</b> · MICROSOFT"
  portraitName: string;
  portraitBadge: string;           // "PROFESSOR PRINCIPAL"
}

const { eyebrowIdx, eyebrowDesc, titleHtml, sub, points,
        ctaPrimaryHref, ctaPrimaryText, ctaGhostHref, ctaGhostText,
        metaBadges, portrait, portraitStats, portraitName, portraitBadge } = Astro.props;
---
```

**Hero eyebrow pattern** (lines 10–15) — NOT the SectionHead eyebrow. Hero has its own `.bar` + `.idx` + description span:
```astro
<div class="eyebrow">
  <span class="bar"></span>
  <span class="idx">{eyebrowIdx}</span>
  <span>{eyebrowDesc}</span>
</div>
```

**Portrait with brackets pattern** (lines 213–233):
```astro
<div class="hero-portrait-wrap">
  <Image src={portrait.src} alt={portrait.alt} loading="eager" fetchpriority="high" />
  <div class="brackets">
    <span></span><span></span><span></span><span></span>
  </div>
  <div class="portrait-stats">
    {portraitStats.map(s => <div class="portrait-stat" set:html={s.html} />)}
  </div>
  <div class="portrait-tag">
    <span class="name">{portraitName}</span>
    <div class="badges"><span class="b">{portraitBadge}</span></div>
  </div>
</div>
```

**CSS block:** Unchanged — copy exactly from current file lines 237–553.

---

### `src/components/sections/TrustBand.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/TrustBand.astro` (lines 1–143)

**Current structure** (lines 1–64): No frontmatter props. `<div class="trust">` (NOT `<section>`). Hardcoded label and 4 `.trust-item` divs with inline SVG + text.

**Refactored frontmatter pattern:**
```astro
---
interface TrustBandProps {
  label: string;  // "PROFISSIONAIS\nDE EMPRESAS COMO" | "DESENHADO COM\nE PARA PESSOAS"
  items: Array<{ svgHtml: string; label: string }>;
}

const { label, items } = Astro.props;
---
```

**Template pattern:**
```astro
<div class="trust">
  <div class="container trust-row">
    <div class="trust-label" set:html={label.replace('\n', '<br />')} />
    {items.map(item => (
      <div class="trust-item">
        <Fragment set:html={item.svgHtml} />
        {item.label}
      </div>
    ))}
  </div>
</div>
```

**IMPORTANT:** TrustBand renders as `<div>` not `<section>` — no `data-reveal`. This distinction MUST be preserved.

**CSS block:** Unchanged — copy exactly from current file lines 66–143.

**Grid adjustment:** Current grid is `repeat(4, 1fr)` with label auto. If items count varies, the grid-template-columns may need to be dynamic or set to `auto repeat(var(--items-count), 1fr)`. Both VM and Python have 4 items, so this is safe for now.

---

### `src/components/sections/PainPoints.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/PainPoints.astro` (lines 1–153)

**Refactored frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";

interface PainCard {
  num: string;   // "01 // SINTOMA"
  titleHtml: string;
  body: string;
}

interface PainPointsProps {
  eyebrow: string;
  titleHtml: string;
  lede: string;
  cards: PainCard[];
}

const { eyebrow, titleHtml, lede, cards } = Astro.props;
---
```

**Template pattern:**
```astro
<section class="pain" id="pain" data-reveal>
  <div class="container">
    <SectionHead eyebrow={eyebrow} titleHtml={titleHtml} lede={lede} />
    <div class="pain-grid">
      {cards.map(card => (
        <div class="pain-card">
          <span class="num">{card.num}</span>
          <h3 set:html={card.titleHtml} />
          <p set:html={card.body} />
        </div>
      ))}
    </div>
  </div>
</section>
```

**Pain card `::before` red left-bar pattern** (lines 117–130): CSS only — unchanged.

---

### `src/components/sections/Method.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/Method.astro` (lines 1–224)

**Refactored frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";

interface MethodStep {
  svgHtml: string;
  label: string;   // "FRENTE 01"
  title: string;   // May contain <br />
  bodyHtml: string;
}

interface MethodProps {
  eyebrow: string;
  titleHtml: string;
  lede: string;
  steps: MethodStep[];
}

const { eyebrow, titleHtml, lede, steps } = Astro.props;
---
```

**Method cell template pattern** (lines 14–144):
```astro
<div class="method-grid">
  {steps.map(step => (
    <div class="method-cell">
      <div class="icon">
        <Fragment set:html={step.svgHtml} />
      </div>
      <span class="label">{step.label}</span>
      <h3 set:html={step.title} />
      <p set:html={step.bodyHtml} />
    </div>
  ))}
</div>
```

**5-column grid** (CSS lines 148–223): Unchanged — `repeat(5, 1fr)` is correct for both VM (5 frentes) and Python (5 frentes).

---

### `src/components/sections/Curriculum.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/Curriculum.astro` (lines 1–378)

**Current ModuleDetails component** (`src/components/ui/ModuleDetails.astro`) is already props-based for `num`, `title`, `subtitle`, `hours`, `isOpen`. Track content currently uses `<slot />` (raw HTML children from Curriculum.astro).

**Recommended approach** (from RESEARCH.md): Add `tracks` array prop to `ModuleDetails` to eliminate the slot pattern and enable full data-drive from the `modules` array in Curriculum.

**Refactored ModuleDetails props extension:**
```typescript
interface ModuleTrack {
  head: string;   // "VISUAL" | "HANDS-ON" | "REPETIÇÃO" | "PROJETO" | "BODY DOUBLING"
  body: string;   // HTML content
}
// Add to existing ModuleDetails interface:
tracks: ModuleTrack[];
```

**Refactored Curriculum frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";
import ModuleDetails from "../ui/ModuleDetails.astro";

interface CurriculumModule {
  num: string;      // "M.01"
  title: string;
  subtitle: string;
  hours: string;    // "08H"
  isOpen?: boolean;
  tracks: Array<{ head: string; body: string }>;
}

interface CurriculumProps {
  eyebrow: string;
  titleHtml: string;
  lede: string;
  meta: { total: string; modules: number; frentes: number; projects: number };
  modules: CurriculumModule[];
}

const { eyebrow, titleHtml, lede, meta, modules } = Astro.props;
---
```

**Modules-meta pattern** (lines 14–22):
```astro
<div class="modules-meta">
  <span><b>{meta.total}</b> CARGA TOTAL</span>
  <div class="sep"></div>
  <span><b>{String(meta.modules).padStart(2,'0')}</b> MÓDULOS</span>
  <div class="sep"></div>
  <span><b>{meta.frentes} FRENTES</b> POR MÓDULO</span>
  <div class="sep"></div>
  <span><b>{meta.projects}</b> BLOCOS PRÁTICOS</span>
</div>
```

**Module iteration pattern:**
```astro
{modules.map(m => (
  <ModuleDetails num={m.num} title={m.title} subtitle={m.subtitle} hours={m.hours} isOpen={m.isOpen ?? false} tracks={m.tracks} />
))}
```

**Track render inside ModuleDetails** (replacing `<slot />`):
```astro
{tracks.map(track => (
  <div class="track">
    <div class="head">{track.head}</div>
    <p set:html={track.body} />
  </div>
))}
```

**Track global CSS** (Curriculum.astro lines 343–378): `:global(.track)`, `:global(.track .head)`, `:global(.track p)` — unchanged, stays in Curriculum.astro.

---

### `src/components/sections/Mentor.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/Mentor.astro` (lines 1–306)

**Critical insight:** Current Mentor.astro imports BOTH `claudio2.png` (line 4) AND `marcelo.png` (line 5). Python LP only has one mentor (Cláudio). The refactor must make the guest mentor section optional.

**Refactored frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";

interface MentorCredential {
  value: string;
  label: string;  // HTML allowed
}

interface MentorInfo {
  portrait: { src: ImageMetadata; alt: string };
  eyebrow: string;
  name: string;
  tagline: string;          // "⟡ SYSTEMS ARCHITECT · 2× MVP..." mono tag
  bioHtml: string[];        // array of <p> paragraphs
  credentials: MentorCredential[];
}

interface MentorProps {
  primary: MentorInfo;
  guest?: MentorInfo;       // optional — VM has guest, Python does not
}

const { primary, guest } = Astro.props;
---
```

**Brackets pattern** (lines 12–15, 122–125) — identical in Hero and Mentor:
```astro
<div class="brackets">
  <span></span><span></span><span></span><span></span>
</div>
```

**Guest mentor divider** (lines 62–68): Render only if `guest` prop is defined:
```astro
{guest && (
  <div class="mentor-divider" aria-hidden="true">
    <span class="line"></span>
    <span class="label">+ PROFESSOR CONVIDADO</span>
    <span class="line"></span>
  </div>
)}
{guest && <div class="mentor-grid reverse">...</div>}
```

---

### `src/components/sections/ForWho.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/ForWho.astro` (lines 1–293)

**Refactored frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";

interface ForWhoProps {
  eyebrow: string;
  titleHtml: string;
  isFor: Array<{ html: string }>;    // list items HTML
  isNot: Array<{ html: string }>;    // list items HTML
}

const { eyebrow, titleHtml, isFor, isNot } = Astro.props;
---
```

**Card structure pattern** (lines 13–183) — `.is-for` uses checkmark SVG (`polyline points="20 6 9 17 4 12"`), `.is-not` uses X SVG (`line x1="18" y1="6" x2="6" y2="18"`):
```astro
<div class="for-who">
  <div class="card is-for">
    <h3><span class="ic"><!-- checkmark svg --></span>É para você se…</h3>
    <ul>
      {isFor.map(item => (
        <li><!-- checkmark svg --><Fragment set:html={item.html} /></li>
      ))}
    </ul>
  </div>
  <div class="card is-not">
    <h3><span class="ic"><!-- X svg --></span>Não é para você se…</h3>
    <ul>
      {isNot.map(item => (
        <li><!-- X svg --><Fragment set:html={item.html} /></li>
      ))}
    </ul>
  </div>
</div>
```

---

### `src/components/sections/Bonuses.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/Bonuses.astro` (lines 1–160)

**Refactored frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";

interface Bonus {
  num: string;          // "BÔNUS 01"
  featured?: boolean;   // true → .bonus-card.featured
  originalPrice?: string; // "R$ 497" (shown as strikethrough)
  title: string;
  bodyHtml: string;
  delay?: number;       // animation-delay ms
}

interface BonusesProps {
  eyebrow: string;
  titleHtml: string;
  lede: string;
  bonuses: Bonus[];
}

const { eyebrow, titleHtml, lede, bonuses } = Astro.props;
---
```

**Bonus card template pattern** (lines 14–58):
```astro
{bonuses.map((bonus, i) => (
  <div class={`bonus-card${bonus.featured ? ' featured' : ''}`} data-stagger style={`animation-delay: ${bonus.delay ?? i * 80}ms`}>
    <div class="bonus-num">
      <span>{bonus.num}</span>
      {bonus.originalPrice && <span class="price"><s>{bonus.originalPrice}</s> GRÁTIS</span>}
    </div>
    <h3>{bonus.title}</h3>
    <p set:html={bonus.bodyHtml} />
  </div>
))}
```

---

### `src/components/sections/Faq.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/sections/Faq.astro` (lines 1–242)

**Refactored frontmatter pattern:**
```astro
---
import SectionHead from "../ui/SectionHead.astro";

interface FaqItem {
  question: string;
  answerHtml: string;   // may contain multiple <p> tags
}

interface FaqProps {
  eyebrow: string;
  titleHtml: string;
  items: FaqItem[];
}

const { eyebrow, titleHtml, items } = Astro.props;
---
```

**Details/summary pattern** (lines 13–160) — `<details>` with `.plus` toggle:
```astro
<div class="faq">
  {items.map(item => (
    <details>
      <summary>{item.question}<span class="plus">+</span></summary>
      <div class="ans" set:html={item.answerHtml} />
    </details>
  ))}
</div>
```

**Curriculum expandable pattern** (M.01 open, M.02–M.06 closed): The `isOpen` prop on ModuleDetails controls `open` attribute on `<details>`. Same pattern applies here if any FAQ item should default open (not needed per spec).

---

### `src/components/sections/FinalCTA.astro` (component, request-response — NEW)

**No analog:** This is the only entirely new section component.

**Interface** (from RESEARCH.md):
```typescript
interface FinalCtaProps {
  eyebrow: string;       // "PYTHON PARA NEURODIVERGENTES"
  headlineHtml: string;  // "Python do jeito que seu <span class=\"flame\">cérebro pede</span>."
  ctaHref: string;       // "#investimento"
  ctaText: string;       // "Quero começar agora"
}
```

**Full template and CSS** (from RESEARCH.md §FinalCTA — no existing file to copy from; use Button.astro for CTA):
```astro
---
import Button from "../ui/Button.astro";

const { eyebrow, headlineHtml, ctaHref, ctaText } = Astro.props;
---
<section class="final-cta" data-reveal>
  <div class="container">
    <div class="final-cta-inner">
      <p class="final-cta-eyebrow">{eyebrow}</p>
      <h2 class="final-cta-headline" set:html={headlineHtml} />
      <Button href={ctaHref} variant="primary" size="massive">
        {ctaText}
        <span class="arrow"><!-- arrow SVG --></span>
      </Button>
    </div>
  </div>
</section>
```

**CSS spec** (all new, from RESEARCH.md):
- Background: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,255,255,0.06), transparent 70%)`
- `border-top: 1px solid var(--hairline-strong)`
- `.final-cta-inner`: `max-width: 640px; margin: 0 auto; text-align: center`
- Eyebrow: JetBrains Mono 11px, `letter-spacing: 0.28em`, `color: var(--nucleo-eletrico)`, `margin-bottom: 16px`
- Headline: Chakra Petch `clamp(28px, 3vw, 44px)` weight 600, `text-wrap: balance`, `margin-bottom: 32px`
- `.flame`: `color: var(--nucleo-eletrico); font-style: italic; text-shadow: 0 0 32px rgba(0,255,255,0.6)`
- CTA: `Button` centered via `display: flex; justify-content: center` wrapper or `margin: 0 auto`
- Mobile: CTA button `width: 100%`

**Closest structural reference:** `Pricing.astro` guarantee section uses similar centered single-column layout with border-top.

---

### `src/components/layout/StickyCta.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/layout/StickyCta.astro` (lines 1–71)

**Current hardcoded values** (lines 5–13): `divido em <b>12× R$ 78,92</b>` (note: typo "divido em" should be "desde"), `href="#investimento"`, `Quero começar →`.

**Refactored frontmatter pattern:**
```astro
---
import Button from "../ui/Button.astro";

interface StickyCtaProps {
  priceLabel: string;   // "DESDE 12× R$ 78,92"
  ctaHref: string;      // "#investimento"
  ctaText: string;      // "Quero começar →"
}

const { priceLabel, ctaHref, ctaText } = Astro.props;
---
<div class="sticky-cta" data-testid="sticky-cta">
  <div class="meta" set:html={priceLabel} />
  <Button href={ctaHref} variant="primary" customClass="sticky-btn">
    {ctaText}
  </Button>
</div>
```

**Note:** The typo "divido em" in the current component is fixed by this refactor — VM LP will now pass a corrected label.

---

### `src/components/layout/UrgencyBar.astro` (component, request-response — REFACTOR)

**Analog:** Self — current `src/components/layout/UrgencyBar.astro` (lines 1–55)

**Current state:** Hardcoded `"54h de imersão + 6 sessões 1:1 + Toolkit Terraform · acesso por 12 meses"`. The commented-out props hint (`const { horas = "54h", sessoes = "6" } = Astro.props`) already anticipates parameterization.

**Refactored frontmatter pattern:**
```astro
---
interface UrgencyBarProps {
  content: string;   // full HTML allowed for <strong> highlights
}

const { content } = Astro.props;
---
<div class="urgency-bar" role="status" aria-label="Resumo do programa">
  <span class="live-dot" aria-hidden="true"></span>
  <Fragment set:html={content} />
</div>
```

**VM LP passes:** `"<strong>54h</strong> de imersão + <strong>6 sessões 1:1</strong> + <strong>Toolkit Terraform</strong> · acesso por <strong>12 meses</strong>"`
**Python LP passes:** `"<strong>60H DE CONTEÚDO</strong> · <strong>6 SESSÕES 1:1</strong> · <strong>BODY DOUBLING SEMANAL</strong> · <strong>ACESSO 12 MESES</strong>"`

---

### `tests/seo/seo-meta.test.ts` (test, static — MODIFY)

**Analog:** Self — current `tests/seo/seo-meta.test.ts` (lines 1–222)

**Pattern for new test 17** — copy test 16 (lines 186–196) structure exactly:
```typescript
it("17. dist/deep-dive-python-neurodivergentes/index.html og:image points to python-neurodivergentes-og.png", () => {
  const pythonIndexPath = join(DIST_DIR, "deep-dive-python-neurodivergentes/index.html");
  expect(
    existsSync(pythonIndexPath),
    `dist/deep-dive-python-neurodivergentes/index.html not found at ${pythonIndexPath}`
  ).toBe(true);
  const pythonHtml = readFileSync(pythonIndexPath, "utf-8");
  const ogImage = extractMetaContent(pythonHtml, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("python-neurodivergentes-og.png");
});
```

**Location:** Add inside the first `describe("SEO meta-tag static assertions...")` block, after test 16 (line 196), before the closing `}`  at line 197.

---

### `tests/e2e/hub.spec.ts` (test, e2e — MODIFY)

**Analog:** Self — current `tests/e2e/hub.spec.ts` (lines 1–134)

**Single line change** — line 44:
```typescript
// Before:
await expect(page.locator(".course-card")).toHaveCount(2);

// After:
await expect(page.locator(".course-card")).toHaveCount(3);
```

**Additional test to add** (after line 81, new test in "Hub load" describe):
```typescript
test("Python active course card link href contains /deep-dive-python-neurodivergentes/", async ({ page }) => {
  await page.goto("./");
  const courseLinks = page.locator(".course-card.active .course-link");
  await expect(courseLinks).toHaveCount(2); // VM + Python both active
  const hrefs = await courseLinks.evaluateAll(links => links.map(l => l.getAttribute("href")));
  expect(hrefs.some(h => h?.includes("/deep-dive-python-neurodivergentes/"))).toBe(true);
});
```

---

### `tests/e2e/python-lp.spec.ts` (test, e2e — NEW)

**Analog:** `tests/e2e/hub.spec.ts` + `tests/e2e/ec2-coming-soon.spec.ts`

**Test file structure pattern** (from hub.spec.ts lines 1–134):
```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Python LP load", () => {
  test("GET /deep-dive-python-neurodivergentes/ returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./deep-dive-python-neurodivergentes/");
    expect(response?.status()).toBe(200);
  });

  test("<h1> is visible and contains expected content", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Python");
  });

  test("primary CTA links to #investimento", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    const cta = page.locator('[data-testid="hero-cta-primary"]');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toContain("#investimento");
  });

  test("#investimento section is present", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("#investimento")).toBeVisible();
  });
});

test.describe("Python LP accessibility", () => {
  test("skip link has href='#main'", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("a.skip-link")).toHaveAttribute("href", "#main");
  });

  test("no critical axe-core violations (WCAG 2.0 A/AA)", async ({ page }) => {
    await page.goto("./deep-dive-python-neurodivergentes/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const criticalViolations = results.violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });
});

test.describe("Python LP responsive", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-python-neurodivergentes/");
    await expect(page.locator("h1")).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });
});
```

---

## Shared Patterns

### Props Interface Declaration (Astro frontmatter)
**Source:** `src/components/ui/Button.astro` lines 1–16, `src/components/ui/SectionHead.astro` lines 1–10
**Apply to:** All refactored section components
```astro
---
interface Props {
  requiredProp: string;
  optionalProp?: boolean;
}
const { requiredProp, optionalProp = false } = Astro.props;
---
```
All Astro components use `interface Props` (not exported, just declared) and destructure from `Astro.props`. Optional props use `= defaultValue` in destructuring.

### SectionHead Usage
**Source:** `src/components/ui/SectionHead.astro` lines 1–105
**Apply to:** All section components that refactor via SectionHead (PainPoints, Method, Curriculum, ForWho, Bonuses, Faq, Pricing)
```astro
<SectionHead
  eyebrow={eyebrow}
  titleHtml={titleHtml}
  lede={lede}
  center={true}  // optional: omit for left-aligned
/>
```
`titleHtml` uses `set:html` internally — HTML tags (including `.flame` spans) are safe to pass.

### `.flame` Span Pattern
**Source:** `src/components/ui/SectionHead.astro` lines 79–83
**Apply to:** All `titleHtml` props, FinalCTA `headlineHtml`
```css
h2.section-title :global(.flame) {
  color: var(--nucleo-eletrico);
  font-style: italic;
  text-shadow: 0 0 24px rgba(0, 255, 255, 0.45);
}
```
The `.flame` class is globally styled via `:global()` in SectionHead. Any `set:html` content can use `<span class="flame">` safely.

### Image as ImageMetadata Props
**Source:** `src/components/sections/Hero.astro` lines 3–4, `src/components/sections/Mentor.astro` lines 3–5
**Apply to:** Hero, Mentor (both need portrait prop)
```astro
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";
// In Props interface:
portrait: { src: ImageMetadata; alt: string };
// In template:
<Image src={portrait.src} alt={portrait.alt} loading="lazy" />
```
Image imports CANNOT be string paths — they must be `ImageMetadata` objects imported at the page level and passed as props.

### Brackets Decorative Pattern
**Source:** `src/components/sections/Hero.astro` lines 220–222, `src/components/sections/Mentor.astro` lines 12–15
**Apply to:** Hero portrait wrap, Mentor portrait (both)
```astro
<div class="brackets">
  <span></span><span></span><span></span><span></span>
</div>
```
CSS positions all 4 spans via `:nth-child()` selectors as corner brackets with `--nucleo-eletrico` border and `drop-shadow` glow. Copy CSS exactly.

### `data-reveal` Animation Attribute
**Source:** All section components (PainPoints line 5, Method line 5, Curriculum line 6, etc.)
**Apply to:** All `<section>` elements, FinalCTA
```astro
<section class="section-name" id="anchor" data-reveal>
```
`[data-reveal]` is picked up by IntersectionObserver in `Layout.astro <script>` — no JS needed in component. TrustBand is `<div>` NOT `<section>` and must NOT have `data-reveal`.

### `data-stagger` Animation Pattern
**Source:** `src/components/sections/Pricing.astro` lines 39, 55, 72... `src/components/sections/Bonuses.astro` lines 15, 28, 42
**Apply to:** Pricing includes list, Bonuses grid cards
```astro
<li data-stagger style="animation-delay: 80ms">
<!-- or dynamically: -->
<li data-stagger style={`animation-delay: ${i * 80}ms`}>
```
Each staggered item increments by 80ms.

### CSS Block Preservation Rule
**Source:** All component refactors
**Apply to:** ALL refactored section components
The `<style>` block of every refactored component is copied EXACTLY with zero changes. Only the frontmatter (add `interface Props` + `const {} = Astro.props`) and template (replace hardcoded values with prop bindings) change.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/sections/FinalCTA.astro` | component | request-response | No equivalent closing CTA section exists in the VM LP or any other page. CSS spec provided in RESEARCH.md §FinalCTA. Use `Button.astro` + `SectionHead` patterns as building blocks. |

---

## Metadata

**Analog search scope:** `src/pages/`, `src/components/sections/`, `src/components/layout/`, `src/components/ui/`, `src/data/`, `tests/e2e/`, `tests/seo/`
**Files scanned:** 20 source files read directly
**Pattern extraction date:** 2026-05-17
