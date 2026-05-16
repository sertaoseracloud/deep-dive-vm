---
phase: 04-animation-implementation
plan: "02"
subsystem: sections
tags: [scroll-reveal, data-reveal, intersection-observer, astro]
dependency_graph:
  requires: ["04-01"]
  provides: ["data-reveal em 8 seções alvo"]
  affects: ["src/layouts/Layout.astro (IO script encontra os 8 elementos via querySelectorAll('[data-reveal]'))"]
tech_stack:
  added: []
  patterns: ["data-reveal boolean HTML attribute no elemento section root"]
key_files:
  modified:
    - src/components/sections/Method.astro
    - src/components/sections/Curriculum.astro
    - src/components/sections/Bonuses.astro
    - src/components/sections/Faq.astro
    - src/components/sections/ForWho.astro
    - src/components/sections/Mentor.astro
    - src/components/sections/PainPoints.astro
    - src/components/sections/Testimonials.astro
decisions:
  - "data-reveal adicionado apenas no elemento section root de cada componente; sem alteração em elementos filhos"
  - "Pricing.astro excluido deste plano conforme especificacao — sera tratada em 04-05 com data-reveal + data-stagger juntos"
metrics:
  duration: "~5 minutos"
  completed: "2026-05-16"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 8
---

# Phase 4 Plan 02: ANIM-02 — data-reveal em 8 Secoes Summary

**One-liner:** Atributo booleano `data-reveal` adicionado no elemento `<section>` root de 8 componentes para que o IntersectionObserver do plano 04-01 os observe via `querySelectorAll('[data-reveal]')`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Adicionar data-reveal nas 8 secoes alvo | 44a2746 | 8 arquivos `.astro` |

## Files Modified

| Arquivo | Elemento root alterado | Atributo adicionado |
|---------|------------------------|---------------------|
| `src/components/sections/Method.astro` | `<section id="metodo">` | `data-reveal` |
| `src/components/sections/Curriculum.astro` | `<section id="ementa">` | `data-reveal` |
| `src/components/sections/Bonuses.astro` | `<section class="bonuses" id="bonus">` | `data-reveal` |
| `src/components/sections/Faq.astro` | `<section id="faq">` | `data-reveal` |
| `src/components/sections/ForWho.astro` | `<section id="selecao">` | `data-reveal` |
| `src/components/sections/Mentor.astro` | `<section class="mentor" id="mentor">` | `data-reveal` |
| `src/components/sections/PainPoints.astro` | `<section class="pain" id="pain">` | `data-reveal` |
| `src/components/sections/Testimonials.astro` | `<section id="depoimentos">` | `data-reveal` |

## Verification Results

**data-reveal em 8 arquivos:**
```
grep -l "data-reveal" src/components/sections/{Method,Curriculum,Bonuses,Faq,ForWho,Mentor,PainPoints,Testimonials}.astro | wc -l
→ 8
```

**Pricing.astro sem data-reveal (escopo do 04-05):**
```
grep "data-reveal" src/components/sections/Pricing.astro
→ 0 resultados (correto)
```

**npm run build:**
```
✓ Completed in 13.85s.
1 page(s) built in 14.96s
Build Complete!
```

## Deviations from Plan

None — plano executado exatamente como especificado. O atributo `data-reveal` foi adicionado apenas ao elemento `<section>` root de cada componente, sem alterar classes CSS, conteudo, imports ou frontmatter.

## Known Stubs

None — sem dados stub. Os atributos sao estaticos no markup de servidor.

## Threat Flags

None — atributos HTML estaticos em markup de servidor; sem novo vetor de injecao ou nova superficie de seguranca.

## Self-Check: PASSED

- [x] 8 arquivos modificados existem em disco
- [x] commit 44a2746 existe em git log
- [x] npm run build passou sem erros
- [x] Pricing.astro nao contem data-reveal
