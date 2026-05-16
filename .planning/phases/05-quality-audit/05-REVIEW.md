---
phase: 05-quality-audit
reviewed: 2026-05-16T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/layouts/Layout.astro
  - src/components/SettingsToggle.tsx
  - tests/e2e/motion-accessibility.spec.ts
  - package.json
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Revisão padrão de quatro arquivos alterados na Fase 5 (Quality Audit): o layout global Astro, o componente React SettingsToggle, a suíte de testes E2E de acessibilidade de motion e o manifesto package.json.

O layout global está funcionalmente correto após o bugfix do `.hero-stagger-item`. O SettingsToggle apresenta um problema crítico de acessibilidade: o popover de reduced-motion usa `aria-live="polite"` mas permanece montado no DOM com `opacity: 0` quando `showHint` é falso — leitores de tela anunciam o conteúdo ao montar o elemento, não apenas quando visível. Quatro avisos cobrem: (1) o toggle de animações não é desativado quando `prefersReduced` é verdadeiro, deixando o usuário tentar interagir com um controle inútil; (2) o checkbox tem dois rótulos conflitantes (`htmlFor` e `aria-label`); (3) um teste do Grupo 7 faz asserção frágil sobre ausência de `.hero-stagger-item` dependendo de `networkidle`, que pode ser não-determinístico em CI; (4) `impeccable` aparece como `devDependency` sem nenhum script que o invoque explicitamente, e sua versão minor (`^2.1.9`) não está fixada para garantir reprodutibilidade de auditoria.

---

## Critical Issues

### CR-01: Popover `aria-live` anuncia conteúdo ao montar mesmo quando invisível

**File:** `src/components/SettingsToggle.tsx:40-81`

**Issue:** O `motion.div` do popover é renderizado condicionalmente apenas quando `prefersReduced` é `true` (linha 40), mas dentro dessa condição ele permanece **sempre presente no DOM** com `opacity: 0` quando `showHint` é falso (linha 43: `animate={{ opacity: showHint ? 1 : 0 }}`). O atributo `aria-live="polite"` no elemento (linha 45) faz com que leitores de tela como NVDA e VoiceOver anunciem o conteúdo textual da div no momento em que o componente monta — ou seja, toda vez que a página carrega com `prefers-reduced-motion: reduce` ativo, o texto "Animações desativadas pela preferência do sistema." é lido automaticamente, sem nenhuma interação do usuário. Isto contradiz a intenção da funcionalidade (exibir hint somente ao passar o mouse / focar).

**Causa raiz:** A animação de opacidade do Motion não é visibilidade real — o elemento existe no DOM desde o início. `aria-live` não respeita `opacity: 0`; responde a mudanças no conteúdo do nó, mas o conteúdo já está lá quando o nó é inserido.

**Fix:** Controlar a presença no DOM com `showHint`, não apenas a opacidade, e mover `aria-live` para um wrapper que só recebe conteúdo quando ativo:

```tsx
{prefersReduced && showHint && (
  <div
    role="tooltip"
    aria-live="polite"
    style={{
      position: "absolute",
      bottom: "calc(100% + 10px)",
      right: 0,
      width: "220px",
      padding: "10px 12px",
      background: "rgba(10, 15, 30, 0.97)",
      border: "1px solid var(--hairline-strong, rgba(0,255,255,0.32))",
      borderRadius: "4px",
      fontSize: "11px",
      lineHeight: "1.5",
      color: "var(--texto-secundario, rgba(255,255,255,0.6))",
      fontFamily: "'JetBrains Mono', monospace",
      pointerEvents: "none",
    }}
  >
    Animações desativadas pela preferência do sistema.
    <br />
    <span style={{ color: "var(--nucleo-eletrico, #00FFFF)" }}>
      Ative em: Sistema → Acessibilidade → Efeitos visuais
    </span>
    {/* caret */}
    <span style={{
      position: "absolute",
      bottom: "-6px",
      right: "28px",
      width: 0,
      height: 0,
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "6px solid var(--hairline-strong, rgba(0,255,255,0.32))",
    }} />
  </div>
)}
```

Se a animação de fade for necessária, usar `AnimatePresence` do Motion para animar entrada/saída, garantindo que o nó só exista no DOM quando `showHint` for verdadeiro.

---

## Warnings

### WR-01: Toggle permanece interativo quando `prefersReduced` é verdadeiro — UX e semântica enganosas

**File:** `src/components/SettingsToggle.tsx:133-145`

**Issue:** Quando `prefersReduced === true`, `useMotionEnabled` retorna `[false, setAndPersist]` (ver `motion-utils.ts` linha 71). O checkbox é exibido como desmarcado e o usuário pode clicar nele, mas a mudança não tem efeito visível porque `prefersReduced` sempre sobrepõe o valor armazenado. O valor é persistido no `localStorage` mas ignorado pelo hook. Isso cria uma ilusão de controle: o usuário alterna o toggle achando que está habilitando animações, mas nada muda.

**Fix:** Desabilitar o checkbox e exibir estado visual diferente quando o sistema impõe `prefersReduced`:

```tsx
<input
  id="motion-toggle"
  type="checkbox"
  checked={motionEnabled}
  onChange={onChange}
  disabled={prefersReduced ?? false}
  aria-label="Enable animations"
  aria-disabled={prefersReduced ? "true" : undefined}
  style={{
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
  }}
/>
```

E comunicar ao usuário via o label visível que o controle está inativo por decisão do sistema.

---

### WR-02: Duplo rótulo no checkbox — `htmlFor` e `aria-label` conflitantes

**File:** `src/components/SettingsToggle.tsx:97-145`

**Issue:** O `<input id="motion-toggle">` possui:
1. Um `<label htmlFor="motion-toggle">` na linha 97 (sem texto visível — contém apenas o visual do toggle).
2. Um `aria-label="Enable animations"` diretamente no input na linha 138.

Quando um `<label>` está associado via `htmlFor` e o elemento também possui `aria-label`, o `aria-label` sobrepõe o texto calculado do label per spec ARIA. O problema aqui é que o label HTML não tem texto legível (contém apenas o span visual), então a experiência de leitores de tela depende inteiramente do `aria-label` — mas o texto "Enable animations" está em inglês enquanto a interface é em português (o label visível "Animações" está em um `motion.span` separado, fora do `<label>`). Isso cria inconsistência idiomática.

**Fix:** Consolidar em um único mecanismo de rótulo. Adicionar texto legível em português ao `aria-label` do input e remover a dependência no `htmlFor` para rótulo de acessibilidade:

```tsx
<input
  id="motion-toggle"
  type="checkbox"
  checked={motionEnabled}
  onChange={onChange}
  aria-label="Ativar animações"
  ...
/>
```

Ou mover o texto "Animações" para dentro do `<label>` como texto visível e remover `aria-label` do input.

---

### WR-03: Teste de ausência de `.hero-stagger-item` é não-determinístico sob `networkidle`

**File:** `tests/e2e/motion-accessibility.spec.ts:247-261`

**Issue:** O teste na linha 247 usa `await page.waitForLoadState("networkidle")` como guard antes de assertar que `.hero-stagger-item` tem `count === 0`. O problema é que `networkidle` aguarda zero requisições de rede por 500ms, mas a hidratação de `client:visible` (usada pelo HeroMotion, conforme documentado no comentário do próprio teste) é acionada pelo `IntersectionObserver` — que depende de scroll/viewport, não de atividade de rede. Em CI com viewport padrão, o elemento hero pode ou não estar no viewport inicial, e a hidratação pode ocorrer após `networkidle` resolver. Se o JS de hidratação rodar e `prefersReduced` for detectado **depois** do `networkidle`, o teste passa por acaso. Se rodar antes, a classe pode ser adicionada brevemente antes de ser removida — ou pode nunca ser removida se a lógica de prevenção falhar.

A asserção correta seria aguardar estabilização do DOM após hidratação, não após rede idle.

**Fix:** Substituir `waitForLoadState("networkidle")` por uma espera explícita de hidratação do componente Hero, ou usar `waitForFunction` para confirmar que a hidratação ocorreu:

```typescript
// Aguardar que o componente React hidrate (indicador: o componente monta algum elemento interno)
await page.waitForFunction(() => {
  // Se HeroMotionSingle hidratou, ele terá executado a lógica de reduced-motion
  // e o DOM estará estável. Aguardamos até que o hero container esteja presente.
  const hero = document.querySelector('[data-hero-hydrated]');
  return hero !== null || document.readyState === 'complete';
}, { timeout: 5000 });

const count = await page.locator(".hero-stagger-item").count();
expect(count).toBe(0);
```

Alternativamente, adicionar um atributo `data-hero-hydrated` ao componente após hidratação para sinalizar ao teste.

---

### WR-04: `impeccable` em `devDependencies` sem script associado e sem versão fixa

**File:** `package.json:52`

**Issue:** A dependência `"impeccable": "^2.1.9"` foi adicionada como devDependency, mas nenhum script em `"scripts"` a invoca explicitamente. O range `^2.1.9` permite atualização automática para qualquer versão `2.x.x` subsequente, o que pode introduzir mudanças de comportamento silenciosas nas auditorias de qualidade. Em ferramentas de auditoria de código (como linters ou quality gates), reprodutibilidade é crítica — a mesma versão deve ser usada em cada execução para garantir que um gate que passou em um commit continue passando.

**Fix:** (a) Adicionar um script que invoca `impeccable` explicitamente para que seja claro quando e como a ferramenta é executada:

```json
"scripts": {
  ...
  "audit:quality": "impeccable"
}
```

(b) Fixar a versão exata no `package-lock.json` ou usar versão exata no `package.json`:

```json
"impeccable": "2.1.9"
```

---

## Info

### IN-01: Comentário inline de ajuste no Twitter creator sem rastreamento

**File:** `src/layouts/Layout.astro:40`

**Issue:** O comentário `// Ajustado conforme o perfil do mentor` na linha 40 é um comentário de anotação temporária que ficou no código de produção. Não acrescenta valor técnico permanente e não está vinculado a nenhuma issue ou decisão documentada.

**Fix:** Remover o comentário ou substituir por referência a uma decisão documentada (ex.: ADR ou ticket).

---

### IN-02: `transition: none` em `[data-reveal]` com reduced-motion pode não suprimir `transitionDuration` em todos os navegadores

**File:** `src/layouts/Layout.astro:206-212`

**Issue:** A regra CSS:
```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

O teste QUAL-02 (linha 217-221) aceita `transitionDuration === "0s"` OU `transitionProperty === "none"` OU `transitionProperty === ""` como prova de supressão. O valor computado de `transition: none` em diferentes engines pode retornar `transitionProperty: "all"` com `transitionDuration: "0s"` — o que passa no teste. Porém, se a especificidade da regra for sobreposta por outro seletor que defina `transition-duration` explicitamente, o `transition: none` seria ignorado silenciosamente. Considerar usar `transition-duration: 0s !important` como garantia defensiva.

**Fix:** Embora não seja um bug imediato, tornar a supressão mais explícita:
```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition-duration: 0s !important;
  }
}
```

---

### IN-03: `test:axe` no `package.json` não passa `--reporter` — falhas silenciosas em CI

**File:** `package.json:21`

**Issue:** O script `"test:axe": "npx playwright test tests/e2e/motion-accessibility.spec.ts --project=chromium"` não especifica `--reporter`. Em CI, `playwright.config.ts` define `reporter: process.env.CI ? "github" : "html"` (linha 9), mas se `test:axe` for invocado diretamente em pipeline sem definir `CI`, o reporter será HTML e falhas podem não ser visíveis no output do pipeline sem abrir o arquivo HTML.

**Fix:** Adicionar `--reporter=list` ou `--reporter=github` ao script para garantir output legível em qualquer contexto:

```json
"test:axe": "npx playwright test tests/e2e/motion-accessibility.spec.ts --project=chromium --reporter=list"
```

---

_Reviewed: 2026-05-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
