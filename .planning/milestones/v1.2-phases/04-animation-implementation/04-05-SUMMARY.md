---
phase: 04-animation-implementation
plan: "05"
subsystem: SettingsToggle
tags: [tdd, motion, spring, framer-motion, react-component]
dependency_graph:
  requires: ["04-01"]
  provides: ["ANIM-04"]
  affects: ["src/components/SettingsToggle.tsx", "tests/unit/components/SettingsToggle.test.ts"]
tech_stack:
  added: ["motion/react (motion.span, MotionConfig)"]
  patterns: ["TDD RED/GREEN", "spring animation", "compositor-only transform (x)", "reducedMotion gate"]
key_files:
  modified:
    - src/components/SettingsToggle.tsx
    - tests/unit/components/SettingsToggle.test.ts
decisions:
  - "left dinâmico removido; left fixo em 2px + animate.x=16 via transform (compositor-only, sem reflow)"
  - "transition condicional: spring quando motionEnabled=true, duration:0 quando false (D-TOGGLE-03)"
  - "mock motion/react via vi.mock serializa animate/transition em data-attributes para inspecção DOM"
metrics:
  duration: "~8 minutos"
  completed: "2026-05-16T11:55:49Z"
  tasks_completed: 2
  files_changed: 2
---

# Phase 04 Plan 05: SettingsToggle Spring Indicador e Fade Label Summary

SettingsToggle refatorado com motion.span spring (x:0/16, stiffness:400, damping:30) no indicador e fade opacity (0.4/1) no label usando motion/react, removendo reflow de layout via CSS transition:left.

## What Was Built

O componente `SettingsToggle.tsx` foi refatorado seguindo TDD:

- **Indicador (bolinha branca)**: `<span>` substituído por `<motion.span data-testid="motion-indicator">` com `animate={{ x: motionEnabled ? 16 : 0 }}` e transição spring (stiffness:400, damping:30) quando ligado, instantânea (duration:0) quando desligado.
- **Label "Animações"**: `<span>` substituído por `<motion.span data-testid="motion-label">` com `animate={{ opacity: motionEnabled ? 1 : 0.4 }}` e `transition={{ duration: 0.2, ease: [0,0,0.2,1] }}`.
- **MotionConfig**: componente inteiro envolto em `<MotionConfig reducedMotion="user">` para respeitar preferências do sistema operacional.
- **Eliminação de reflow**: `left: motionEnabled ? "18px" : "2px"` e `transition: "left 0.15s ease-out"` removidos — left agora fixo em "2px", movimento via transform x (compositor-only).

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | `2f519a0` | PASSED — 6 novos testes falharam conforme esperado |
| GREEN (feat) | `0100a3f` | PASSED — todos 10 testes passam |

## Task Commits

| Task | Tipo | Commit | Descrição |
|------|------|--------|-----------|
| Task 1 RED | test | `2f519a0` | RED — SettingsToggle.test.ts motion.span tests |
| Task 2 GREEN | feat | `0100a3f` | ANIM-04 — SettingsToggle spring indicador e fade label |

## Verification Results

```
grep -c "motion.span" src/components/SettingsToggle.tsx  → 3 (>= 2)
grep -c "MotionConfig" src/components/SettingsToggle.tsx → 3 (>= 1)
grep "stiffness" src/components/SettingsToggle.tsx       → stiffness: 400 (1 resultado)
grep "left.*ease-out" src/components/SettingsToggle.tsx  → 0 resultados
npx vitest run SettingsToggle.test.ts                    → PASS (10) FAIL (0)
npm run build                                            → Complete! (sem erros TypeScript)
```

## Deviations from Plan

Nenhuma — plano executado exatamente como especificado.

## Known Stubs

Nenhum — componente totalmente funcional com dados reais de `useMotionEnabled`.

## Threat Flags

Nenhum — sem novos endpoints, auth paths ou superfícies de input externo. animate props são computadas de `motionEnabled` (boolean do hook), sem interpolação de input externo.

## Self-Check: PASSED

- [x] `src/components/SettingsToggle.tsx` existe e contém motion.span
- [x] `tests/unit/components/SettingsToggle.test.ts` existe e contém vi.mock("motion/react")
- [x] Commit RED `2f519a0` existe em git log
- [x] Commit GREEN `0100a3f` existe em git log
- [x] Todos 10 testes passam (GREEN confirmado)
- [x] `npm run build` completo sem erros
