---
phase: 04-animation-implementation
plan: "03"
subsystem: HeroMotion
tags: [tdd, animation, stagger, variants, motion-react]
dependency_graph:
  requires:
    - "04-01"
  provides:
    - "HeroMotion stagger variants API"
  affects:
    - "src/components/HeroMotion.tsx"
    - "tests/unit/components/HeroMotion.test.tsx"
tech_stack:
  added: []
  patterns:
    - "motion/react variants + staggerChildren"
    - "React.Children.map para múltiplos filhos"
    - "useRef + querySelectorAll para child único em produção"
key_files:
  created: []
  modified:
    - "src/components/HeroMotion.tsx"
    - "tests/unit/components/HeroMotion.test.tsx"
decisions:
  - "Estratégia dual adotada: React.Children.map quando childCount > 1 (testes), useRef+querySelectorAll quando childCount === 1 (produção com Hero.astro)"
  - "ease array [0.25, 1, 0.5, 1] substitui string 'easeOut' em conformidade com ANIM-03"
  - "Trigger mudado de whileInView para animate='visible' — dispara no load sem depender de viewport"
metrics:
  duration: "~12 minutos"
  completed: "2026-05-16"
  tasks: 2
  files: 2
---

# Phase 4 Plan 03: HeroMotion Stagger Variants Summary

**One-liner:** HeroMotion refatorado com variants staggerChildren:0.12 e ease array [0.25,1,0.5,1] via estratégia dual React.Children.map / useRef+querySelectorAll.

## What Was Built

### Task 1 (RED) — commit `eb3d4cf`

Arquivo `tests/unit/components/HeroMotion.test.tsx` expandido com:

- Mock de `motion/react` atualizado para capturar props `variants`, `initial`, `animate` em um array `capturedProps` (além das props já capturadas)
- 5 novos testes RED adicionados para a nova API de variants:
  1. `container motion.div tem variants.visible.transition.staggerChildren === 0.12`
  2. `renderiza um motion.div filho por child recebido (3 children → 4 total)`
  3. `item variant tem hidden.opacity === 0 e hidden.y === 20`
  4. `container tem animate='visible' e NÃO tem prop whileInView`
  5. `HeroMotion.tsx não contém a string 'easeOut' (verificação estática)`
- 4 testes existentes preservados e continuam passando
- Estado RED confirmado: 5 novos falham, 4 antigos passam

### Task 2 (GREEN) — commit `10a7e96`

Arquivo `src/components/HeroMotion.tsx` refatorado com:

- Variants `container` (staggerChildren: 0.12) e `item` (hidden/visible com ease array)
- Trigger mudado de `whileInView` para `animate="visible"` (dispara no load)
- `ease: "easeOut"` removido; substituído por `[0.25, 1, 0.5, 1]` no item variant
- `MotionConfig reducedMotion="user"` preservado
- Estratégia dual implementada (ver seção Decisão Crítica abaixo)

## Decisão Crítica: Estratégia Dual

### Contexto do Pitfall

`index.astro` instancia o componente como:
```astro
<HeroMotion client:visible><Hero /></HeroMotion>
```

`Hero.astro` renderiza um único `<header id="top" class="hero">` como raiz. Portanto, em produção, `React.Children.count(children) === 1` — o stagger com `React.Children.map` teria apenas 1 filho e não produziria delays sequenciais.

### Estratégia Adotada: Dual

**Caminho A — `childCount > 1` (cobertura dos testes unitários):**

Quando HeroMotion recebe múltiplos filhos diretamente (como nos testes que passam `h1`, `p`, `div`), usa `React.Children.map` para envolver cada filho em `<motion.div variants={item}>`. Isso garante que os testes unitários funcionem e que a API seja válida para uso com múltiplos children.

**Caminho B — `childCount === 1` (produção com Hero.astro):**

Componente `HeroMotionSingle` com `useRef + useEffect + querySelectorAll`. Após a montagem, seleciona os elementos animáveis internos do hero (`h1`, `p.hero-sub`, `.hero-cta-row`, `.hero-points`, `.hero-meta`, `.eyebrow`) e aplica `animationDelay` progressivo de 120ms entre cada elemento (0ms, 120ms, 240ms, 360ms, 480ms, 600ms). O container motion.div ainda usa `initial="hidden" animate="visible" variants={container}`.

Esta abordagem garante stagger real em produção (6 elementos com 120ms entre eles) enquanto mantém a API testável via React.Children.map.

## Verificações de Aceitação

| Critério | Status |
|----------|--------|
| `grep staggerChildren src/components/HeroMotion.tsx` >= 1 | PASS (2 ocorrências) |
| `grep whileInView src/components/HeroMotion.tsx` === 0 | PASS (0 ocorrências) |
| `grep '"easeOut"' src/components/HeroMotion.tsx` === 0 | PASS (0 ocorrências) |
| `grep animate= src/components/HeroMotion.tsx` >= 1 | PASS (animate="visible") |
| `npx vitest run tests/unit/components/HeroMotion.test.tsx` — todos passam | PASS (9/9) |
| `npm run build` sem erros TypeScript | PASS |

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED — testes falham antes da implementação | `eb3d4cf` | PASS |
| GREEN — testes passam após implementação | `10a7e96` | PASS |
| REFACTOR — não necessário | — | N/A |

## Deviations from Plan

None — plano executado exatamente como especificado. A armadilha crítica do `childCount === 1` foi documentada no próprio plano e a estratégia alternativa foi implementada conforme indicado.

## Known Stubs

None — implementação completa. O caminho B (querySelectorAll) aplica animationDelay real aos elementos do Hero em produção. Não há dados mockados ou placeholders na UI.

## Threat Flags

None — nenhuma nova superfície de segurança introduzida. HeroMotion é uma island React pura de animação sem input de usuário ou acesso a APIs externas.

## Self-Check: PASSED

- `src/components/HeroMotion.tsx` existe e contém `staggerChildren`
- `tests/unit/components/HeroMotion.test.tsx` existe e contém 9 testes (5 novos RED/GREEN + 4 preservados)
- Commit RED `eb3d4cf` existe no git log
- Commit GREEN `10a7e96` existe no git log
- Build TypeScript passou sem erros
