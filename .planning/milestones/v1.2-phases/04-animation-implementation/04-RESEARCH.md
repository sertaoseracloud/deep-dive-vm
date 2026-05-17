# Phase 4: Animation Implementation - Research

**Researched:** 2026-05-15
**Domain:** motion/react v12 (variants/stagger), IntersectionObserver + CSS, CSS @keyframes, SettingsToggle spring
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scroll Reveals (ANIM-02)**
- D-SCROLL-01: IntersectionObserver global + CSS `data-reveal`/`data-revealed` em Layout.astro. Script vanilla — zero custo de hidratação React. Segue o padrão já estabelecido do NavBar sticky (IntersectionObserver em Layout.astro:171).
- D-SCROLL-02: Timing: `opacity` + `translateY(20px)` com `transition: 400ms cubic-bezier(0.25, 1, 0.5, 1)`. Threshold: 0.15.
- D-SCROLL-03: Fallback via `@media (prefers-reduced-motion: reduce)` no CSS: sections com `[data-reveal]` recebem `opacity: 1; transform: none`.
- D-SCROLL-04: Escopo: 8 seções — Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials. Adicionar `data-reveal` no `<section>` de cada uma.

**HeroMotion Stagger (ANIM-01)**
- D-HERO-01: Usar `variants` com `staggerChildren: 0.12`. Container usa `initial="hidden" animate="visible"`. Cada filho em `<motion.div key={i} variants={item}>` via `React.Children.map`. API de `Hero.astro` inalterada.
- D-HERO-02: Trigger muda de `whileInView` para `animate` (load). `initial="hidden"` evita flash.
- D-HERO-03: Variants do item: `hidden: { opacity: 0, y: 20 }`, `visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } }`.

**Política de Easing (ANIM-03)**
- D-EASE-01: Dois tokens — `cubic-bezier(0.25, 1, 0.5, 1)` para entrances/reveals/stagger; `cubic-bezier(0.0, 0.0, 0.2, 1)` para hover/toggle/micro.
- D-EASE-02: CSS custom properties em Layout.astro `:root`: `--ease-entrance` e `--ease-micro`.
- D-EASE-03: Substituir TODAS as ocorrências de `ease-out` genérico (CSS) e `"easeOut"` (string) nos arquivos afetados: HeroMotion.tsx, MobileMenuMotion.tsx, CarouselMotion.tsx, Button.astro, NavBar.astro, Pricing.astro.

**SettingsToggle Spring (ANIM-04)**
- D-TOGGLE-01: Indicador vira `<motion.span animate={{ x: motionEnabled ? 16 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>`. Troca CSS `left` por `transform: translateX`.
- D-TOGGLE-02: Label "Animações" vira `<motion.span animate={{ opacity: motionEnabled ? 1 : 0.4 }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>`.
- D-TOGGLE-03: Spring apenas quando `motionEnabled = true`. Toggle off = pulo instantâneo.

**Stagger em Listas e Cards (ANIM-05)**
- D-STAGGER-01: CSS `animation-delay: {i * 80}ms` inline. 3 bônus: 0/80/160ms. 8 price-includes: 0–560ms.
- D-STAGGER-02: Items com `[data-stagger]` têm `animation-play-state: paused`. CSS `[data-revealed] [data-stagger] { animation-play-state: running }`.
- D-STAGGER-03: `@keyframes fade-up`: `from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none }`. 400ms, `var(--ease-entrance)`, `forwards`.
- D-STAGGER-04: Alvo: `.bonus-card` (Bonuses.astro) e `.price-includes li` (Pricing.astro).

### Claude's Discretion

- Ordem dos planos dentro da Phase 4 (se dividida em sub-planos por ANIM-XX).
- Threshold exato do IntersectionObserver além de 0.15 (pode ajustar por seção se muito curta).
- Número exato de `staggerChildren` para o Hero se 0.12 parecer muito lento/rápido durante execução.

### Deferred Ideas (OUT OF SCOPE)

- Parallax depth no Hero (múltiplas camadas) — Future Requirements do v1.2.
- NavBar link ativo com indicador animado (P2 da critique) — fora do escopo ANIM-XX desta phase.
- Method.astro accordion com easing custom (P2 da critique) — coberto por D-EASE-03 se Method tiver transitions CSS.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ANIM-01 | Hero exibe sequência staggered: headline, lede e CTA aparecem 100-150ms de delay entre si na primeira visita | D-HERO-01/02/03 — variants + staggerChildren: 0.12 = 120ms; trigger muda para animate (load) |
| ANIM-02 | Seções principais têm scroll-triggered reveals com timing consistente | D-SCROLL-01/02/03/04 — IO global + data-reveal/data-revealed + 8 seções alvo identificadas |
| ANIM-03 | Easing padronizado com cubic-bezier tokens do DESIGN.md — nenhum "easeOut" genérico restante | D-EASE-01/02/03 — inventário completo de ocorrências verificado na seção Pitfalls |
| ANIM-04 | SettingsToggle tem spring no indicador + fade no label "Animações" | D-TOGGLE-01/02/03 — motion.span + spring stiffness:400 damping:30 |
| ANIM-05 | Grupos de itens em listas e cards usam stagger coordenado na entrada | D-STAGGER-01/02/03/04 — CSS animation-delay inline + animation-play-state paused→running |
</phase_requirements>

---

## Summary

A Phase 4 é uma fase de implementação pura: todas as decisões de design e arquitetura já estão travadas no 04-CONTEXT.md. Não há escolhas técnicas abertas — o trabalho é traduzir cada decisão (D-HERO-XX, D-SCROLL-XX, D-EASE-XX, D-TOGGLE-XX, D-STAGGER-XX) em código concreto nos arquivos corretos, com testes unitários atualizados para cobrir os novos comportamentos.

O risco técnico principal é a integração entre os três mecanismos de animação da fase: (1) motion/react v12 para HeroMotion e SettingsToggle, (2) IntersectionObserver + CSS para scroll reveals, e (3) CSS @keyframes + animation-delay para stagger em Astro. Os três precisam respeitar o mesmo token de easing e o mesmo fallback de prefers-reduced-motion, mas por canais diferentes — o que cria superfície de inconsistência se não for coordenado pelo planner.

O segundo risco é a atualização dos testes: HeroMotion.test.tsx e SettingsToggle.test.ts existem, mas seus mocks refletem a API antiga (single `motion.div`, CSS `left` para indicador). O Wave 0 de qualquer plano que altere esses componentes precisa atualizar os mocks ANTES de alterar o código de produção (TDD enforced pelo config.json `"tdd": true`).

**Recomendação primária:** Implementar na ordem sugerida pela critique — ANIM-02 primeiro (IO+CSS, alto impacto, zero risco em React), depois ANIM-01, ANIM-03, ANIM-04, ANIM-05.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scroll reveals (ANIM-02) | Browser / Client (vanilla JS + CSS) | — | IntersectionObserver é browser-native; CSS transitions são declarativas. Zero hidratação React necessária. |
| Hero stagger (ANIM-01) | Frontend (React island) | — | HeroMotion.tsx já é um React island (`client:visible`). Variants/staggerChildren ficam no componente React. |
| Easing tokens (ANIM-03) | Browser / Client (CSS :root) + React inline | — | CSS vars em Layout.astro para CSS files; array numérico inline para motion/react. |
| SettingsToggle spring (ANIM-04) | Frontend (React island) | — | SettingsToggle.tsx já é React island (`client:load`). Toda a lógica de spring fica no componente. |
| CSS stagger (ANIM-05) | Browser / Client (CSS + Astro template) | — | animation-delay calculado em build time no template Astro; CSS @keyframes em Layout.astro. |
| Fallback prefers-reduced-motion | Browser / Client (CSS @media) | React MotionConfig | CSS @media para seções e stagger; MotionConfig reducedMotion="user" para HeroMotion e SettingsToggle. |

---

## Standard Stack

### Core (sem novas dependências — tudo já instalado)

| Library | Version Instalada | Purpose | Verificado |
|---------|------------------|---------|------------|
| `motion` (re-export de `framer-motion`) | 12.38.0 | HeroMotion stagger, SettingsToggle spring | [VERIFIED: node_modules/motion/package.json] |
| `framer-motion` | instalado como dep de `motion` | Provê variants, staggerChildren, motion.span, spring | [VERIFIED: node_modules/framer-motion existe e exporta `motion`] |
| IntersectionObserver (browser native) | — | Scroll reveals (ANIM-02) e NavBar scrolled state | [VERIFIED: já usado em NavBar.astro:171] |
| CSS custom properties (browser native) | — | Easing tokens --ease-entrance / --ease-micro | [VERIFIED: padrão estabelecido em Layout.astro :root] |

**Instalação necessária:** Nenhuma. Todas as dependências já estão no projeto.

---

## Package Legitimacy Audit

Nenhum pacote novo será instalado nesta fase. A seção não se aplica.

---

## Architecture Patterns

### Sistema de Animação: Três Canais Paralelos

```
Usuário acessa a página
         │
         ├─► Canal 1: React Islands (motion/react)
         │   ├─ HeroMotion.tsx    → variants + staggerChildren (ANIM-01)
         │   └─ SettingsToggle.tsx → motion.span spring (ANIM-04)
         │
         ├─► Canal 2: Vanilla JS + CSS (IO + data-*)
         │   ├─ Layout.astro <script> → IO observa [data-reveal]
         │   ├─ IO dispara → adiciona data-revealed na section
         │   └─ CSS [data-reveal] / [data-revealed] → opacity + translateY (ANIM-02)
         │
         └─► Canal 3: CSS declarativo (Astro build time)
             ├─ Bonuses.astro  → .bonus-card data-stagger + animation-delay inline
             ├─ Pricing.astro  → .price-includes li data-stagger + animation-delay inline
             └─ Layout.astro CSS → @keyframes fade-up + --ease-entrance (ANIM-05)

Fallback (prefers-reduced-motion):
  Canal 1: MotionConfig reducedMotion="user" (já presente em HeroMotion)
           + condicional em SettingsToggle (D-TOGGLE-03)
  Canal 2: @media (prefers-reduced-motion: reduce) { [data-reveal] { opacity:1; transform:none } }
  Canal 3: @media (prefers-reduced-motion: reduce) { [data-stagger] { animation: none } }
```

### Recommended Project Structure (arquivos afetados)

```
src/
├── layouts/
│   └── Layout.astro          # MODIFICAR: :root vars + IO script + @keyframes
├── components/
│   ├── HeroMotion.tsx         # MODIFICAR: variants + staggerChildren
│   ├── SettingsToggle.tsx     # MODIFICAR: motion.span spring + label fade
│   ├── MobileMenuMotion.tsx   # MODIFICAR: easing "easeOut" → [0,0,0.2,1]
│   ├── CarouselMotion.tsx     # MODIFICAR: easing "easeOut" → [0,0,0.2,1]
│   ├── layout/
│   │   └── NavBar.astro       # MODIFICAR: ease-out → var(--ease-micro)
│   ├── ui/
│   │   └── Button.astro       # MODIFICAR: ease-out → var(--ease-micro)
│   └── sections/
│       ├── Method.astro       # MODIFICAR: adicionar data-reveal na <section>
│       ├── Curriculum.astro   # MODIFICAR: adicionar data-reveal na <section>
│       ├── Bonuses.astro      # MODIFICAR: data-reveal na section + data-stagger nos cards
│       ├── Faq.astro          # MODIFICAR: adicionar data-reveal na <section>
│       ├── ForWho.astro       # MODIFICAR: adicionar data-reveal na <section>
│       ├── Mentor.astro       # MODIFICAR: adicionar data-reveal na <section>
│       ├── PainPoints.astro   # MODIFICAR: adicionar data-reveal na <section>
│       ├── Testimonials.astro # MODIFICAR: adicionar data-reveal na <section>
│       └── Pricing.astro      # MODIFICAR: data-reveal na section + data-stagger nos li + ease-out
tests/
└── unit/components/
    ├── HeroMotion.test.tsx    # ATUALIZAR: mock para variants + staggerChildren
    └── SettingsToggle.test.ts # ATUALIZAR: mock motion/react, testar motion.span
```

### Pattern 1: Variants com staggerChildren (ANIM-01)

**O que é:** O componente container declara `staggerChildren` na transição do variant `visible`. Cada filho imediato recebe o mesmo variant `item`. O motion/react calcula automaticamente o delay de cada filho com base no índice.

**API verificada no framer-motion instalado (12.38.0):** `staggerChildren` existe em `calcChildStagger` no bundle — aceita segundos (float). `staggerChildren: 0.12` = 120ms por filho.

```typescript
// Source: verificado no bundle framer-motion@12.38.0 (node_modules/framer-motion/dist/framer-motion.dev.js)
// + padrão documentado no CONTEXT.md D-HERO-01/03

import React from "react";
import { motion, MotionConfig } from "motion/react";
import { useMotionEnabled } from "../lib/motion-utils";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,  // 120ms entre cada filho
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],  // ease-out-quart — NUNCA "easeOut" string
    },
  },
};

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const [motionEnabled] = useMotionEnabled();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
      >
        {React.Children.map(children, (child, i) => (
          <motion.div key={i} variants={item}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  );
}
```

**Armadilha crítica:** `React.Children.map` envolve CADA filho direto em um `motion.div` com `variants={item}`. O Hero.astro passa os elementos como children opacos — `HeroMotion` não conhece a estrutura interna. Se Hero.astro passar um único wrapper `<div>` contendo todos os elementos, o stagger não terá múltiplos filhos para staggar. Verificar na implementação que Hero.astro passa os elementos relevantes (h1, p, CTAs) como filhos diretos, ou que o `motion.div` container tem acesso a múltiplos children de nível 1.

**Nota sobre `initial="hidden"` vs `whileInView`:** A mudança de `whileInView` para `animate` (D-HERO-02) é necessária porque `HeroMotion` usa `client:visible` em `index.astro` — a island pode hidratar após o viewport já ter passado pelo Hero, fazendo o `whileInView` nunca disparar. Com `animate="visible"`, o stagger dispara assim que a island hidrata.

### Pattern 2: IntersectionObserver Global em Layout.astro (ANIM-02)

**O que é:** Um `<script>` vanilla em `Layout.astro` observa todos os elementos com `[data-reveal]`. Quando um elemento entra no viewport (threshold 0.15), o observer adiciona `data-revealed` e se auto-desconecta do elemento.

**Padrão já estabelecido:** O NavBar.astro (linha 170-187) já usa exatamente este mecanismo para o `data-scrolled`. O script do IO global para reveal segue o mesmo padrão.

```astro
<!-- Em Layout.astro, antes de </body> -->
<script>
  // IntersectionObserver: scroll-triggered reveal para seções [data-reveal]
  // Segue o mesmo padrão do scrollObserver em NavBar.astro:171
  const revealElements = document.querySelectorAll("[data-reveal]");

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            revealObserver.unobserve(entry.target);  // fire-once
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // Cleanup para Astro View Transitions (mesmo padrão do NavBar)
    document.addEventListener("astro:before-swap", () => {
      revealObserver.disconnect();
    }, { once: true });
  }
</script>
```

**CSS correspondente (também em Layout.astro):**

```css
/* Em Layout.astro <style is:global> */

/* Estado inicial: section oculta */
[data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 400ms var(--ease-entrance), transform 400ms var(--ease-entrance);
}

/* Estado revelado: section aparece */
[data-reveal][data-revealed] {
  opacity: 1;
  transform: none;
}

/* Fallback prefers-reduced-motion: sections aparecem instantaneamente */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

**Ponto de atenção — Astro `<script>` e hidratação:** Em Astro, `<script>` em componentes `.astro` é processado como módulo ES e executado no browser após o DOM estar pronto. O script de IO em `Layout.astro` roda quando o documento carrega — antes que islands React terminem de hidratar. Isso é correto: o IO observa os elementos do DOM estático (sections Astro), não os islands React. Islands React ficam DENTRO das sections, então a section em si estar revelada não depende do React.

### Pattern 3: CSS Stagger com animation-delay Inline (ANIM-05)

**O que é:** `animation-delay` calculado em build time no template Astro. O stagger não usa JS de runtime.

```astro
<!-- Em Bonuses.astro — os 3 bonus-card -->
{[bônus1, bônus2, bônus3].map((bonus, i) => (
  <div class="bonus-card" data-stagger style={`animation-delay: ${i * 80}ms`}>
    <!-- conteúdo -->
  </div>
))}
```

```css
/* Em Layout.astro <style is:global> */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}

[data-stagger] {
  animation: fade-up 400ms var(--ease-entrance) forwards;
  animation-play-state: paused;  /* paused até section ser revelada */
}

[data-revealed] [data-stagger] {
  animation-play-state: running;  /* dispara quando section-pai recebe data-revealed */
}

@media (prefers-reduced-motion: reduce) {
  [data-stagger] {
    animation: none;
  }
}
```

**Ponto de atenção — Bonuses.astro usa `div` estático, não array iterado:** O código atual de `Bonuses.astro` (verificado) usa três `<div class="bonus-card">` estáticos, não um array iterado. Para aplicar `animation-delay` inline variável, o planner precisa decidir: (a) converter para iteração Astro (`{bonuses.map(...)}`) ou (b) adicionar `style="animation-delay: Xms"` manualmente em cada card. A opção (b) é mais simples e preserva o template existente. O mesmo se aplica a `Pricing.astro` — os 8 `<li>` de `.price-includes` são estáticos.

### Pattern 4: SettingsToggle Spring (ANIM-04)

**O que é:** Substituir o `<span>` do indicador CSS por `motion.span`. A posição passa de `left: 2px / 18px` para `x: 0 / 16px` via transform (mais performático — sem layout reflow).

```typescript
// Importar motion/react no SettingsToggle.tsx
import { motion, MotionConfig } from "motion/react";

// Indicador (substituir o <span> interno com position:absolute)
<motion.span
  style={{
    position: "absolute",
    top: "2px",
    left: "2px",         // left fixo — posição base
    width: "16px",
    height: "16px",
    borderRadius: "8px",
    background: "#fff",
    // REMOVER: transition: "left 0.15s ease-out"
  }}
  animate={{ x: motionEnabled ? 16 : 0 }}
  // Quando motionEnabled=false: sem spring, pulo instantâneo (D-TOGGLE-03)
  transition={
    motionEnabled
      ? { type: "spring", stiffness: 400, damping: 30 }
      : { duration: 0 }
  }
/>

// Label "Animações"
<motion.span
  style={{ /* manter estilos existentes */ }}
  animate={{ opacity: motionEnabled ? 1 : 0.4 }}
  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
>
  Animações
</motion.span>
```

**Ponto crítico — offset `x: 16` vs `left: 18px`:** O código atual usa `left: motionEnabled ? "18px" : "2px"`. Com `motion.span` e `x`, a posição base é `left: "2px"` (fixo) e o transform adiciona `x: 16px`. Resultado: `2px + 16px = 18px` — equivalente ao estado atual. Verificar que o indicador tem `left: "2px"` como base e que o `x` desejado é `16` (não `18`).

**Ponto crítico — MotionConfig em SettingsToggle:** O `SettingsToggle.tsx` atual NÃO tem `MotionConfig`. Ao adicionar `motion.span`, é necessário envolver com `<MotionConfig reducedMotion="user">` para que `prefers-reduced-motion` do sistema desative as animações automaticamente — mesmo que o `useMotionEnabled()` hook já gerencie a preferência via localStorage.

### Anti-Patterns a Evitar

- **"easeOut" string em motion/react:** Resolve para uma curva genérica diferente de `cubic-bezier(0.25, 1, 0.5, 1)`. Usar SEMPRE o array numérico `[0.25, 1, 0.5, 1]` ou `[0, 0, 0.2, 1]`.
- **CSS `ease-out` sem `timing-function`:** O browser default `ease` é diferente de qualquer dos dois tokens. Usar `var(--ease-entrance)` ou `var(--ease-micro)`.
- **IO + CSS em island React:** Não colocar o IO de scroll reveal dentro de um componente React. O IO global em Layout.astro observa elementos do DOM estático (sections Astro). Islands React são filhos dessas sections, não as sections em si.
- **`will-change: opacity, transform` em todas as sections:** Adicionar `will-change` apenas no elemento em transição ativo. Não aplicar globalmente em `[data-reveal]` — pode degradar performance com 8+ elementos.
- **Stagger com JS de runtime:** Não calcular `animation-delay` em JavaScript de browser. O padrão D-STAGGER-01 calcula em build time no template Astro — sem JS de runtime.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Em Vez | Por Que |
|----------|--------------|-------------|---------|
| Stagger com delays calculados em JS | Timer/setTimeout manual | `staggerChildren` em variants (motion/react) para React; `animation-delay` inline para CSS (Astro) | motion/react sincroniza com o lifecycle do React e respeita `reducedMotion`; CSS é declarativo e zero-runtime |
| Spring physics | Implementar spring manualmente | `{ type: "spring", stiffness: N, damping: N }` em motion/react | Cálculo de spring é matematicamente complexo; motion/react tem implementação otimizada |
| Scroll detection | scroll event listener com debounce | IntersectionObserver | IO é assíncrono, não bloqueia main thread, tem API nativa de threshold |
| Fallback de reduced-motion para React | Verificar `window.matchMedia` manualmente | `MotionConfig reducedMotion="user"` + `useReducedMotion()` de motion/react | Já integrado no hook `useMotionEnabled` do projeto via `useReducedMotion()` |

---

## Inventário Completo de Ocorrências: Easing Genérico (ANIM-03)

Verificado por inspeção de código-fonte. Todas as ocorrências a substituir:

| Arquivo | Ocorrência Atual | Substituir Por | Token |
|---------|-----------------|----------------|-------|
| `src/components/HeroMotion.tsx:14` | `ease: "easeOut"` | `ease: [0.25, 1, 0.5, 1]` | entrance |
| `src/components/MobileMenuMotion.tsx:44` | `ease: "easeOut"` | `ease: [0, 0, 0.2, 1]` | micro (menu slide = micro-interação de estado) |
| `src/components/CarouselMotion.tsx:92` | `ease: "easeOut"` (keyboard nav) | `ease: [0, 0, 0.2, 1]` | micro |
| `src/components/ui/Button.astro:49` | `transition: transform 0.15s ease-out, filter 0.15s ease-out, background 0.15s ease-out, box-shadow 0.15s ease-out` | Trocar `ease-out` por `var(--ease-micro)` | micro |
| `src/components/ui/Button.astro:66` | `transition: transform 0.25s` (arrow, sem timing-function) | Adicionar `var(--ease-micro)` | micro |
| `src/components/layout/NavBar.astro:59` | `transition: background 0.2s ease-out, box-shadow 0.2s ease-out` | `var(--ease-micro)` | micro |
| `src/components/layout/NavBar.astro:123` | `transition: color 0.15s ease-out, border-color 0.15s ease-out` | `var(--ease-micro)` | micro |
| `src/components/sections/Pricing.astro:281` | `transition: transform 0.15s ease-out, box-shadow 0.15s ease-out` | `var(--ease-micro)` | micro |
| `src/lib/motion-utils.ts:107` | `transition: "all 150ms ease-out"` (em `applyFallback`) | Manter `ease-out` ou trocar por `var(--ease-micro)` — ver nota abaixo |

**Nota sobre `applyFallback`:** A função `applyFallback` aplica inline CSS via `element.style`. CSS custom properties não funcionam em `style` inline aplicado via JS (`element.style.transition` não processa `var()`). Portanto, `applyFallback` deve manter `cubic-bezier(0.0, 0.0, 0.2, 1)` como string literal, não como `var(--ease-micro)`.

**Ocorrência em Method.astro (P2 da critique):** `transition: background 0.3s` no accordion sem `timing-function`. Coberto por D-EASE-03 se o planner optar por incluir — verificar o arquivo antes de planejar.

---

## Common Pitfalls

### Pitfall 1: `React.Children.map` no Hero não encontra múltiplos filhos

**O que acontece:** Se `Hero.astro` enviar seus elementos como um único filho wrapper (ex: um `<div>` englobando tudo), `React.Children.map` em `HeroMotion.tsx` encontrará apenas 1 filho — e o stagger terá apenas um elemento, sem delays sequenciais.

**Por que acontece:** `Hero.astro` é um componente Astro estático passado como children para o island React. A estrutura dos children depende de como o Astro serializa o slot.

**Como evitar:** Verificar em `index.astro` como `<Hero />` é passado para `<HeroMotion>`. Se `Hero.astro` encapsula tudo em um único elemento root, o `React.Children.map` precisará percorrer um nível mais fundo, ou a abordagem de stagger precisará mudar para `querySelectorAll` interno ao componente após a montagem.

**Sinal de alerta:** `staggerChildren` funcionando mas todos os elementos animando simultaneamente (isso indica que o container tem apenas 1 filho direto sendo staggerado).

**Solução alternativa já documentada no CONTEXT.md:** O CONTEXT.md (D-HERO-01) especifica `React.Children.map` — implicando que o Hero deve passar múltiplos children. Verificar o comportamento real durante implementação e ajustar se necessário.

### Pitfall 2: `transition` em CSS inline não processa `var(--ease-entrance)`

**O que acontece:** CSS custom properties (`var()`) funcionam em stylesheets, mas NÃO em `element.style` aplicado via JavaScript (`element.style.transition = "opacity 400ms var(--ease-entrance)"`).

**Por que acontece:** `element.style.setProperty('transition', 'opacity 400ms var(--ease-entrance)')` resolve corretamente se usar `setProperty`. Mas `element.style.transition = '...'` pode não resolver `var()` em todos os browsers.

**Como evitar:** CSS vars para transitions devem ser definidas em stylesheets CSS, não em `style` inline via JS. O script do IO de reveal define o CSS em `<style is:global>` — correto. A função `applyFallback` em `motion-utils.ts` deve usar o valor literal `cubic-bezier(0.0, 0.0, 0.2, 1)`, não `var(--ease-micro)`.

### Pitfall 3: `animation-delay` inline em Astro com elementos estáticos

**O que acontece:** `Bonuses.astro` e `Pricing.astro` usam `<div>` e `<li>` estáticos (não iterados). Adicionar `animation-delay` variável exige ou (a) converter para iteração Astro ou (b) adicionar manualmente em cada elemento.

**Por que acontece:** O padrão D-STAGGER-01 assume template iterado. O código atual usa markup estático por clareza de conteúdo.

**Como evitar:** Para 3 bônus e 8 itens, a abordagem mais simples é adicionar `style="animation-delay: Xms"` manualmente em cada elemento (0ms, 80ms, 160ms para bônus; 0 a 560ms para pricing). Não exige refatoração do template.

### Pitfall 4: `[data-reveal]` afetando layout antes do IO disparar (FOUC)

**O que acontece:** Se `[data-reveal]` tiver `opacity: 0` como estado padrão, e o IO ainda não tiver observado o elemento (ex: script ainda carregando, ou section above-the-fold), o conteúdo aparece invisível por um flash.

**Por que acontece:** O IO script em `Layout.astro` é executado após o DOM carregar, mas antes de todas as seções serem observadas individualmente.

**Como evitar:** O IO deve usar `unobserve` após o primeiro `isIntersecting=true` (fire-once). Sections acima da dobra que entram no viewport antes do IO inicializar devem ser tratadas: verificar se as 8 seções alvo (Method, Curriculum, etc.) são tipicamente below-the-fold. Se alguma for above-the-fold em algum dispositivo, considerar `rootMargin` ou verificação de posição inicial.

**Nota:** As 8 seções de ANIM-02 (Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials) são todas below-the-fold — o Hero e TrustBand ficam acima. Este pitfall é de baixo risco para o escopo atual.

### Pitfall 5: SettingsToggle — `left` CSS conflitando com `x` transform

**O que acontece:** O indicador atual usa `left: motionEnabled ? "18px" : "2px"`. Ao trocar para `motion.span` com `x`, se `left: "2px"` permanecer como base e `x: 16` for adicionado, o resultado é correto (2 + 16 = 18). Mas se o CSS antigo de `transition: "left 0.15s ease-out"` não for REMOVIDO, haverá conflito entre CSS transition e motion transform.

**Como evitar:** Remover `transition: "left 0.15s ease-out"` do style inline do indicador ao converter para `motion.span`. Manter apenas `left: "2px"` como posição base.

### Pitfall 6: Testes com mock desatualizado após refatorar HeroMotion

**O que acontece:** `HeroMotion.test.tsx` atual mocka `motion.div` mas não mocka `variants`, `staggerChildren`, ou `React.Children.map`. Após a refatoração, o mock precisará refletir que há agora um `motion.div` container + N `motion.div` children.

**Como evitar:** Atualizar o mock em Wave 0 de qualquer plano que toque `HeroMotion.tsx`. O mock deve incluir suporte a `variants` e `initial/animate` como props ignoradas, e o teste deve verificar que MÚLTIPLOS elementos filho são renderizados com `data-testid="motion-div"`.

---

## Code Examples

### Exemplo 1: Layout.astro — CSS custom properties e IO script

```astro
<!-- Em Layout.astro, dentro de <style is:global> — adicionar ao :root existente -->
<style is:global>
  :root {
    /* ... vars existentes ... */
    --ease-entrance: cubic-bezier(0.25, 1, 0.5, 1);
    --ease-micro: cubic-bezier(0.0, 0.0, 0.2, 1);
  }

  /* ANIM-02: scroll reveals */
  [data-reveal] {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 400ms var(--ease-entrance), transform 400ms var(--ease-entrance);
  }
  [data-reveal][data-revealed] {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-reveal] {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }

  /* ANIM-05: stagger de listas e cards */
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }
  [data-stagger] {
    animation: fade-up 400ms var(--ease-entrance) forwards;
    animation-play-state: paused;
  }
  [data-revealed] [data-stagger] {
    animation-play-state: running;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-stagger] {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
</style>

<!-- Em Layout.astro, antes de </body> — novo script -->
<script>
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
    document.addEventListener("astro:before-swap", () => observer.disconnect(), { once: true });
  }
</script>
```

### Exemplo 2: Adicionando data-reveal nas sections alvo

```astro
<!-- Em Method.astro, Curriculum.astro, Bonuses.astro, Faq.astro,
     ForWho.astro, Mentor.astro, PainPoints.astro, Testimonials.astro -->
<!-- Antes: -->
<section class="bonuses" id="bonus">
<!-- Depois: -->
<section class="bonuses" id="bonus" data-reveal>
```

### Exemplo 3: Stagger em Bonuses.astro (elementos estáticos)

```astro
<!-- Antes: -->
<div class="bonus-card">...</div>
<div class="bonus-card featured">...</div>
<div class="bonus-card">...</div>

<!-- Depois: -->
<div class="bonus-card" data-stagger style="animation-delay: 0ms">...</div>
<div class="bonus-card featured" data-stagger style="animation-delay: 80ms">...</div>
<div class="bonus-card" data-stagger style="animation-delay: 160ms">...</div>
```

### Exemplo 4: Substituição de easing em CSS (Button.astro, NavBar.astro)

```css
/* Antes (Button.astro): */
transition: transform 0.15s ease-out, filter 0.15s ease-out, background 0.15s ease-out, box-shadow 0.15s ease-out;

/* Depois: */
transition: transform 0.15s var(--ease-micro), filter 0.15s var(--ease-micro), background 0.15s var(--ease-micro), box-shadow 0.15s var(--ease-micro);
```

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|-----------------|--------------|---------|
| `whileInView` para Hero entrance | `animate` (load) | D-HERO-02 desta phase | Garante disparo mesmo se island hidratar após scroll |
| `"easeOut"` string em motion/react | Array numérico `[x, y, x, y]` | Padronização D-EASE-03 | Controle exato sobre a curva Bezier |
| CSS `left` para indicador de toggle | `transform: translateX` via `motion.span` | D-TOGGLE-01 desta phase | Sem layout reflow — apenas compositor layer |
| Seções aparecem instantaneamente | IO + CSS reveal com 400ms | ANIM-02 desta phase | Percepção de profundidade e hierarquia visual |

**Deprecated/desatualizado após esta phase:**
- `ease: "easeOut"` em qualquer componente motion/react — substituído por array numérico
- `transition: left` no SettingsToggle — substituído por `x` transform
- `whileInView` no HeroMotion — substituído por `animate` (load)

---

## Assumptions Log

| # | Claim | Section | Risco se Errado |
|---|-------|---------|-----------------|
| A1 | `React.Children.map` em HeroMotion.tsx encontrará múltiplos filhos diretos (não um único wrapper) | Pattern 1 / Pitfall 1 | O stagger não funcionará — todos os elementos animarão simultaneamente |
| A2 | `ctx7` / Context7 não disponível nesta sessão — API de staggerChildren verificada via bundle instalado, não via documentação oficial motion.dev | Standard Stack | API pode ter mudado entre versões — verificado no bundle 12.38.0 instalado |

**Se a tabela tiver apenas estas entradas:** O restante das claims foi verificado diretamente no código-fonte do projeto (Layout.astro, HeroMotion.tsx, SettingsToggle.tsx, NavBar.astro, Button.astro, CarouselMotion.tsx, MobileMenuMotion.tsx, Pricing.astro, Bonuses.astro) e nos arquivos de configuração do projeto.

---

## Open Questions (RESOLVED)

1. **Estrutura interna de filhos do Hero passados para HeroMotion** — RESOLVED
   - O que sabemos: `index.astro` usa `<HeroMotion client:visible><Hero /></HeroMotion>`. `Hero.astro` renderiza `<header id="top" class="hero">` com múltiplos elementos internos.
   - **Resolução:** `React.Children.count` provavelmente retornará 1 (o `<header>` inteiro). O plano 04-03 instrui o executor a verificar em runtime e, se count === 1, adotar estratégia alternativa via `querySelectorAll` interno + `useEffect`. A decisão final é documentada no 04-03-SUMMARY.md pelo executor.

2. **Method.astro — ocorrência de `transition: background 0.3s` (P2 da critique)** — RESOLVED
   - O que sabemos: A critique reportou `transition: background 0.3s` sem timing-function no accordion.
   - **Resolução:** Method.astro accordion é P2 (oportunidade sem requirement direto — D-06 do 03-CONTEXT.md) e está explicitamente fora de D-EASE-03. O plano 04-04 confirma: "Method.astro accordion (P2) — não está em D-EASE-03 confirmado." Nenhum plano da Phase 4 precisa cobrir este item.

---

## Environment Availability

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| `motion` / `framer-motion` | ANIM-01, ANIM-04 | Sim | 12.38.0 | — |
| IntersectionObserver (browser API) | ANIM-02 | Sim (browsers modernos; happy-dom suporta para testes) | — | — |
| Vitest + @testing-library/react | Testes unitários | Sim | instalado | — |
| happy-dom | Ambiente de testes (DOM) | Sim | instalado | — |

**Sem dependências bloqueantes.**

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest (configurado em `vitest.config.ts`) |
| Config file | `vitest.config.ts` (usa `getViteConfig` do Astro) |
| Quick run command | `npm run test:unit -- --reporter=dot` |
| Full suite command | `npm run test:unit` |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando Automatizado | Arquivo Existe? |
|--------|--------------|---------------|---------------------|-----------------|
| ANIM-01 | HeroMotion renderiza múltiplos motion.div filhos com variants | unit | `npx vitest run tests/unit/components/HeroMotion.test.tsx` | Sim — ATUALIZAR mock |
| ANIM-01 | staggerChildren: 0.12 presente na prop variants do container | unit | (idem) | Sim — ATUALIZAR |
| ANIM-02 | IO callback adiciona data-revealed quando entry.isIntersecting=true | unit | `npx vitest run tests/unit/components/Layout.test.ts` | Sim — NOVO teste IO reveal |
| ANIM-03 | Nenhum "easeOut" string permanece nos componentes | unit (grep-based) | Verificação por grep nos arquivos afetados | manual / linting |
| ANIM-04 | SettingsToggle renderiza motion.span para indicador e label | unit | `npx vitest run tests/unit/components/SettingsToggle.test.ts` | Sim — ATUALIZAR mock |
| ANIM-04 | motion.span tem animate={{ x }} e animate={{ opacity }} | unit | (idem) | Sim — ATUALIZAR |
| ANIM-05 | .bonus-card tem data-stagger e style animation-delay | unit (HTML snapshot) | `npx vitest run tests/unit/components/` | verificar Bonuses.test se existir |

### Sampling Rate

- **Por commit de task:** `npx vitest run tests/unit/components/HeroMotion.test.tsx tests/unit/components/SettingsToggle.test.ts`
- **Por merge de wave:** `npm run test:unit`
- **Phase gate:** Suite completa verde antes de `/gsd:verify-work`

### Wave 0 Gaps (arquivos de teste que precisam ser criados ou atualizados)

- [ ] `tests/unit/components/HeroMotion.test.tsx` — atualizar mock para variants + múltiplos motion.div filhos
- [ ] `tests/unit/components/SettingsToggle.test.ts` — atualizar: adicionar mock de `motion/react`, testar que `motion.span` é renderizado para indicador e label
- [ ] `tests/unit/components/Layout.test.ts` — adicionar teste para IO reveal callback (padrão similar ao NavBar.test.ts)

---

## Security Domain

Esta fase não introduce autenticação, validação de dados externos, criptografia, ou sessões. As animações são puramente client-side CSS/JS sem surface de ataque.

Aplicabilidade ASVS: V5 Input Validation — não aplicável (sem inputs de usuário processados no servidor). Nenhuma categoria ASVS se aplica a esta fase.

---

## Sources

### Primary (HIGH confidence)

- `node_modules/motion/package.json` — versão 12.38.0 instalada confirmada [VERIFIED]
- `node_modules/framer-motion/dist/framer-motion.dev.js` — `calcChildStagger` e `staggerChildren` confirmados no bundle [VERIFIED]
- `src/components/HeroMotion.tsx` — API atual (whileInView, "easeOut") verificada [VERIFIED]
- `src/components/SettingsToggle.tsx` — CSS `left` atual verificado [VERIFIED]
- `src/lib/motion-utils.ts` — `useMotionEnabled`, `useReducedMotion` verificados [VERIFIED]
- `src/layouts/Layout.astro` — padrão IO do NavBar (linhas 170-187) verificado como referência [VERIFIED]
- `src/components/layout/NavBar.astro` — ocorrências de `ease-out` verificadas (linhas 59, 123) [VERIFIED]
- `src/components/ui/Button.astro` — ocorrências de `ease-out` verificadas (linhas 49, 66) [VERIFIED]
- `src/components/sections/Pricing.astro` — ocorrência de `ease-out` verificada (linha 281) [VERIFIED]
- `src/components/sections/Bonuses.astro` — estrutura estática dos 3 bonus-card verificada [VERIFIED]
- `tests/unit/components/HeroMotion.test.tsx` — mock atual verificado (necessita atualização) [VERIFIED]
- `tests/unit/components/SettingsToggle.test.ts` — mock atual verificado (necessita atualização) [VERIFIED]
- `vitest.config.ts` — framework de testes e projetos confirmados [VERIFIED]
- `.planning/config.json` — `"tdd": true` confirmado [VERIFIED]

### Secondary (MEDIUM confidence)

- `.planning/milestones/v1.2-phases/04-animation-implementation/04-CONTEXT.md` — todas as decisões D-XX travadas, copiadas verbatim [VERIFIED]
- `.planning/milestones/v1.2-phases/03-motion-critique/03-CRITIQUE.md` — inventário completo de ocorrências de easing genérico [VERIFIED]
- `.impeccable/design.json` — tokens de easing e duration verificados [VERIFIED]

### Tertiary (LOW confidence)

- A1: Comportamento de `React.Children.map` com children Astro serializados em island React — não verificado por teste. [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — motion@12.38.0 instalado e confirmado; staggerChildren verificado no bundle
- Architecture: HIGH — padrões verificados no código existente (NavBar IO, MotionConfig)
- Pitfalls: HIGH — identificados por inspeção direta do código-fonte afetado
- Inventário de easing genérico: HIGH — grep implícito via leitura de todos os arquivos afetados

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (motion/react é estável; Astro IO pattern é estável)
