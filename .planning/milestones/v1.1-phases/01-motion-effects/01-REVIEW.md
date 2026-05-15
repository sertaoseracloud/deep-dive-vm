---
phase: 01-motion-effects
reviewed_files:
  - src/lib/motion-utils.ts
  - src/components/CarouselMotion.tsx
  - src/components/MobileMenuMotion.tsx
  - src/components/SettingsToggle.tsx
  - src/pages/index.astro (seções de motion)
  - tests/unit/lib/motion-utils.test.ts
  - tests/unit/components/CarouselMotion.test.ts
  - tests/unit/components/MobileMenuMotion.test.ts
  - tests/unit/components/SettingsToggle.test.ts
  - tests/e2e/motion-accessibility.spec.ts
severity_counts:
  critical: 3
  warning: 5
  info: 3
date: 2026-05-15
---

# Phase 01 — Code Review: Motion Effects

## Summary

A base do sistema de motion (motion-utils, guards SSR, prefers-reduced-motion) está corretamente
estruturada. No entanto, três bugs críticos comprometem o comportamento visível em produção: o
SettingsToggle não persiste mudanças de estado na UI React, a animação do CarouselMotion traduz
para além dos limites sem retornar ao início produzindo tela em branco, e o guard SSR no useEffect
de cross-tab sync é ausente. Cinco warnings adicionais cobrem lógica de fallback incorreta,
acessibilidade de teclado prejudicada e inconsistência no tratamento de deleção do localStorage.

---

## Findings

### CRITICAL

#### [CRIT-01] SettingsToggle não atualiza o estado React — checkbox dessincroniza da UI

**File:** `src/components/SettingsToggle.tsx:8-9`

**Finding:**
O handler `onChange` chama `setMotionEnabled(e.target.checked)` (que grava no localStorage) mas
nunca aciona uma re-renderização do componente React. O hook `useMotionEnabled()` lê o valor
inicial do localStorage via `useState` initializer apenas uma vez na montagem; ele não ouve
mudanças feitas pelo próprio tab — somente por outros tabs via `StorageEvent`. Resultado: após
clicar no toggle, o checkbox visualmente volta para o estado anterior ao próximo render porque
`checked={motionEnabled}` usa o estado stale.

**Impact:**
O usuário clica no toggle para desativar animações, o checkbox pisca para o estado anterior, e
as animações continuam ativas. A funcionalidade de controle de motion fica completamente
inoperante para o usuário final.

**Fix:**
`setMotionEnabled` deve disparar um `StorageEvent` sintético ou `useMotionEnabled` deve expor um
setter que atualize o estado local junto com o localStorage. A abordagem mais limpa é criar um
setter combinado:

```typescript
// Em motion-utils.ts — expandir o hook para retornar setter
export function useMotionEnabled(): [boolean, (value: boolean) => void] {
  const prefersReduced = useReducedMotion();
  const [enabled, setEnabled] = useState<boolean>(() => { /* ... igual ao atual */ });

  const setAndPersist = useCallback((value: boolean) => {
    setEnabled(value);
    setMotionEnabled(value);
  }, []);

  if (prefersReduced) return [false, setAndPersist];
  return [enabled, setAndPersist];
}

// Em SettingsToggle.tsx
const [motionEnabled, setMotionEnabledUI] = useMotionEnabled();
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setMotionEnabledUI(e.target.checked);
};
```

---

#### [CRIT-02] Animação do CarouselMotion produz tela em branco — lógica de loop incorreta

**File:** `src/components/CarouselMotion.tsx:29-37`

**Finding:**
A animação infinita anima `x` de `"0%"` até `"${-(items.length) * 100}%"`. Para `items.length = 2`,
isso traduz o container para `-200%` e repete — mas o container tem apenas `200%` de largura total
(2 slides × 100%), então após o primeiro ciclo o container está completamente fora da viewport e o
loop reinicia do mesmo ponto `-200%` sem voltar para `0%`. O usuário vê tela em branco após o
primeiro ciclo completo.

**Impact:**
O carrossel de depoimentos fica inutilizável após ~4 segundos (uma duração de ciclo). Conteúdo de
prova social some da tela.

**Fix:**
Usar `repeat: Infinity` com `keyframes` que retornam ao origin, ou usar a abordagem correta de
loop com `repeatType: "loop"` e keyframes `["0%", "-100%"]` para 2 itens, ou clonar itens e usar
`animate` com callback de reinício:

```typescript
// Para N itens, a translação máxima é -(N-1)/N * 100% do container se cada item for 100vw,
// ou usar a técnica de infinite marquee com clone:
animationRef.current = animate(
  el,
  { x: ["0%", `${-((items.length - 1) / items.length) * 100}%`] },
  // ... mas o correto é calcular em pixels ou usar CSS scroll-snap
);

// Solução mais robusta — usar repeatType: "loop" com volta ao início:
animationRef.current = animate(
  el,
  { x: ["0%", `${-(items.length - 1) * 100}%`] }, // vai até o último slide
  {
    duration: items.length * 4,
    repeat: Infinity,
    repeatType: "mirror", // vai e volta, ou usar "loop" com keyframes que incluem retorno
    ease: "linear",
  }
);
```

---

#### [CRIT-03] Guard SSR ausente no useEffect de cross-tab sync

**File:** `src/lib/motion-utils.ts:49`

**Finding:**
O `useEffect` na linha 39-51 acessa `window.addEventListener` diretamente sem verificar
`typeof window !== "undefined"`. Em ambientes SSR (Astro renderiza componentes React no servidor
por padrão antes da hidratação com `client:load`), o `useEffect` não roda no servidor — mas se o
ambiente de execução for diferente (testes com happy-dom que não inicializa `window` corretamente,
ou contextos de SSR que executam effects), isso causa `ReferenceError: window is not defined`.

Adicionalmente, o `useState` initializer na linha 26 já tem o guard correto
(`typeof window === "undefined"`), mas o `useEffect` na linha 49 não segue o mesmo padrão
estabelecido pelo próprio módulo.

**Impact:**
Crash com `ReferenceError` em ambientes de teste ou SSR atípicos. Inconsistência com o padrão SSR
guard documentado no JSDoc do próprio módulo ("SSR-safe: returns false when window is undefined").

**Fix:**
```typescript
useEffect(() => {
  if (typeof window === "undefined") return; // guard SSR
  const handler = (event: StorageEvent) => {
    if (event.key !== MOTION_STORAGE_KEY) return;
    try {
      const newValue = event.newValue !== null
        ? (JSON.parse(event.newValue) as boolean)
        : true;
      setEnabled(newValue);
    } catch {
      // Ignore malformed values.
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}, []);
```

---

### WARNING

#### [WARN-01] Deleção de localStorage reativa animações silenciosamente

**File:** `src/lib/motion-utils.ts:43`

**Finding:**
No handler do `StorageEvent`, quando `event.newValue === null` (o item foi deletado via
`localStorage.removeItem(MOTION_STORAGE_KEY)`), o código define `newValue` como `true`:
```typescript
const newValue = event.newValue !== null ? (JSON.parse(event.newValue) as boolean) : true;
```
Isso significa que deletar a chave do storage em outro tab silenciosamente reativa animações,
contrariando a expectativa do usuário que pode ter desativado animações por razão médica
(vestibular disorder, epilepsia fotossensível).

**Impact:**
Potencial experiência prejudicial: um usuário com sensibilidade a movimento que desabilitou
animações via toggle pode ter as animações reativadas inesperadamente se outro código ou extensão
de browser limpar o localStorage.

**Fix:**
```typescript
// Quando o item é deletado, manter o estado atual em vez de assumir true:
const newValue = event.newValue !== null
  ? (JSON.parse(event.newValue) as boolean)
  : enabled; // manter estado corrente, não assumir true
setEnabled(newValue);
```
Ou simplesmente ignorar eventos de deleção:
```typescript
if (event.newValue === null) return; // item deletado — não alterar estado
```

---

#### [WARN-02] handleKeyDown no CarouselMotion não afeta animação quando motion está ativo

**File:** `src/components/CarouselMotion.tsx:64-83`

**Finding:**
O handler de teclado atualiza `currentIndex` via `setCurrentIndex` e aplica `applyFallback`
somente quando `!motionEnabled`. Quando `motionEnabled === true`, a animação infinita continua
rodando independentemente do índice selecionado — pressionar ArrowRight/ArrowLeft não tem efeito
visual quando a animação está habilitada. O estado `currentIndex` é atualizado mas não usado para
nada no branch de motion ativo.

**Impact:**
Navegação por teclado anunciada pelo `role="region"` e `tabIndex={0}` não funciona quando
animações estão habilitadas. Violação de WCAG 2.1 SC 2.1.1 (Keyboard).

**Fix:**
Quando o motion está ativo, pausar a animação automática e saltar para o slide correto ao
navegar por teclado:
```typescript
const handleKeyDown = useCallback(
  (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      // Pausar animação automática ao navegar por teclado
      if (animationRef.current) animationRef.current.pause();

      const nextIndex = e.key === "ArrowRight"
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
      setCurrentIndex(nextIndex);

      const el = containerRef.current;
      if (el) {
        // Animar para o slide correto independente do modo
        animate(el, { x: `-${nextIndex * 100}%` }, { duration: 0.15, ease: "easeOut" });
      }
    }
  },
  [currentIndex, items.length, motionEnabled]
);
```

---

#### [WARN-03] MobileMenuMotion: navRef nunca é atribuído ao branch motion.nav

**File:** `src/components/MobileMenuMotion.tsx:24-44`

**Finding:**
O `navRef` é declarado na linha 13 e usado no `useEffect` da linha 17 (`navRef.current`). No
branch `motionEnabled === true`, o componente renderiza `<motion.nav>` sem `ref={navRef}`. Quando
`motionEnabled` muda de `true` para `false` entre re-renders, o `useEffect` executa mas
`navRef.current` é `null` (pois o `<motion.nav>` anterior não tinha ref). O guard `if (!motionEnabled && navRef.current)` na linha 17 protege contra o crash, mas o fallback CSS não é
aplicado no primeiro render após a transição.

**Impact:**
Ao desativar animações enquanto o menu estava aberto, o menu pode ficar visível sem transição no
estado correto — comportamento visual inconsistente.

**Fix:**
Passar `ref={navRef}` para o `motion.nav` também:
```tsx
<motion.nav
  ref={navRef}  // adicionar esta linha
  initial={{ x: "-100%" }}
  animate={{ x: isOpen ? "0%" : "-100%" }}
  // ...
>
```
O `motion.nav` aceita `ref` via `forwardRef` interno do Motion.

---

#### [WARN-04] outline: "none" remove indicador de foco do carrossel

**File:** `src/components/CarouselMotion.tsx:91`

**Finding:**
```tsx
style={{ overflow: "hidden", outline: "none" }}
```
O container focável (`tabIndex={0}`) tem `outline: "none"` inline, removendo o anel de foco
visível para usuários de teclado. Isso viola WCAG 2.1 SC 2.4.7 (Focus Visible).

**Impact:**
Usuários navegando por teclado perdem a indicação visual de onde está o foco — problema de
acessibilidade direto.

**Fix:**
```tsx
// Remover outline: "none" e usar CSS para estilizar o foco:
style={{ overflow: "hidden" }}
// Em CSS:
// .carousel-track:focus-visible { outline: 2px solid currentColor; }
// Ou usar outline: "2px solid transparent" com box-shadow para design customizado.
```

---

#### [WARN-05] Valor do localStorage não é validado como boolean antes de usar

**File:** `src/lib/motion-utils.ts:30`

**Finding:**
```typescript
return JSON.parse(stored) as boolean;
```
O cast `as boolean` é apenas uma asserção TypeScript — sem validação em runtime. Se o localStorage
contiver um valor arbitrário como `"null"`, `"123"`, `"{}"`, ou qualquer string inválida para
JSON, `JSON.parse` retorna esse valor (ex: `null`, `123`, `{}`) que é cast para `boolean` sem
verificação. `JSON.parse("null")` retorna `null`, que é falsy mas não é `false`. Isso pode causar
comportamento inesperado.

**Impact:**
Valores corrompidos ou injetados no localStorage podem alterar o comportamento de motion de
forma imprevisível. Embora o vetor de ataque seja limitado (same-origin), é uma falta de
robustez defensiva.

**Fix:**
```typescript
const parsed = JSON.parse(stored);
if (typeof parsed === "boolean") return parsed;
// valor inválido — ignorar e usar default
```

---

### INFO

#### [INFO-01] Testes de componentes são existence-only — nenhum comportamento é testado

**Files:**
- `tests/unit/components/CarouselMotion.test.ts`
- `tests/unit/components/MobileMenuMotion.test.ts`
- `tests/unit/components/SettingsToggle.test.ts`

**Finding:**
Os três arquivos de teste de componente contêm apenas:
```typescript
it("is a function (React component)", () => {
  expect(typeof CarouselMotion).toBe("function");
});
```
Nenhum render é feito, nenhum comportamento é verificado. Bugs críticos como CRIT-01
(SettingsToggle não atualiza estado) e WARN-02 (teclado sem efeito com motion ativo) seriam
completamente invisíveis para estes testes.

**Fix:**
Expandir com pelo menos `render()` básico e assertions de comportamento:
- SettingsToggle: renderizar, clicar no checkbox, assertar que `setMotionEnabled` foi chamado
  com o valor correto.
- MobileMenuMotion: renderizar com `isOpen={true}`, assertar `aria-hidden="false"`; renderizar
  com `isOpen={false}`, assertar `aria-hidden="true"`.
- CarouselMotion: renderizar com 2 itens, pressionar ArrowRight via `userEvent`, assertar que
  `currentIndex` muda (via DOM ou callback spy).

---

#### [INFO-02] Cross-tab sync via StorageEvent não tem cobertura de teste

**File:** `tests/unit/lib/motion-utils.test.ts`

**Finding:**
O `useEffect` de cross-tab sync (motion-utils.ts:39-51) registra um handler de `storage` event
que é uma funcionalidade crítica do sistema (permite que um tab reflita mudanças feitas em outro).
Nenhum teste unitário simula um `StorageEvent` e verifica que o estado do hook é atualizado.

**Fix:**
```typescript
it("atualiza estado quando StorageEvent é disparado de outro tab", async () => {
  const { result } = renderHook(() => useMotionEnabled());
  expect(result.current).toBe(true);

  act(() => {
    window.dispatchEvent(new StorageEvent("storage", {
      key: MOTION_STORAGE_KEY,
      newValue: "false",
      oldValue: "true",
    }));
  });

  expect(result.current).toBe(false);
});
```

---

#### [INFO-03] applyFallback usa "all" como propriedade de transition — escopo muito amplo

**File:** `src/lib/motion-utils.ts:89`

**Finding:**
```typescript
transition: "all 150ms ease-out",
```
`transition: all` anima todas as propriedades CSS modificáveis, incluindo `color`, `opacity`,
`border`, etc. Isso pode causar transições não intencionais em propriedades que não deveriam ser
animadas, e é uma prática CSS considerada má por razões de performance e previsibilidade.

**Fix:**
Especificar apenas as propriedades que o carrossel e o menu realmente animam:
```typescript
transition: "transform 150ms ease-out",
```
Ou aceitar as propriedades relevantes como parâmetro da função para que cada chamador especifique
o que deve ser transicionado.

---

## Verdict

**FAIL**

Três bugs críticos — toggle de motion não funciona (CRIT-01), carrossel produz tela em branco
após o primeiro ciclo (CRIT-02), e guard SSR ausente no cross-tab sync (CRIT-03) — impedem que
esta fase seja considerada concluída. Os issues devem ser corrigidos antes de avançar para a
Phase 02.
