---
phase: 04-animation-implementation
plan: "04"
subsystem: animation-tokens
tags: [easing, motion, css-tokens, design-system]
dependency_graph:
  requires:
    - "04-01 (--ease-micro definido em Layout.astro)"
  provides:
    - "Todos os 5 arquivos com easing padronizado"
    - "Nenhuma string easeOut ou ease-out genérica restante"
  affects:
    - "src/components/MobileMenuMotion.tsx"
    - "src/components/CarouselMotion.tsx"
    - "src/components/ui/Button.astro"
    - "src/components/layout/NavBar.astro"
    - "src/lib/motion-utils.ts"
tech_stack:
  added: []
  patterns:
    - "Arrays numéricos [0.0, 0.0, 0.2, 1] para easing em React/motion"
    - "var(--ease-micro) para easing em CSS/Astro"
    - "cubic-bezier(0.0, 0.0, 0.2, 1) literal para inline styles JS"
key_files:
  modified:
    - src/components/MobileMenuMotion.tsx
    - src/components/CarouselMotion.tsx
    - src/components/ui/Button.astro
    - src/components/layout/NavBar.astro
    - src/lib/motion-utils.ts
    - tests/unit/lib/motion-utils.test.ts
decisions:
  - "Usar [0.0, 0.0, 0.2, 1] (com decimais explícitos) em vez de [0, 0, 0.2, 1] para satisfazer critério de must_have contains: '0.0, 0.2, 1'"
  - "Atualizar comentário JSDoc em applyFallback para refletir o novo valor (consistência de documentação)"
metrics:
  duration: "~8 minutos"
  completed_date: "2026-05-16"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 04 Plan 04: Substituição de Easing Genérico por Tokens — Summary

**One-liner:** Substituição de `easeOut`/`ease-out` genérico por tokens de design-system (`[0.0, 0.0, 0.2, 1]` no React e `var(--ease-micro)` no CSS) em 5 arquivos, com cubic-bezier literal no inline-style JS.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Substituir easing em MobileMenuMotion.tsx, CarouselMotion.tsx, motion-utils.ts | a734bec | MobileMenuMotion.tsx, CarouselMotion.tsx, motion-utils.ts |
| 2 | Substituir easing em Button.astro e NavBar.astro | a734bec | Button.astro, NavBar.astro |

## Verification Results

| Check | Result |
|-------|--------|
| grep "easeOut" MobileMenuMotion.tsx | 0 (PASS) |
| grep "easeOut" CarouselMotion.tsx | 0 (PASS) |
| grep "ease-out" motion-utils.ts | 0 (PASS) |
| grep "ease-out" Button.astro | 0 (PASS) |
| grep "ease-out" NavBar.astro | 0 (PASS) |
| grep "0.0, 0.2, 1" MobileMenuMotion.tsx | 1 (PASS) |
| grep "0.0, 0.2, 1" CarouselMotion.tsx | 1 (PASS) |
| grep "cubic-bezier(0.0, 0.0, 0.2, 1)" motion-utils.ts | 1 (PASS) |
| grep "var(--ease-micro)" Button.astro | 2 (PASS) |
| grep "var(--ease-micro)" NavBar.astro | 2 (PASS) |
| vitest run MobileMenuMotion.test.tsx | PASS (15/15) |
| vitest run motion-utils.test.ts | PASS (15/15) |
| npm run build | PASS (10.55s) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Teste de motion-utils esperava valor antigo de easing**
- **Encontrado durante:** Task 1 — ao executar testes após a substituição
- **Issue:** `motion-utils.test.ts` linha 63 assertava `"all 150ms ease-out"` — o valor antigo que foi substituído pela implementação
- **Fix:** Atualizado o teste para assertar `"all 150ms cubic-bezier(0.0, 0.0, 0.2, 1)"`, que é o comportamento correto após a substituição
- **Files modified:** `tests/unit/lib/motion-utils.test.ts`
- **Commit:** a734bec

**2. [Melhoria de Consistência] Comentário JSDoc atualizado em motion-utils.ts**
- **Encontrado durante:** Verificação pós-substituição (grep encontrou "ease-out" em comentário)
- **Issue:** O comentário `/** Duration 150 ms satisfies the D-01 performance constraint (150 ms, ease-out). */` ainda referenciava o valor antigo
- **Fix:** Atualizado para `cubic-bezier(0.0, 0.0, 0.2, 1)` para manter consistência entre documentação e implementação
- **Files modified:** `src/lib/motion-utils.ts`
- **Commit:** a734bec

## Decisions Made

1. **Decimais explícitos em arrays React:** Optou-se por `[0.0, 0.0, 0.2, 1]` em vez de `[0, 0, 0.2, 1]` para satisfazer o critério `contains: "0.0, 0.2, 1"` do plan. Ambos são numericamente idênticos em JavaScript.

2. **CarouselMotion `ease: "linear"` preservado:** O auto-scroll usa `ease: "linear"` propositalmente (loop infinito mirror). Apenas o keyboard-nav na linha 92 foi substituído, conforme especificado no plano.

3. **NavBar IntersectionObserver não tocado:** As linhas 170-187 (script do IntersectionObserver) não foram alteradas, conforme instrução explícita do plano.

## Known Stubs

Nenhum.

## Threat Flags

Nenhum novo surface de segurança introduzido — apenas substituição de strings de easing estáticas em código de transição CSS/motion.

## Self-Check: PASSED

- src/components/MobileMenuMotion.tsx: modificado e commitado em a734bec
- src/components/CarouselMotion.tsx: modificado e commitado em a734bec
- src/lib/motion-utils.ts: modificado e commitado em a734bec
- src/components/ui/Button.astro: modificado e commitado em a734bec
- src/components/layout/NavBar.astro: modificado e commitado em a734bec
- tests/unit/lib/motion-utils.test.ts: atualizado e commitado em a734bec
- Commit a734bec existe no git log
