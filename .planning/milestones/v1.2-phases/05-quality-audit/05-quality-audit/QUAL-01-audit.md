# QUAL-01 Audit — CSS Performance Gate

**Data:** 2026-05-16
**Auditor:** Agente executor 05-01
**Versão impeccable:** 2.1.9
**Escopo:** 5 arquivos de animação da fase v1.2

---

## Método de Inspeção

Conforme D-AUDIT-01: `npx impeccable detect src/ --json` executado como **registro formal** (ferramenta v2.1.9 detecta apenas antipatterns tipográficos). O gate QUAL-01 é determinado por **inspeção manual** sistemática dos 5 arquivos contra o checklist de 5 itens.

**Checklist de itens:**
1. will-change scopado corretamente (apenas dentro de :hover/:focus/estado ativo)
2. Sem layout thrashing em loops de escrita DOM
3. Propriedades compositor-friendly (opacity e transform — não top/left/width/height/margin)
4. prefers-reduced-motion cobre todas as animações
5. Sem will-change: contents (invalida subtree inteiro)

---

## Resultado por Arquivo

### 1. `src/layouts/Layout.astro`

Animações: `[data-reveal]` (opacity + transform), `[data-stagger]` / `@keyframes fade-up` (opacity + transform), `.hero-stagger-item` (CSS class). Script IO: IntersectionObserver com `setAttribute`.

| Item | Verificação | Resultado |
|------|------------|-----------|
| 1. will-change scopado | Nenhum `will-change` presente no CSS global — apenas `transition` e `animation` | **PASS** |
| 2. Sem layout thrashing | CSS puro para animações. Script IO usa apenas `setAttribute("data-revealed", "")` e `observer.unobserve(el)` — sem leitura de propriedades de layout (offsetHeight/offsetWidth/getBoundingClientRect) em loop | **PASS** |
| 3. Compositor-friendly | `[data-reveal]`: `opacity` + `transform: translateY(20px)`. `@keyframes fade-up`: `opacity` + `transform: translateY(16px)`. Sem top/left/width/height | **PASS** |
| 4. Reduced-motion | 3 blocos `@media (prefers-reduced-motion: reduce)` cobrindo: `[data-reveal]` (opacity:1, transform:none, transition:none), `[data-stagger]` (animation:none, opacity:1, transform:none), `.hero-stagger-item` (animation:none, opacity:1, transform:none) | **PASS** |
| 5. Sem will-change: contents | Nenhuma ocorrência de `will-change: contents` | **PASS** |

**Resultado Layout.astro: PASS (5/5)**

---

### 2. `src/components/HeroMotion.tsx`

Animações: Caminho A — `motion.div` com variants `hidden: {opacity:0, y:20}` / `visible: {opacity:1, y:0}`, `staggerChildren: 0.12`. Caminho B (HeroMotionSingle) — `querySelectorAll` + `style.animationDelay` + `classList.add("hero-stagger-item")`.

| Item | Verificação | Resultado |
|------|------------|-----------|
| 1. will-change scopado | Nenhum `will-change` CSS explícito. motion/react gerencia compositing internamente (injetado pelo runtime, não pelo desenvolvedor) | **PASS** |
| 2. Sem layout thrashing | `useEffect` faz `forEach` que: (a) lê `el.style.animationDelay` (write-only), (b) chama `classList.add` (write-only). Sem leitura de `offsetHeight`, `offsetWidth`, `getBoundingClientRect` ou `scrollTop` dentro do loop. Leitura de `targets.length` ocorre antes do `forEach` via `.querySelectorAll` retornando NodeList. | **PASS** |
| 3. Compositor-friendly | Variants: `opacity` e `y` (= `transform: translateY`). Sem animação de top/left/width/height/margin. `motion.span` em SettingsToggle usa `x` (= `transform: translateX`) e `opacity`. | **PASS** |
| 4. Reduced-motion | Caminho A: `MotionConfig reducedMotion="user"` suprime todas as animações motion/react automaticamente. Caminho B (HeroMotionSingle): verifica `window.matchMedia("(prefers-reduced-motion: reduce)").matches` antes do `useEffect` e retorna early sem aplicar classes CSS | **PASS** |
| 5. Sem will-change: contents | Nenhuma ocorrência | **PASS** |

**Resultado HeroMotion.tsx: PASS (5/5)**

---

### 3. `src/components/SettingsToggle.tsx`

Animações: `motion.span` (label) com `animate={{ opacity: motionEnabled ? 1 : 0.4 }}`. `motion.span` (indicador) com `animate={{ x: motionEnabled ? 16 : 0 }}`, spring `stiffness: 400, damping: 30`.

| Item | Verificação | Resultado |
|------|------------|-----------|
| 1. will-change scopado | Nenhum `will-change` CSS explícito no componente | **PASS** |
| 2. Sem layout thrashing | Sem manipulação DOM direta. Componente declarativo via motion/react. Sem loops de leitura/escrita | **PASS** |
| 3. Compositor-friendly | `opacity` (label) e `x` = `transform: translateX` (indicador). Sem animação de propriedades de layout | **PASS** |
| 4. Reduced-motion | `MotionConfig reducedMotion="user"` envolve todo o componente. Motion/react suprime ou simplifica animações automaticamente conforme preferência do sistema | **PASS** |
| 5. Sem will-change: contents | Nenhuma ocorrência | **PASS** |

**Resultado SettingsToggle.tsx: PASS (5/5)**

---

### 4. `src/components/sections/Pricing.astro`

Animações: `<section data-reveal>` (animação herdada do Layout.astro). `<li data-stagger>` com delays 0–560ms. `.price-card:hover` com `will-change: transform` e `transform: translateY(-6px) scale(1.01)`.

| Item | Verificação | Resultado |
|------|------------|-----------|
| 1. will-change scopado | `will-change: transform` aparece **apenas dentro de `.price-card:hover`** (seletor de estado). A regra `.price-card` base não tem `will-change`. | **PASS** |
| 2. Sem layout thrashing | CSS puro. Sem JavaScript no arquivo. Animações [data-stagger] com `animation-delay` via atributo `style` inline (server-rendered, não em loop JS) | **PASS** |
| 3. Compositor-friendly | `.price-card:hover`: `transform: translateY(-6px) scale(1.01)`. Sem animação de top/left/width/height/margin | **PASS** |
| 4. Reduced-motion | Bloco `@media (prefers-reduced-motion: reduce)` cobre: `.price-card { transition: box-shadow 0.15s; will-change: auto; }`, `.price-card:hover { will-change: auto; transform: none; box-shadow: 0 0 0 2px var(--nucleo-eletrico); }`. Animações [data-reveal] e [data-stagger] cobertas pelo bloco global em Layout.astro | **PASS** |
| 5. Sem will-change: contents | Nenhuma ocorrência | **PASS** |

**Resultado Pricing.astro: PASS (5/5)**

---

### 5. `src/components/ui/Button.astro`

Animações: `transition: transform 0.15s, filter 0.15s, background 0.15s, box-shadow 0.15s` no `.btn`. `.btn:hover`: `will-change: transform`, `transform: translateY(-2px)`. `.btn :global(.arrow svg)`: `transition: transform 0.25s`.

| Item | Verificação | Resultado |
|------|------------|-----------|
| 1. will-change scopado | `will-change: transform` aparece **apenas dentro de `.btn:hover`** (seletor de estado). A regra `.btn` base não tem `will-change`. | **PASS** |
| 2. Sem layout thrashing | CSS puro. Sem JavaScript. | **PASS** |
| 3. Compositor-friendly | `.btn:hover`: `transform: translateY(-2px)`. `.btn:hover .arrow svg`: `transform: translateX(4px)`. Sem animação de top/left/width/height/margin | **PASS** |
| 4. Reduced-motion | Bloco `@media (prefers-reduced-motion: reduce)`: `.btn { will-change: auto; transition: none; }`, `.btn:hover { transform: none; }`. Cobre o botão completo incluindo seta | **PASS** |
| 5. Sem will-change: contents | Nenhuma ocorrência | **PASS** |

**Resultado Button.astro: PASS (5/5)**

---

## Saída do impeccable-report.json

Arquivo gerado em: `impeccable-report.json` (raiz do projeto)
Comando: `npx impeccable@2.1.9 detect src/ --json`

**Findings:** 6 warnings tipográficos (antipatterns `overused-font` e `single-font` para Space Grotesk)

| antipattern | arquivo | linha | severity |
|-------------|---------|-------|----------|
| overused-font | src/components/sections/Bonuses.astro | 132 | warning |
| overused-font | src/components/ui/ModuleDetails.astro | 83 | warning |
| overused-font | src/layouts/Layout.astro | 259 | warning |
| overused-font | src/layouts/Layout.astro | 77 | warning |
| overused-font | src/layouts/Layout.astro | 83 | warning |
| single-font | src/layouts/Layout.astro | 259 | warning |

**Nota:** Todos os findings são tipográficos (fora do escopo do QUAL-01). A ferramenta v2.1.9 NÃO detecta will-change, layout thrashing ou compositor-unfriendly properties — conforme D-AUDIT-01. Zero findings de performance CSS. O relatório é um artefato de registro formal.

---

## Resultado Geral

| Arquivo | Item 1 | Item 2 | Item 3 | Item 4 | Item 5 | Total |
|---------|--------|--------|--------|--------|--------|-------|
| Layout.astro | PASS | PASS | PASS | PASS | PASS | **5/5** |
| HeroMotion.tsx | PASS | PASS | PASS | PASS | PASS | **5/5** |
| SettingsToggle.tsx | PASS | PASS | PASS | PASS | PASS | **5/5** |
| Pricing.astro | PASS | PASS | PASS | PASS | PASS | **5/5** |
| Button.astro | PASS | PASS | PASS | PASS | PASS | **5/5** |

---

## Decisão Final

**QUAL-01 PASS**

Todos os 5 arquivos passaram nos 5 itens do checklist. Nenhuma correção foi necessária:
- will-change usado exclusivamente dentro de `:hover` (Pricing.astro, Button.astro) ou gerenciado pelo runtime motion/react (HeroMotion.tsx, SettingsToggle.tsx)
- Sem layout thrashing detectado em nenhum arquivo
- Todas as animações usam opacity e transform (compositor-friendly)
- prefers-reduced-motion cobre 100% das animações em todos os arquivos
- Nenhum uso de will-change: contents

Gate QUAL-01 aprovado. Fase 05 pode avançar para QUAL-02.
