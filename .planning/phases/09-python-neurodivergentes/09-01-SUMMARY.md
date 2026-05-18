---
phase: 09-python-neurodivergentes
plan: 01
subsystem: ui
tags: [astro, sharp, typescript, data-driven, components]

# Dependency graph
requires: []
provides:
  - "public/python-neurodivergentes-og.png — OG image 1200x630 gerado via sharp (base claudio2.png)"
  - "src/data/python-course.ts — PYTHON_COURSE const com hotmartUrl placeholder, route e ogImage"
  - "src/data/courses.ts — array de 3 cursos com Python como 3a entrada status active"
  - "UrgencyBar.astro — componente data-driven com prop content: string"
  - "StickyCta.astro — componente data-driven com props priceLabel, ctaHref, ctaText"
affects:
  - 09-02
  - wave-2
  - deep-dive-vm-lp

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Props interface + Fragment set:html para componentes de layout com conteudo HTML"
    - "python-course.ts como arquivo de constantes por curso (seguindo padrao social-links.ts)"
    - "OG image gerada via script sharp inline deletado apos execucao"

key-files:
  created:
    - "public/python-neurodivergentes-og.png"
    - "src/data/python-course.ts"
  modified:
    - "src/data/courses.ts"
    - "src/components/layout/UrgencyBar.astro"
    - "src/components/layout/StickyCta.astro"
    - "src/pages/deep-dive-vm/index.astro"

key-decisions:
  - "UrgencyBar aceita content: string com HTML via Fragment set:html (flexivel para qualquer curso)"
  - "StickyCta aceita priceLabel como HTML string (permite bold inline via <b> sem props separadas)"
  - "VM LP passa valores hardcoded originais como props explicitas — sem extrair vm-course.ts (simplificidade)"
  - "Typo 'divido em' corrigido no refator StickyCta (VM LP passa 'DESDE' via prop)"

patterns-established:
  - "Componentes de layout recebem HTML como string via set:html — nao usar slots para conteudo dinamico"
  - "CSS de componentes refatorados permanece completamente inalterado — apenas camada de props adicionada"

requirements-completed: [PY-03, PY-04]

# Metrics
duration: 15min
completed: 2026-05-17
---

# Phase 9 Plan 01: Python para Neurodivergentes — Infrastructure Summary

**OG image 1200x630 via sharp, PYTHON_COURSE constants file, courses.ts com 3 entradas, e UrgencyBar/StickyCta refatorados para data-driven com props tipadas**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-17T22:55:00Z
- **Completed:** 2026-05-17T23:02:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- OG image `public/python-neurodivergentes-og.png` gerada (1200×630, format png) antes do primeiro build
- `src/data/python-course.ts` criado com `PYTHON_COURSE as const` (hotmartUrl placeholder, route, ogImage)
- `src/data/courses.ts` estendido para 3 entradas — Python como status `'active'` (hub renderiza automaticamente)
- `UrgencyBar.astro` refatorado: Props `{ content: string }`, hardcode VM removido do componente
- `StickyCta.astro` refatorado: Props `{ priceLabel, ctaHref, ctaText }`, typo "divido em" corrigido
- `deep-dive-vm/index.astro` atualizado com props explicitas — VM LP continua funcional sem regressao
- `npm run build` exit 0, `dist/deep-dive-vm/index.html` gerado sem erros TypeScript

## Task Commits

1. **Tarefa 1: OG image + python-course.ts + courses.ts** - `99dcf04` (feat)
2. **Tarefa 2: UrgencyBar + StickyCta data-driven + VM LP props** - `bab258c` (feat)

## Files Created/Modified

- `public/python-neurodivergentes-og.png` — OG image 1200x630 gerada via sharp (base claudio2.png)
- `src/data/python-course.ts` — PYTHON_COURSE com hotmartUrl placeholder, route e ogImage
- `src/data/courses.ts` — 3a entrada: Python para Neurodivergentes, status active
- `src/components/layout/UrgencyBar.astro` — data-driven via Props { content: string }
- `src/components/layout/StickyCta.astro` — data-driven via Props { priceLabel, ctaHref, ctaText }
- `src/pages/deep-dive-vm/index.astro` — props explicitas para UrgencyBar e StickyCta

## Decisions Made

- `UrgencyBar` usa `content: string` (HTML via `Fragment set:html`) em vez de items array — simplicidade maxima, qualquer marcacao HTML suportada
- `StickyCta` usa `priceLabel: string` como HTML string — permite `<b>12x R$ 78,92</b>` inline sem props separadas para bold/value
- VM LP passa valores inline em `index.astro`, sem criar `vm-course.ts` — seguindo recomendacao do RESEARCH.md (Open Question 1)
- Typo "divido em" corrigido para "DESDE" via prop — nao mais hardcoded no componente

## Deviations from Plan

None — plano executado exatamente como especificado. CSS de ambos os componentes permanece completamente inalterado.

## Issues Encountered

None — todos os passos executaram sem erros. Build verde na primeira tentativa.

## User Setup Required

None — nenhuma configuracao externa necessaria. O campo `hotmartUrl` em `python-course.ts` e um placeholder que deve ser substituido pela URL real antes do deploy (documentado com comentario inline no arquivo).

## Next Phase Readiness

- Wave 1 completo: OG image existe em `public/`, `courses.ts` tem Python ativo, componentes de layout sao data-driven
- Wave 2 pode criar `src/pages/deep-dive-python-neurodivergentes/index.astro` e refatorar section components (Hero, Pricing, etc.)
- Hub ja exibira card Python ativo apos o build (hub renderiza a partir do array `courses`)
- Sem blockers para Wave 2

---
*Phase: 09-python-neurodivergentes*
*Completed: 2026-05-17*
