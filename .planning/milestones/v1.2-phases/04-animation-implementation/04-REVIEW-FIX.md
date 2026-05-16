---
phase: 04-animation-implementation
fixed_at: 2026-05-16T09:30:00Z
review_path: .planning/milestones/v1.2-phases/04-animation-implementation/04-REVIEW.md
iteration: 1
findings_in_scope: 13
fixed: 10
skipped: 3
status: partial
---

# Phase 04: Code Review Fix Report

**Fixed at:** 2026-05-16T09:30:00Z
**Source review:** `.planning/milestones/v1.2-phases/04-animation-implementation/04-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 13 (4 Critical + 9 Warning)
- Fixed: 10
- Skipped: 3 (WR-03, WR-06, WR-08 — mudanças arquiteturais complexas, conforme instrução)

---

## Fixed Issues

### CR-01: SSR guard em applyFallback (motion-utils.ts)

**Files modified:** `src/lib/motion-utils.ts`
**Commit:** `3865916`
**Applied fix:** Adicionado `if (typeof window === "undefined") return;` no início de `applyFallback`, antes da chamada a `window.matchMedia(...)`. Elimina crash garantido em ambientes SSR/Node/Edge.

---

### CR-02: Fallback scroll listener quando sentinel #top ausente

**Files modified:** `src/components/layout/NavBar.astro`
**Commit:** `1bcd443`
**Applied fix:** Reestruturado o bloco de scrolled state para usar early-return se `nav` for null, e um `if/else if/else` que detecta ausência do sentinel `#top`. Quando ausente, ativa um listener de `scroll` passivo com `window.scrollY > 10` e faz cleanup em `astro:before-swap`. O path feliz com `IntersectionObserver` permanece intacto.

---

### CR-03: set-menu explicit state event para Escape key sync

**Files modified:** `src/components/MobileMenuMotion.tsx`, `src/components/layout/NavBar.astro`
**Commit:** `b30da67`
**Applied fix:** Em `MobileMenuMotion.tsx`, o handler de Escape agora despacha `new CustomEvent("set-menu", { detail: { open: false } })` em vez do toggle cego `toggle-menu`. Em `NavBar.astro`, adicionado listener `onSetMenu` para o evento `set-menu` que seta `menuOpen` e `aria-expanded`/`aria-label` explicitamente a partir de `e.detail.open`, com cleanup em `astro:before-swap`.

---

### CR-04: prefers-reduced-motion check em HeroMotionSingle + CSS rule

**Files modified:** `src/components/HeroMotion.tsx`, `src/layouts/Layout.astro`
**Commit:** `e44da52`
**Applied fix:** Em `HeroMotionSingle`, `useEffect` agora verifica `window.matchMedia("(prefers-reduced-motion: reduce)").matches` e retorna cedo sem aplicar `animationDelay` nem `classList.add("hero-stagger-item")`. Em `Layout.astro`, adicionada regra `@media (prefers-reduced-motion: reduce) { .hero-stagger-item { animation: none; opacity: 1; transform: none; } }` para cobrir usuários que já carregaram a classe antes de o JS verificar a media query.

---

### WR-01: Armazenar keyboard animation em animationRef

**Files modified:** `src/components/CarouselMotion.tsx`
**Commit:** `e9e0ea6`
**Applied fix:** Linha `animate(el, { x: targetX }, ...)` no handler de teclado alterada para `animationRef.current = animate(...)`, garantindo que a animação de navegação por teclado possa ser parada via `animationRef.current.stop()` no cleanup do `useEffect`.

---

### WR-02: Guard items.length === 0 em CarouselMotion

**Files modified:** `src/components/CarouselMotion.tsx`
**Commit:** `6102ab4`
**Applied fix:** Adicionado `if (items.length === 0) return;` após o guard `if (!el) return;` no `useEffect`, prevenindo a divisão por zero implícita em `(items.length - 1) / items.length` e a string `"NaN%"` passada para `animate()`.

---

### WR-04: Substituir background hardcoded #fff por var(--sub-nivel)

**Files modified:** `src/components/MobileMenuMotion.tsx`
**Commit:** `45d3391`
**Applied fix:** Substituído `background: "#fff"` por `background: "var(--sub-nivel, #1b293c)"` em ambas as ocorrências (no `motion.nav` e no `nav` de fallback) do componente. O menu móvel agora respeita o design system e se adapta a temas alternativos.

---

### WR-05: sectionObserver threshold 0 + rootMargin para seções altas

**Files modified:** `src/components/layout/NavBar.astro`
**Commit:** `39a508f`
**Applied fix:** Alterado `{ threshold: 0.3 }` para `{ threshold: 0, rootMargin: "-20% 0px -70% 0px" }` no `sectionObserver`. Com `threshold: 0`, qualquer quantidade de visibilidade dispara o observer; o `rootMargin` define uma "zona quente" de 10% do viewport (de 20% do topo até 30% do fundo), resolvendo o problema com seções altas como Curriculum.

---

### WR-07: will-change movido para :hover em Pricing e Button

**Files modified:** `src/components/sections/Pricing.astro`, `src/components/ui/Button.astro`
**Commit:** `a6e0352`
**Applied fix:** Em `Pricing.astro`, `will-change: transform` removido do estado base de `.price-card` e adicionado a `.price-card:hover`. Adicionado `will-change: auto` ao bloco `@media (prefers-reduced-motion: reduce)` para `.price-card` e `.price-card:hover`. Em `Button.astro`, `will-change: transform` removido do `.btn` base e adicionado a `.btn:hover`; o bloco `@media (prefers-reduced-motion: reduce)` já continha `will-change: auto` e permanece correto.

---

### WR-09: Remover arquivo de teste duplicado motion-utils.test.ts

**Files modified:** `tests/unit/motion-utils.test.ts` (deletado)
**Commit:** `98e63db`
**Applied fix:** Arquivo `tests/unit/motion-utils.test.ts` (raiz) deletado. A fonte de verdade canônica é `tests/unit/lib/motion-utils.test.ts`. Contagem de testes reduzida de 170 para 158 — os 12 testes removidos eram duplicatas exatas dos testes canônicos.

---

## Skipped Issues

### WR-03: MobileMenuMotion — flash ao alternar motionEnabled

**File:** `src/components/MobileMenuMotion.tsx:9,40`
**Reason:** Refatoração arquitetural complexa — requer consolidar os dois branches de renderização (motion.nav vs nav) em um único elemento com controle de animação via ref, sem desmontagem/remontagem. Mudança estrutural de alto risco para fase de fix pontual.
**Original issue:** Quando `motionEnabled` alterna de true para false com menu aberto, o branch `motion.nav` desmonta antes do `nav` nativo montar, causando flash sem animação de saída.

---

### WR-06: Layout.astro — data-stagger sem ancestral data-reveal fica invisível

**File:** `src/layouts/Layout.astro:229-235`
**Reason:** Sem mudança de código aplicável — a correção seria documentar o requisito estrutural em comentário CSS ou criar um lint customizado. O comentário in-code seria de baixo impacto e a criação de lint escapa do escopo do fix pontual.
**Original issue:** Qualquer elemento `data-stagger` fora de um ancestral `data-reveal` fica com `opacity: 0` permanentemente. Nos arquivos atuais todos os usos são corretos, mas não há proteção para adições futuras.

---

### WR-08: HeroMotion.test.tsx — mock de motion/react não cobre motion.span

**File:** `tests/unit/components/HeroMotion.test.tsx:13-55`
**Reason:** Refatoração de mock via Proxy é uma melhoria de robustez preventiva, não uma correção de bug ativo. Os testes estão passando. Prioridade baixa para fase de fix pontual; melhor endereçar em fase dedicada de qualidade de testes.
**Original issue:** O mock exporta apenas `motion: { div }` e `MotionConfig`. Uso futuro de `motion.span` quebraria com TypeError não descritivo.

---

## Verification

- **Tests:** `npx vitest run` — 158 PASS, 0 FAIL (170 antes, -12 = duplicatas removidas com WR-09)
- **Build:** `npm run build` — Completed in ~9s, 1 page built, nenhum erro

---

_Fixed: 2026-05-16T09:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
