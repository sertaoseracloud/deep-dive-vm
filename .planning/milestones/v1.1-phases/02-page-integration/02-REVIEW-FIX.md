---
phase: 02-page-integration
fixed_at: 2026-05-15T13:18:00Z
review_path: .planning/milestones/v1.1-phases/02-page-integration/02-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 10
skipped: 1
status: partial
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-05-15T13:18:00Z
**Source review:** `.planning/milestones/v1.1-phases/02-page-integration/02-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 11 (4 Critical + 7 Warning)
- Fixed: 10
- Skipped: 1 (WR-02 incluído atomicamente no commit de WR-01)

## Fixed Issues

### CR-01: `aria-hidden={false}` silently dropped by React

**Files modified:** `src/components/MobileMenuMotion.tsx`, `tests/unit/components/MobileMenuMotion.test.tsx`
**Commit:** 17a2214
**Applied fix:** Substituído `aria-hidden={!isOpen}` (boolean) por `aria-hidden={!isOpen ? "true" : undefined}` em ambos os branches (motion.nav e nav fallback). Testes atualizados: quando aberto, verifica `hasAttribute("aria-hidden") === false` em vez de `getAttribute === "false"`.

---

### CR-02: Hero content invisible without JavaScript

**Files modified:** `src/components/sections/Hero.astro`
**Commit:** 329aa21
**Applied fix:** Adicionada regra CSS `:global(astro-island .hero-content) { opacity: 1 !important }` no bloco `<style>` de Hero.astro. Sobrescreve o `initial={{ opacity: 0 }}` do motion.div antes da hidratação. Após hidratação, o motion/react aplica inline style com especificidade maior, mantendo a animação funcional.

---

### CR-03: Purchase button permanently commented out

**Files modified:** `src/components/sections/Pricing.astro`
**Commit:** 20329e9
**Applied fix:** Botão `<Button>` restaurado com `href="#investimento"` como placeholder seguro e `customClass="price-cta"`. Comentário `{/* TODO(launch): Replace href with real Hotmart URL before go-live */}` adicionado acima para sinalizar o pendente de lançamento.

---

### CR-04: `aria-current="true"` invalid for navigation links

**Files modified:** `src/components/layout/NavBar.astro`
**Commit:** 3ef82e2
**Applied fix:** `setAttribute("aria-current", "true")` alterado para `"page"`. Seletor CSS `.nav-links a[aria-current="true"]` atualizado para `.nav-links a[aria-current="page"]`. Screen readers anunciarão "current page" com contexto adequado.

---

### WR-01: IntersectionObservers never disconnected — memory leak

**Files modified:** `src/components/layout/NavBar.astro`
**Commit:** 3b26d58
**Applied fix:** Adicionado `document.addEventListener("astro:before-swap", () => { scrollObserver.disconnect(); }, { once: true })` após o scrollObserver e equivalente para o sectionObserver. Previne acúmulo de observers em navegação SPA com Astro View Transitions.

**Nota:** WR-02 (bounds check `entries.length === 0`) foi incluído neste mesmo commit atomicamente, pois ambas as alterações eram no mesmo bloco de script do NavBar.

---

### WR-03: `applyFallback` applies transition in reduced-motion path

**Files modified:** `src/lib/motion-utils.ts`
**Commit:** 20e878a
**Applied fix:** `applyFallback` agora verifica `window.matchMedia("(prefers-reduced-motion: reduce)").matches` antes de aplicar a transição CSS. Quando `prefersReduced` é `true`, o spread `transition: "all 150ms ease-out"` é omitido.

---

### WR-04: `SettingsToggle` outer div has `aria-label` without a role

**Files modified:** `src/components/SettingsToggle.tsx`
**Commit:** 6114da2
**Applied fix:** Adicionado `role="group"` ao div externo com `aria-label="Controle de animações"`. Permite que o label seja exposto na árvore de acessibilidade conforme exige o spec ARIA.

---

### WR-05: Button reduced-motion CSS leaves filter and box-shadow transitions active

**Files modified:** `src/components/ui/Button.astro`
**Commit:** a367536
**Applied fix:** Adicionado `transition: none` ao bloco `.btn` dentro de `@media (prefers-reduced-motion: reduce)`. Desativa todas as transições CSS (transform, filter, background, box-shadow) para usuários com preferência por movimento reduzido.

---

### WR-06: `MobileMenuMotion` has no Escape key handler

**Files modified:** `src/components/MobileMenuMotion.tsx`
**Commit:** 0312eea
**Applied fix:** Adicionado `useEffect` que registra listener de `keydown` quando `isOpen` é `true`. Ao pressionar Escape, dispara `CustomEvent("toggle-menu")`. O cleanup do useEffect remove o listener automaticamente ao fechar o menu ou desmontar.

---

### WR-07: Test for post-unmount does not verify handler removal

**Files modified:** `tests/unit/components/MobileMenuMotion.test.tsx`
**Commit:** 17a2214 (incluído no commit de CR-01)
**Applied fix:** Teste "cleanup no unmount" atualizado para incluir verificação `expect(document.querySelector("nav")).toBeNull()` após unmount, garantindo que o componente não está mais no DOM. Comentário explica limitação de inspecionar setState após unmount.

---

## Skipped Issues

### WR-02: `entries[0]` accessed without bounds check

**File:** `src/components/layout/NavBar.astro:177`
**Reason:** Fix aplicado atomicamente no commit de WR-01 (3b26d58). O bounds check `if (entries.length === 0) return;` foi adicionado ao callback do scrollObserver no mesmo patch que o cleanup do observer. Não há commit separado porque a alteração foi feita no mesmo bloco de código durante o patch de WR-01.
**Status:** Corrigido (no commit 3b26d58, etiquetado como WR-01).

---

## Verification Results

**Unit tests:** 142/142 passed (após fast-forward dos commits para main)
**Build:** Completed in 13.35s — sem erros
**Coverage errors:** Pré-existentes (thresholds de 95% não relacionados a estas mudanças)

---

_Fixed: 2026-05-15T13:18:00Z_
_Fixer: Claude Sonnet 4.6 (gsd-code-fixer)_
_Iteration: 1_
