---
phase: 01-motion-effects
fixed_at: 2026-05-15T07:33:00Z
review_path: .planning/milestones/v1.1-phases/01-motion-effects/01-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-15T07:33:00Z
**Source review:** .planning/milestones/v1.1-phases/01-motion-effects/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (3 Critical + 5 Warning)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CRIT-01: SettingsToggle nao atualiza o estado React

**Files modified:** `src/lib/motion-utils.ts`, `src/components/SettingsToggle.tsx`, `src/components/CarouselMotion.tsx`, `src/components/MobileMenuMotion.tsx`, `tests/unit/components/CarouselMotion.test.ts`, `tests/unit/components/MobileMenuMotion.test.ts`, `tests/unit/components/SettingsToggle.test.ts`, `tests/unit/lib/motion-utils.test.ts`, `tests/unit/motion-utils.test.ts`
**Commit:** `151642f`
**Applied fix:** `useMotionEnabled` agora retorna tupla `[boolean, (value: boolean) => void]`. Adicionado `useCallback` ao import. O setter `setAndPersist` atualiza React state via `setEnabled` E persiste no localStorage via `setMotionEnabled` atomicamente. `SettingsToggle` desestrutura a tupla e usa `setMotionEnabledUI` no onChange. `CarouselMotion` e `MobileMenuMotion` desestrutura apenas `[motionEnabled]`. Todos os mocks de teste atualizados para retornar `[true, vi.fn()]`. Assertions `result.current` atualizadas para `result.current[0]`.

---

### CRIT-02: Animacao do CarouselMotion produz tela em branco

**Files modified:** `src/components/CarouselMotion.tsx`
**Commit:** `151642f`
**Applied fix:** Substituido o endpoint da animacao de `-(items.length * 100)%` para `-((items.length - 1) / items.length * 100)%` da largura da track. Adicionado `repeatType: "mirror"` para que a animacao oscile entre o primeiro e ultimo slide sem produzirem tela em branco. Duracao ajustada para `items.length * 4` segundos.

---

### CRIT-03: Guard SSR ausente no useEffect de cross-tab sync

**Files modified:** `src/lib/motion-utils.ts`
**Commit:** `151642f`
**Applied fix:** Adicionado `if (typeof window === "undefined") return;` como primeira instrucao do callback do `useEffect` de sincronizacao cross-tab, seguindo o padrao SSR guard ja estabelecido no `useState` initializer do mesmo hook.

---

### WARN-01: Delecao de localStorage reativa animacoes silenciosamente

**Files modified:** `src/lib/motion-utils.ts`
**Commit:** `151642f`
**Applied fix:** No handler do `StorageEvent`, adicionado guard `if (event.newValue === null) return;` antes do parse. Quando o item e deletado, o estado atual e preservado em vez de reativar animacoes com o valor padrao `true`.

---

### WARN-02: Keyboard navigation has no effect when animation is active

**Files modified:** `src/components/CarouselMotion.tsx`
**Commit:** `151642f`
**Applied fix:** `handleKeyDown` reformulado para: (1) chamar `e.preventDefault()`; (2) calcular `nextIndex` independente do modo; (3) pausar `animationRef.current` quando motion esta ativo; (4) chamar `animate(el, { x: targetX }, { duration: 0.15, ease: "easeOut" })` para todos os modos. A posicao `targetX` e calculada como `-(nextIndex / items.length * 100)%` da largura da track.

---

### WARN-03: navRef nunca e atribuido ao branch motion.nav

**Files modified:** `src/components/MobileMenuMotion.tsx`
**Commit:** `151642f`
**Applied fix:** Adicionado `ref={navRef}` ao elemento `<motion.nav>`. O componente `motion.nav` suporta refs via `forwardRef` interno do Motion. Com isso, quando `motionEnabled` transiciona de `true` para `false`, `navRef.current` aponta para o elemento correto e o fallback CSS e aplicado adequadamente.

---

### WARN-04: outline:none remove indicador de foco do carrossel

**Files modified:** `src/components/CarouselMotion.tsx`
**Commit:** `151642f`
**Applied fix:** Removido `outline: "none"` do `style` do container externo focavel. O container agora tem apenas `style={{ overflow: "hidden" }}`, permitindo que o anel de foco padrao do browser seja exibido para navegacao por teclado (WCAG 2.1 SC 2.4.7).

---

### WARN-05: Valor do localStorage nao e validado como boolean

**Files modified:** `src/lib/motion-utils.ts`
**Commit:** `151642f`
**Applied fix:** Substituido `return JSON.parse(stored) as boolean` por validacao em runtime: `const parsed = JSON.parse(stored); if (typeof parsed === "boolean") return parsed;`. Valores invalidos (null, numeros, objetos) sao ignorados e o hook usa o valor padrao `true`. O mesmo padrao foi aplicado ao handler do `StorageEvent`.

---

## Skipped Issues

Nenhum finding foi pulado — todos os 8 findings em escopo foram corrigidos com sucesso.

---

_Fixed: 2026-05-15T07:33:00Z_
_Fixer: Claude Sonnet 4.6 (gsd-code-fixer)_
_Iteration: 1_
