---
phase: 09-python-neurodivergentes
plan: 02
subsystem: landing-page-components
tags: [refactor, data-driven, props, astro, python-lp, neurodivergentes]
dependency_graph:
  requires:
    - 09-01 (python-course.ts, cursos.ts Python ativo, OG image)
  provides:
    - 11 componentes data-driven (props-based)
    - FinalCTA.astro novo componente
    - LP Python /deep-dive-python-neurodivergentes/
    - VM LP sem regressão
  affects:
    - src/components/sections/*.astro (10 refatorados)
    - src/components/ui/ModuleDetails.astro (estendido)
    - src/pages/deep-dive-vm/index.astro (props explícitas)
    - src/pages/deep-dive-python-neurodivergentes/index.astro (nova)
tech_stack:
  added: []
  patterns:
    - props-based data-driven components (interface Props + Astro.props destructuring)
    - ImageMetadata prop para imagens (sem import hardcoded no componente)
    - Fragment set:html para SVG e HTML inline
    - Array.map para iteração de listas (includes, cards, steps, modules, bonuses, faq)
key_files:
  created:
    - src/components/sections/FinalCTA.astro
    - src/pages/deep-dive-python-neurodivergentes/index.astro
  modified:
    - src/components/sections/Pricing.astro
    - src/components/sections/Hero.astro
    - src/components/sections/TrustBand.astro
    - src/components/sections/PainPoints.astro
    - src/components/sections/Method.astro
    - src/components/sections/Curriculum.astro
    - src/components/sections/Mentor.astro
    - src/components/sections/ForWho.astro
    - src/components/sections/Bonuses.astro
    - src/components/sections/Faq.astro
    - src/components/ui/ModuleDetails.astro
    - src/pages/deep-dive-vm/index.astro
decisions:
  - "Pricing.astro refatorado primeiro como modelo — valores VM extraídos antes de substituir hardcodes"
  - "ModuleDetails: slot substituído por tracks prop para permitir data-driven via Curriculum"
  - "Mentor.astro: guest prop opcional — Python LP recebe apenas primary, VM LP recebe guest também"
  - "TrustBand: mantido como <div> (não section) sem data-reveal — decisão de acessibilidade pré-existente"
  - "Hero.astro: metaBadges com icon como string HTML (Fragment set:html) para permitir SVGs inline via prop"
  - "FinalCTA: :global(.final-cta h2.final-cta-headline .flame) para evitar headline sem estilo"
metrics:
  duration: ~45min
  completed: 2026-05-17
  tasks_completed: 2
  files_created: 2
  files_modified: 12
---

# Phase 09 Plan 02: Refatoração Data-Driven + LP Python Summary

## One-liner

Refatoração de 11 componentes de seção para props-based, criação de FinalCTA.astro e LP Python completa em /deep-dive-python-neurodivergentes/ com zero regressão na VM LP.

## What Was Built

### Tarefa 1: 11 Componentes Data-Driven

Todos os 10 componentes de seção + ModuleDetails foram refatorados de hardcoded para props-based:

| Componente | Interface | Mudança principal |
|------------|-----------|------------------|
| Pricing.astro | PricingProps (14 campos) | 8 includes via map, guarantee via prop, ribbon/tier/courseName binding |
| Hero.astro | HeroProps (11 campos) | Remove import claudio1, portrait como ImageMetadata, metaBadges iterados |
| TrustBand.astro | TrustBandProps | label + items[], mantém `<div>` (não `<section>`) |
| PainPoints.astro | PainPointsProps | cards[] com num/titleHtml/body |
| Method.astro | MethodProps | steps[] com svgHtml/label/title/bodyHtml |
| Curriculum.astro | CurriculumProps | meta + modules[] com tracks, passa tracks para ModuleDetails |
| ModuleDetails.astro | Props (estendido) | Adiciona tracks[], substitui `<slot />` por tracks.map() |
| Mentor.astro | MentorProps | primary + guest? opcional, remove imports hardcoded |
| ForWho.astro | ForWhoProps | isFor[] + isNot[] como arrays |
| Bonuses.astro | BonusesProps | bonuses[] com featured/delay/originalPrice |
| Faq.astro | FaqProps | items[] com question/answerHtml |

A VM LP (`deep-dive-vm/index.astro`) foi atualizada com todas as props explícitas, preservando 100% do conteúdo original.

### Tarefa 2: FinalCTA.astro + LP Python + Backward-Compat

**FinalCTA.astro** (novo): componente com `interface FinalCtaProps`, `data-reveal`, background radial-gradient, `:global(.final-cta h2.final-cta-headline .flame)` rule, mobile CTA `width: 100%`.

**LP Python** (`/deep-dive-python-neurodivergentes/`):
- Layout com `ogImage="/python-neurodivergentes-og.png"`, URL canônica, JSON-LD Course com `courseCode: "PY-ND-DEEP-DIVE"`
- 11 seções compostas: Hero → TrustBand → PainPoints → Method → Curriculum → Mentor → ForWho → Bonuses → Pricing → Faq → FinalCTA → Footer
- Sem `<Testimonials />` (deferred per CONTEXT.md)
- `PYTHON_COURSE.hotmartUrl` passado ao Pricing
- Conteúdo 100% Python neurodivergentes (não reutiliza textos VM)

**VM LP backward-compat**: valores extraídos antes do refator e passados explicitamente — "TURMA CHAMA AZUL 01" presente no HTML buildado.

## Verification Results

```
npm run build: exit 0 (4 páginas geradas)
dist/deep-dive-python-neurodivergentes/index.html: EXISTE
og:image python-neurodivergentes-og.png: count 3 (og:image, twitter:image, canonical)
JSON-LD courseCode PY-ND-DEEP-DIVE: count 1
dist/deep-dive-vm/index.html TURMA CHAMA AZUL: count 1 (sem regressão)
dist/index.html deep-dive-python-neurodivergentes: count 1 (hub card ativo)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Feature] :global(.flame) em FinalCTA com seletor mais específico**
- **Found during:** Tarefa 2, criação de FinalCTA.astro
- **Issue:** O PLAN especificava `:global(.flame)` dentro de FinalCTA, mas Astro scopa estilos por componente. O seletor `:global(.flame)` sozinho afetaria `.flame` em toda a página, conflitando com os estilos de SectionHead
- **Fix:** Usado seletor mais específico `:global(.final-cta h2.final-cta-headline .flame)` para evitar vazamento de estilo
- **Files modified:** src/components/sections/FinalCTA.astro

**2. [Rule 1 - Bug] Hero: metaBadges com icon como string HTML**
- **Found during:** Tarefa 1, refatoração de Hero.astro
- **Issue:** O PLAN especificava `metaBadges: Array<{ icon: string; label: string }>` mas o template original usava SVG inline. A interface foi mantida com `icon: string` e o template usa `<Fragment set:html={badge.icon} />` para renderizar SVGs inline como strings
- **Fix:** Hero.astro usa `Fragment set:html={badge.icon}` — VM LP e Python LP passam SVG como string HTML
- **Files modified:** src/components/sections/Hero.astro, src/pages/deep-dive-vm/index.astro

## Known Stubs

- `PYTHON_COURSE.hotmartUrl` = `"https://pay.hotmart.com/"` — placeholder documentado em python-course.ts, deve ser substituído antes do deploy real

## Threat Flags

Nenhum novo surface de segurança introduzido. Todos os `set:html` provêm de arquivos de dados em código-fonte (não de input de usuário). Confirmado por threat model do plano: T-09-03 disposition = accept.

## Self-Check

- [x] src/components/sections/FinalCTA.astro existe com interface FinalCtaProps, data-reveal, final-cta class
- [x] src/pages/deep-dive-python-neurodivergentes/index.astro existe com ogImage, courseCode PY-ND-DEEP-DIVE
- [x] dist/deep-dive-python-neurodivergentes/index.html existe após build
- [x] dist/deep-dive-vm/index.html contém TURMA CHAMA AZUL (sem regressão)
- [x] dist/index.html contém deep-dive-python-neurodivergentes (hub card ativo)
- [x] Commits b58cee4 (tarefa 1) e 4856c71 (tarefa 2) existem

## Self-Check: PASSED
