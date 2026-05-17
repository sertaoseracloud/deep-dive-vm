---
phase: 04-animation-implementation
plan: "01"
subsystem: layout
tags: [css, animation, intersection-observer, scroll-reveal, stagger, easing]
dependency_graph:
  requires: []
  provides:
    - "--ease-entrance CSS custom property (global)"
    - "--ease-micro CSS custom property (global)"
    - "[data-reveal]/[data-revealed] scroll reveal CSS"
    - "@keyframes fade-up"
    - "[data-stagger] animation orchestration"
    - "IntersectionObserver script in Layout.astro"
  affects:
    - "src/components/sections/*.astro (wave 2 — add data-reveal attributes)"
    - "src/components/sections/Bonuses.astro (ANIM-05 data-stagger)"
    - "src/components/sections/Pricing.astro (ANIM-05 data-stagger)"
    - "src/components/NavBar.astro (ANIM-03 --ease-micro)"
    - "src/components/Button.astro (ANIM-03 --ease-micro)"
tech_stack:
  added: []
  patterns:
    - "IO+CSS attribute toggle (data-reveal/data-revealed)"
    - "CSS animation-play-state orchestration via parent attribute"
    - "astro:before-swap cleanup for View Transitions"
key_files:
  created: []
  modified:
    - "src/layouts/Layout.astro"
decisions:
  - "Sem will-change em [data-reveal] nem [data-stagger] — anti-pattern per RESEARCH.md"
  - "Script sem is:inline e sem DOMContentLoaded — Astro defer já garante execução após DOM"
  - "observer nomeado como 'observer' para consistência com Pattern 2 do RESEARCH.md"
  - "threshold: 0.15 conforme D-SCROLL-02 do CONTEXT"
metrics:
  duration: "12 min"
  completed: "2026-05-16"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
  commits: 1
requirements_satisfied:
  - ANIM-02
  - ANIM-03
  - ANIM-05
---

# Phase 4 Plan 01: CSS Foundation — Ease Tokens, Scroll Reveal, Stagger Summary

**One-liner:** CSS infrastructure para scroll reveal e stagger via IO+CSS attribute toggle com dois tokens de easing globais (`--ease-entrance`, `--ease-micro`) e IntersectionObserver fire-once em Layout.astro.

## What Was Built

### Task 1 — CSS custom properties e regras de animacao

Adicionado ao bloco `<style is:global>` em `src/layouts/Layout.astro`:

**No seletor `:root`** (após `--hairline-strong`):
- `--ease-entrance: cubic-bezier(0.25, 1, 0.5, 1);` — para entradas, reveals e stagger
- `--ease-micro: cubic-bezier(0.0, 0.0, 0.2, 1);` — para hover, toggle e micro-interacoes

**Bloco ANIM-02 (scroll reveal):**
- `[data-reveal]`: `opacity: 0; transform: translateY(20px); transition: opacity 400ms var(--ease-entrance), transform 400ms var(--ease-entrance);`
- `[data-reveal][data-revealed]`: `opacity: 1; transform: none;`
- `@media (prefers-reduced-motion: reduce)` com `[data-reveal]`: `opacity: 1; transform: none; transition: none;`

**Bloco ANIM-05 (keyframes e stagger):**
- `@keyframes fade-up`: from `opacity:0; transform:translateY(16px)` to `opacity:1; transform:none`
- `[data-stagger]`: `animation: fade-up 400ms var(--ease-entrance) forwards; animation-play-state: paused;`
- `[data-revealed] [data-stagger]`: `animation-play-state: running;`
- `@media (prefers-reduced-motion: reduce)` com `[data-stagger]`: `animation: none; opacity: 1; transform: none;`

### Task 2 — Script IntersectionObserver

Adicionado `<script>` antes de `</body>` em `src/layouts/Layout.astro`:

- Seleciona `document.querySelectorAll("[data-reveal]")` em `revealEls`
- Guard `if (revealEls.length > 0)` antes de criar observer
- `new IntersectionObserver(callback, { threshold: 0.15 })`
- Callback: `if (entry.isIntersecting) { entry.target.setAttribute("data-revealed", ""); observer.unobserve(entry.target); }`
- `revealEls.forEach(el => observer.observe(el))`
- Cleanup: `document.addEventListener("astro:before-swap", () => observer.disconnect(), { once: true })`

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| `--ease-entrance` presente | `grep -c "\-\-ease-entrance"` | 4 ocorrencias |
| `--ease-micro` presente | `grep -c "\-\-ease-micro"` | 1 ocorrencia |
| `[data-reveal]` regras | `grep -c "\[data-reveal\]"` | >= 2 ocorrencias |
| `@keyframes fade-up` | `grep -c "@keyframes fade-up"` | 1 ocorrencia |
| `[data-stagger]` regras | `grep -c "\[data-stagger\]"` | >= 2 ocorrencias |
| `prefers-reduced-motion` blocos | `grep -c "prefers-reduced-motion"` | 2 ocorrencias |
| `IntersectionObserver` | `grep -c "IntersectionObserver"` | 1 ocorrencia |
| `unobserve` fire-once | `grep -c "unobserve"` | 1 ocorrencia |
| `astro:before-swap` cleanup | `grep -c "astro:before-swap"` | 1 ocorrencia |
| `data-revealed` (CSS + script) | `grep -c "data-revealed"` | 3 ocorrencias |
| `npm run build` | build completo | PASSED — 1 page built in 12.59s |

## Commits

| Hash | Description |
|------|-------------|
| 71331d1 | feat(04-01): CSS foundation — ease tokens, data-reveal/stagger CSS, IO script |

## Deviations from Plan

None — plano executado exatamente como escrito.

- Sem `will-change` adicionado (restricao respeitada)
- Sem `:hover` ou transicoes de cor (restricao respeitada)
- Variaveis `:root` existentes intactas — apenas as duas novas foram appended
- Script sem `is:inline` e sem `DOMContentLoaded` wrapper

## Known Stubs

None — este plano nao cria dados ou UI; apenas infraestrutura CSS+JS. Os planos wave 2 e 3 vao consumir esses tokens e regras.

## Threat Flags

Nenhum. O script IO acessa apenas atributos `data-*` do DOM proprio da pagina, sem input externo, eval ou fetch. Conforme T-04-01 (accept) no threat register do plano.

## Self-Check: PASSED

- [x] `src/layouts/Layout.astro` modificado e existente
- [x] Commit `71331d1` verificado em git log
- [x] `npm run build` passou sem erros TypeScript
- [x] Todos os greps de verificacao retornam contagens >= esperadas
