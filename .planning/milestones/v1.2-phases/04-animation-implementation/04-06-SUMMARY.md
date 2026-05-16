---
phase: 04-animation-implementation
plan: "06"
subsystem: ui
tags: [animation, stagger, astro, css, data-stagger, data-reveal]

requires:
  - phase: 04-01
    provides: "@keyframes fade-up, [data-stagger] e [data-revealed] [data-stagger] CSS em Layout.astro"
  - phase: 04-02
    provides: "data-reveal em Bonuses.astro (seção pai dos bonus-card)"

provides:
  - "3 bonus-card em Bonuses.astro com data-stagger e animation-delay 0/80/160ms"
  - "section.pricing com data-reveal ativando o IntersectionObserver de 04-01"
  - "8 li de .price-includes com data-stagger e animation-delay 0–560ms (step 80ms)"
  - "ease-out substituído por var(--ease-micro) em .price-card e @media reduced-motion"

affects:
  - 04-animation-implementation
  - verifications futuras de animação

tech-stack:
  added: []
  patterns:
    - "data-stagger + animation-delay inline para stagger coordenado sem JS adicional"
    - "var(--ease-micro) como token de easing para transições hover"

key-files:
  created: []
  modified:
    - src/components/sections/Bonuses.astro
    - src/components/sections/Pricing.astro

key-decisions:
  - "Stagger implementado via atributos inline no HTML (data-stagger + style animation-delay) — sem iteração Astro, mantendo estrutura estática dos cards"
  - "ease-out substituído por var(--ease-micro) tanto no estado normal quanto no bloco @media (prefers-reduced-motion: reduce) do .price-card para consistência de tokens"

patterns-established:
  - "Stagger pattern: section-pai com data-reveal + filhos com data-stagger + style animation-delay inline"

requirements-completed:
  - ANIM-05
  - ANIM-03

duration: 8min
completed: 2026-05-16
---

# Phase 04 Plan 06: Stagger em bonus-card e price-includes, ease token em Pricing — Summary

**Stagger coordenado via data-stagger + animation-delay inline nos 3 bonus-card e 8 li de price-includes, com data-reveal em Pricing.astro e substituicao de ease-out por var(--ease-micro) no .price-card**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-16T09:03:00Z
- **Completed:** 2026-05-16T09:11:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Bonuses.astro: 3 bonus-card receberam data-stagger e animation-delay 0/80/160ms — stagger coordenado com a section-pai (ja tem data-reveal de 04-02)
- Pricing.astro: section.pricing recebeu data-reveal, ativando o IntersectionObserver de 04-01 para a secao de preco
- Pricing.astro: 8 li de .price-includes receberam data-stagger e animation-delay de 0 a 560ms (incremento 80ms) — revelacao sequencial ao scroll
- Pricing.astro: ease-out substituido por var(--ease-micro) em .price-card (transicao hover) e no bloco @media (prefers-reduced-motion: reduce)
- npm run build passou sem erros

## Task Commits

1. **Task 1 + Task 2: stagger bonus-card e price-includes, ease token** - `d012ca6` (feat)

**Plan metadata:** a completar com commit de docs

## Files Created/Modified

- `src/components/sections/Bonuses.astro` — 3 bonus-card com data-stagger + animation-delay 0/80/160ms; data-reveal na section preservado
- `src/components/sections/Pricing.astro` — data-reveal na section, 8 li com data-stagger + animation-delay 0-560ms, ease-out -> var(--ease-micro)

## Decisions Made

- Stagger via atributos HTML inline (nao iteracao Astro) — mantem estrutura estatica dos 3 cards e 8 li, mais legivel para manutencao futura
- ease-out substituido em ambos os contextos CSS (normal + @media reduced-motion) para garantir consistencia de tokens em todos os cenarios de movimento

## Deviations from Plan

None — plano executado exatamente como especificado. A substituicao em @media (prefers-reduced-motion: reduce) foi prevista explicitamente na nota da Task 2.

## Issues Encountered

None — build passou na primeira tentativa, todos os greps de verificacao confirmaram contagens corretas.

## User Setup Required

None — sem configuracao externa necessaria.

## Next Phase Readiness

- ANIM-05 (stagger) fechado: bonus-card e price-includes com stagger coordenado
- ANIM-03 (ease tokens) fechado para Pricing.astro
- Todos os elementos-chave das secoes Bonuses e Pricing tem agora data-reveal + data-stagger operacionais
- O CSS de Layout.astro (04-01) ja define todas as regras necessarias — nenhum JS adicional necessario

---
*Phase: 04-animation-implementation*
*Completed: 2026-05-16*
