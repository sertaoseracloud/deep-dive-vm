# Phase 5: Quality Audit - Research

**Researched:** 2026-05-16
**Domain:** Animation quality gates — performance audit, reduced-motion compliance, CLS measurement
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-AUDIT-01:** Usar `npx impeccable detect src/ --json` para gate QUAL-01. Filtrar findings por categorias de performance (will-change permanente, layout thrashing, transforms nao-compositor-only). Rodar contra `src/` (codigo-fonte).
- **D-AUDIT-02:** Playwright com `page.emulateMedia({ reducedMotion: 'reduce' })`. Adicionar testes ao arquivo existente `tests/e2e/motion-accessibility.spec.ts` (nao criar novo arquivo). Verificar `getComputedStyle()` nos elementos `[data-reveal]`, `[data-stagger]`, `.hero-stagger-item` e nos `motion.span` do SettingsToggle.
- **D-AUDIT-03:** Usar o script existente `npm run lighthouse:ci` (build + `astro preview` + lighthouse). Verificar `lighthouse-report.json` campo `audits['cumulative-layout-shift'].numericValue <= 0.1`. Gate so fecha com resultado verde.
- **D-PLAN-01:** 3 planos em sequencia (nao paralelos): 05-01 (QUAL-01), 05-02 (QUAL-02), 05-03 (QUAL-03).
- **D-PLAN-02:** Cada gate deve passar antes de avancar. Fase so fecha com todos os 3 gates verdes.

### Claude's Discretion

None — todas as decisoes estao bloqueadas.

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUAL-01 | Todas as animacoes novas mantem 60fps — sem layout thrashing, `will-change` aplicado com escopo controlado | Impeccable detect v2.1.9 detecta apenas antipatterns de tipografia/design atualmente (nao detecta will-change nem layout thrashing em CSS). O gate QUAL-01 requer inspecao manual do codigo-fonte, nao automacao via `--json`. Ver secao "Armadilha critica" abaixo. |
| QUAL-02 | `prefers-reduced-motion` desativa ou simplifica 100% das animacoes adicionadas no v1.2 | Playwright 1.59.1 suporta `page.emulateMedia({ media: 'screen', colorScheme: 'dark', reducedMotion: 'reduce' })`. `getComputedStyle()` funciona para verificar CSS. Para motion/react com `MotionConfig reducedMotion="user"`, os elementos `motion.span` nao emitem `animation` CSS — verificacao e diferente. |
| QUAL-03 | CLS permanece <= 0.1 apos adicoes de animacao (verificado via Lighthouse CI) | `npm run lighthouse:ci` aponta para URL de producao. Deve ser ajustado para localhost:4321 para gate confiavel. Estrutura JSON verificada: `audits['cumulative-layout-shift'].numericValue`. |
</phase_requirements>

---

## Summary

A Fase 5 audita a qualidade tecnica de todas as animacoes adicionadas na Fase 4 em 3 gates sequenciais. A pesquisa revelou uma discrepancia critica entre o que foi decidido (D-AUDIT-01) e o que a ferramenta realmente detecta: `npx impeccable detect src/ --json` na versao 2.1.9 **nao detecta will-change nem layout thrashing** — ela detecta apenas antipatterns de design tipografico. O gate QUAL-01 precisa ser reformulado como inspecao manual sistematica do codigo-fonte.

Os outros dois gates sao solidos: Playwright 1.59.1 tem API `emulateMedia` estavel para QUAL-02, e o `lighthouse-report.json` ja foi gerado anteriormente contra a URL de producao com CLS = 0 (score 1). O problema do QUAL-03 e que o script `lighthouse:ci` aponta para a URL de producao — para um gate CI confiavel, deve ser ajustado para `localhost:4321`.

**Recomendacao primaria:** Reescrever o gate QUAL-01 como "code review sistematico" dos 5 arquivos com animacoes CSS, verificando will-change, uso de transform/opacity (compositor-only), e ausencia de propriedades que causem layout (top, left, width, height, margin). O `impeccable detect --json` ainda deve ser rodado, mas sua saida e usada apenas para conferir se houve novos antipatterns — nao como gate de performance.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Will-change audit (QUAL-01) | Codigo-fonte (src/) | — | Inspecao estatica dos arquivos CSS/TSX |
| Reduced-motion compliance (QUAL-02) | Browser (Playwright) | CSS / JS runtime | Verificacao computada em runtime com media emulada |
| CLS measurement (QUAL-03) | Build + servidor local | Lighthouse CLI | CLS e metrica de runtime que requer pagina renderizada |

---

## ARMADILHA CRITICA: impeccable detect nao detecta will-change

**Verificado em sessao:** `npx impeccable detect src/ --json` com versao 2.1.9 retorna apenas 2 categorias de antipatterns: `overused-font` e `single-font`. A ferramenta **nao detecta**:

- `will-change` permanente (fora de `:hover`)
- Layout thrashing (uso de `top/left` em vez de `transform`)
- Transforms nao-compositor-only

O CONTEXT.md (D-AUDIT-01) descreve esse comportamento como expectativa, mas a justificativa do gate QUAL-01 deve ser ajustada: o executor nao pode "filtrar findings por categorias de performance" porque essas categorias nao existem na saida atual.

**Implicacao para o plano 05-01:** O gate QUAL-01 deve ser implementado como inspecao manual dos 5 arquivos com animacoes, usando criterios documentados (ver secao "Checklist QUAL-01" abaixo). O `impeccable detect --json` ainda roda (como registro de auditoria e para capturar eventuais novos antipatterns), mas a decisao pass/fail e manual.

[VERIFIED: execucao direta do comando na sessao — `npx impeccable detect src/ --json` retornou apenas `overused-font` e `single-font`]

---

## Standard Stack

### Ferramentas de auditoria (todas ja instaladas no projeto)

| Ferramenta | Versao | Proposito | Status |
|------------|--------|-----------|--------|
| impeccable | 2.1.9 | `detect --json` para registro de auditoria de design | Instalado via npx |
| @playwright/test | 1.59.1 | Testes E2E com `emulateMedia` para QUAL-02 | Instalado em devDependencies |
| lighthouse | 13.3.0 | Medicao de CLS para QUAL-03 | Instalado em devDependencies |
| @lhci/cli | 0.14.0 | Runner alternativo para Lighthouse CI | Instalado em devDependencies |

Nenhuma instalacao nova necessaria para esta fase. [VERIFIED: package.json inspecionado na sessao]

---

## Inventario de animacoes v1.2 (escopo do audit)

### Elementos CSS a verificar em QUAL-01 e QUAL-02

| Arquivo | Seletor/Classe | Tipo de animacao | Reducao CSS implementada? |
|---------|---------------|-----------------|--------------------------|
| `src/layouts/Layout.astro` | `[data-reveal]` | CSS transition (opacity + translateY) | Sim — `@media (prefers-reduced-motion: reduce)` seta `transition: none; opacity:1; transform: none` |
| `src/layouts/Layout.astro` | `[data-stagger]` | CSS animation `fade-up` + `animation-play-state` | Sim — `animation: none; opacity:1; transform: none` |
| `src/layouts/Layout.astro` | `.hero-stagger-item` | CSS animation `fade-up` via JS (HeroMotion) | Sim — `.hero-stagger-item { animation: none; opacity:1; transform: none }` |
| `src/components/sections/Pricing.astro` | `.price-card:hover` | CSS transform + will-change | Sim — `will-change: auto; transform: none` no reduced-motion |
| `src/components/ui/Button.astro` | `.btn:hover` | CSS transform + will-change | Sim — `will-change: auto; transition: none; transform: none` |
| `src/components/HeroMotion.tsx` | `motion.div` (caminho A) | motion/react variants (opacity, y, staggerChildren) | Sim — `MotionConfig reducedMotion="user"` suprime automaticamente |
| `src/components/HeroMotion.tsx` | `HeroMotionSingle` | `hero-stagger-item` via JS + CSS | Sim — `if (prefersReduced) return;` no useEffect |
| `src/components/SettingsToggle.tsx` | `motion.span` (label, indicador) | motion/react spring e opacity | Sim — `MotionConfig reducedMotion="user"` suprime automaticamente |
| `src/components/sections/Bonuses.astro` | `.bonus-card[data-stagger]` | CSS animation `fade-up` | Herdado do bloco `[data-stagger]` em Layout.astro |
| `src/components/sections/Pricing.astro` | `li[data-stagger]` | CSS animation `fade-up` | Herdado do bloco `[data-stagger]` em Layout.astro |

[VERIFIED: grep nos arquivos de codigo na sessao]

### will-change em uso no codebase

| Arquivo | Linha | Contexto | Avaliacao |
|---------|-------|----------|-----------|
| `src/components/sections/Pricing.astro:285` | `.price-card:hover` | `will-change: transform` — escopo limitado a `:hover` (OK) | Correto — will-change aplicado apenas quando hover iminente |
| `src/components/sections/Pricing.astro:298-301` | `@media reduced-motion` | `will-change: auto` — remove no reduced-motion (OK) | Correto |
| `src/components/ui/Button.astro:60` | `.btn:hover` | `will-change: transform` — escopo limitado a `:hover` (OK) | Correto |
| `src/components/ui/Button.astro:124` | `@media reduced-motion` | `will-change: auto` — remove no reduced-motion (OK) | Correto |

**Conclusao preliminar:** O codebase atual ja segue a boa pratica — `will-change` esta em `:hover` (escopo controlado), nao em nivel de classe permanente. O gate QUAL-01 provavelmente passara sem correcoes.

[VERIFIED: grep direto nos arquivos na sessao]

---

## Architecture Patterns

### QUAL-01: Checklist de auditoria manual

**Criterios pass/fail para will-change e performance:**

```
PASS: will-change aplicado apenas em :hover, ::before, ::after (escopo transitorio)
FAIL: will-change em classe base (ex: .price-card { will-change: transform })

PASS: animacoes usam apenas transform e opacity (compositor-only)
FAIL: animacoes usam top, left, width, height, margin, padding (causam layout reflow)

PASS: IntersectionObserver usado para scroll-reveal (nao scroll event listener)
FAIL: window.addEventListener('scroll', ...) com getBoundingClientRect em loop

PASS: animation-play-state paused/running (nao add/remove de classe com animacao completa)
FAIL: toggle de animacao recriando o elemento no DOM
```

**Arquivo a inspecionar** (5 arquivos, ordem sugerida):
1. `src/layouts/Layout.astro` — CSS global de data-reveal/data-stagger/hero-stagger-item + script IO
2. `src/components/HeroMotion.tsx` — motion.div variants + HeroMotionSingle useEffect
3. `src/components/SettingsToggle.tsx` — motion.span spring e opacity
4. `src/components/sections/Pricing.astro` — .price-card:hover will-change + li[data-stagger]
5. `src/components/ui/Button.astro` — .btn:hover will-change

### QUAL-02: Playwright emulateMedia — API exata

**Versao verificada:** Playwright 1.59.1

```typescript
// API correta para reducao de motion em Playwright 1.59.x
// [VERIFIED: Playwright 1.59.1 instalado no projeto]

test.describe("prefers-reduced-motion compliance (QUAL-02)", () => {
  test.use({
    // Forma 1: via test.use (aplica a todo o describe block)
  });

  test("data-reveal elements have no animation when reduced-motion is active", async ({ page }) => {
    // Forma 2: via page.emulateMedia antes do goto
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");

    // Verificar elemento [data-reveal]: deve ter opacity: 1 e transform: none
    const section = page.locator("[data-reveal]").first();
    const opacity = await section.evaluate(el =>
      parseFloat(window.getComputedStyle(el).opacity)
    );
    const transform = await section.evaluate(el =>
      window.getComputedStyle(el).transform
    );
    expect(opacity).toBe(1);
    // transform: none retorna "matrix(1, 0, 0, 1, 0, 0)" ou "none"
    expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
  });
});
```

**Propriedades CSS a verificar por tipo de elemento:**

| Elemento | Propriedade verificar | Valor esperado (reduced-motion) |
|----------|----------------------|--------------------------------|
| `[data-reveal]` (sem IO ativado ainda) | `opacity` | `1` (CSS sobrescreve o estado inicial 0) |
| `[data-reveal]` | `transform` | `none` ou `matrix(1,0,0,1,0,0)` |
| `[data-reveal]` | `transition` | `""` ou `"all 0s ease 0s"` (transition: none) |
| `[data-stagger]` | `animation-name` | `none` ou `""` |
| `[data-stagger]` | `opacity` | `1` |
| `.hero-stagger-item` | `animation-name` | `none` ou `""` |
| `.hero-stagger-item` | `opacity` | `1` |
| `.price-card:hover` | N/A — hover state | Verificar via evaluate com :hover simulado |

**Nota sobre motion/react com MotionConfig reducedMotion="user":**

Os componentes `HeroMotion` (caminho A) e `SettingsToggle` usam `MotionConfig reducedMotion="user"`. Com `page.emulateMedia({ reducedMotion: 'reduce' })`, o Playwright emula a media query do sistema — o motion/react detecta via `window.matchMedia("(prefers-reduced-motion: reduce)")` e suprime as animacoes automaticamente. Os `motion.span` e `motion.div` **nao emitem propriedade `animation` CSS** — eles aplicam estilos inline. A verificacao deve checar o estado final (opacity, transform inline) e nao `animation-name`.

Para `HeroMotionSingle` (caminho B), o useEffect verifica `window.matchMedia(...).matches` e retorna cedo sem adicionar a classe `hero-stagger-item`. A verificacao do Playwright confirma que os elementos `h1, p.hero-sub, .hero-cta-row` **nao tem** a classe `hero-stagger-item` quando reduced-motion esta ativo.

[ASSUMED: comportamento do motion/react com emulateMedia — nao verificado com Context7 nesta sessao por nao ter acesso ao MCP. Comportamento esperado baseado na semantica de `reducedMotion="user"` que depende de matchMedia do sistema.]

### QUAL-03: Lighthouse CI — ajuste de URL e leitura do JSON

**Problema identificado:** O script `lighthouse:ci` em package.json executa:
```bash
npm run build && npx astro preview & sleep 3 && npm run lighthouse
```

Onde `npm run lighthouse` e:
```bash
lighthouse https://mentoria.sertaoseracloud.com/deep-dive-vm/ --output json --output-path lighthouse-report.json --chrome-flags="--headless --no-sandbox"
```

**A URL aponta para producao** — o resultado existente em `lighthouse-report.json` foi gerado contra `https://mentoria.sertaoseracloud.com/deep-dive-vm/` (verificado: `finalUrl` no JSON). Para o gate QUAL-03 ser confiavel (medir o codigo atual, nao o codigo deployado), a URL deve ser ajustada para `http://localhost:4321/deep-dive-vm/`.

**Opcoes para o plano 05-03:**

Opcao A (preferida — sem modificar package.json permanentemente): Rodar o lighthouse diretamente na linha de comando:
```bash
npm run build
npx astro preview &
sleep 5
npx lighthouse http://localhost:4321/deep-dive-vm/ --output json --output-path lighthouse-report.json --chrome-flags="--headless --no-sandbox"
```

Opcao B: Modificar temporariamente o script `lighthouse` em package.json para apontar para localhost. Reverter apos o gate passar.

**Leitura do resultado:**
```javascript
// Verificacao automatizavel via node
const report = JSON.parse(fs.readFileSync("lighthouse-report.json", "utf8"));
const cls = report.audits["cumulative-layout-shift"];
console.log("CLS numericValue:", cls.numericValue); // <= 0.1 para passar
console.log("CLS score:", cls.score);              // 1 = passa, 0 = falha
console.log("CLS displayValue:", cls.displayValue);
// PASS: cls.numericValue <= 0.1
// FAIL: cls.numericValue > 0.1
```

[VERIFIED: estrutura do JSON verificada contra `lighthouse-report.json` existente na sessao. `numericValue: 0, score: 1, displayValue: "0"`]

### Playwright webServer — ja configurado

O `playwright.config.ts` ja tem `webServer` configurado:
```typescript
webServer: {
  command: "npm run preview",  // executa: astro preview
  url: "http://localhost:4321/deep-dive-vm/",
  reuseExistingServer: !process.env.CI,
  timeout: 60 * 1000,  // 60 segundos para o servidor iniciar
}
```

Isso significa que `npx playwright test` (ou `npm run test:axe`) **ja inicia o servidor automaticamente** se nao houver um rodando. O plano 05-02 nao precisa instruir o executor a iniciar o servidor manualmente.

**Ressalva:** O `webServer.command` e `npm run preview`, que requer que o build exista (`dist/` com o build mais recente). Se o plano 05-02 rodar sem um build previo, o comando vai falhar. O plano deve incluir `npm run build` antes de rodar os testes Playwright.

[VERIFIED: playwright.config.ts lido na sessao]

---

## Don't Hand-Roll

| Problema | Nao construir | Usar em vez | Por que |
|----------|--------------|-------------|---------|
| Detectar reduced-motion em testes | Custom media query mock | `page.emulateMedia({ reducedMotion: 'reduce' })` | API oficial Playwright — emula a preferencia do sistema operacional de forma confiavel |
| Medir CLS | Performance observer manual | Lighthouse CLI | Implementacao conforme Web Vitals spec, inclui heuristica de "session window" |
| Verificar computed styles | Strings CSS hardcoded | `window.getComputedStyle(el).propertyName` | Retorna valor calculado apos cascata CSS — mais confiavel que atributo `style` |

---

## Common Pitfalls

### Pitfall 1: `transform: none` vs valor matricial computado

**O que vai errado:** Playwright `getComputedStyle` nao retorna `"none"` para transform — retorna a matriz identidade `"matrix(1, 0, 0, 1, 0, 0)"`.

**Por que acontece:** O navegador converte `transform: none` para a representacao matricial no computed style.

**Como evitar:**
```typescript
// Nao fazer:
expect(transform).toBe("none");

// Fazer:
expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
// Ou:
expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
```

### Pitfall 2: `transition: none` retorna string nao-vazia

**O que vai errado:** `getComputedStyle(el).transition` com `transition: none` retorna `"all 0s ease 0s"` em alguns navegadores, nao `""`.

**Como evitar:** Verificar `transition-duration: "0s"` ou verificar ausencia de efeito visual em vez de verificar a propriedade `transition` diretamente.

### Pitfall 3: `[data-stagger]` com `animation-name`

**O que vai errado:** Verificar `animation` como string completa falha porque o valor inclui timing, delay, etc.

**Como evitar:**
```typescript
const animName = await el.evaluate(el =>
  window.getComputedStyle(el).animationName
);
expect(animName).toBe("none");
// Nao: expect(animation).toBe("none") — animation e shorthand com muitos valores
```

### Pitfall 4: `astro preview` requer build previo

**O que vai errado:** `npm run test:axe` falha porque o `webServer` tenta iniciar `astro preview` sem `dist/`.

**Como evitar:** Sempre rodar `npm run build` antes de `npm run test:axe` se o dist/ nao existir ou estiver desatualizado.

### Pitfall 5: Lighthouse aponta para producao, nao localhost

**O que vai errado:** `npm run lighthouse:ci` gera `lighthouse-report.json` com dados da URL de producao (`https://mentoria.sertaoseracloud.com/deep-dive-vm/`), nao do codigo local.

**Como evitar:** No plano 05-03, rodar o lighthouse diretamente contra `http://localhost:4321/deep-dive-vm/` (ver Opcao A acima).

### Pitfall 6: `animation-play-state: paused` nao e `animation: none`

**O que vai errado:** `[data-stagger]` usa `animation-play-state: paused` por padrao (a animacao existe mas esta pausada). Com `prefers-reduced-motion: reduce`, o CSS seta `animation: none` — a animacao e removida. Verificar `animation-play-state` seria incorreto.

**Como evitar:** Verificar `animation-name: none` para confirmar que a animacao foi removida (nao apenas pausada).

---

## Code Examples

### Estrutura base para os novos testes de QUAL-02

```typescript
// Adicionar em tests/e2e/motion-accessibility.spec.ts
// Grupo 7: QUAL-02 — prefers-reduced-motion compliance

test.describe("QUAL-02: prefers-reduced-motion compliance", () => {
  test("data-reveal sections have no transition when reduced-motion is active", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");

    const section = page.locator("[data-reveal]").first();
    await expect(section).toBeVisible();

    const opacity = await section.evaluate(el =>
      parseFloat(window.getComputedStyle(el).opacity)
    );
    const transform = await section.evaluate(el =>
      window.getComputedStyle(el).transform
    );

    expect(opacity).toBe(1);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
  });

  test("data-stagger elements have animation: none when reduced-motion is active", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");

    const staggerEl = page.locator("[data-stagger]").first();
    await expect(staggerEl).toBeVisible();

    const animName = await staggerEl.evaluate(el =>
      window.getComputedStyle(el).animationName
    );
    const opacity = await staggerEl.evaluate(el =>
      parseFloat(window.getComputedStyle(el).opacity)
    );

    expect(animName).toBe("none");
    expect(opacity).toBe(1);
  });

  test("hero-stagger-item class is NOT added when reduced-motion is active", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    // Se reduced-motion ativo, HeroMotionSingle retorna cedo sem adicionar hero-stagger-item
    const heroItems = await page.locator(".hero-stagger-item").count();
    expect(heroItems).toBe(0);
  });
});
```

### Verificacao CLS em Node.js

```javascript
// Script de verificacao — pode ser incluido no plano 05-03 como task
const fs = require("fs");
const report = JSON.parse(fs.readFileSync("lighthouse-report.json", "utf8"));
const cls = report.audits["cumulative-layout-shift"];
const passed = cls.numericValue <= 0.1;
console.log(`CLS: ${cls.numericValue} (${passed ? "PASS" : "FAIL"})`);
console.log(`Score: ${cls.score} | DisplayValue: ${cls.displayValue}`);
process.exit(passed ? 0 : 1);
```

---

## State of the Art

| Pratica anterior | Pratica atual | Impacto |
|-----------------|---------------|---------|
| `will-change: transform` em classe permanente | `will-change: transform` so em `:hover` | Menos camadas composites desnecessarias |
| `window.scroll` listener para reveals | `IntersectionObserver` + `data-reveal/revealed` | Zero custo em scroll — trigger so quando elemento entra na viewport |
| `animation-delay` via CSS inline fixo | `animation-play-state: paused/running` | Animacao nao inicia ate o IO disparar o `data-revealed` |

---

## Assumptions Log

| # | Claim | Section | Risco se errado |
|---|-------|---------|-----------------|
| A1 | `MotionConfig reducedMotion="user"` com `page.emulateMedia({ reducedMotion: 'reduce' })` suprime animacoes motion/react automaticamente | QUAL-02 patterns | Se nao suprimir, os testes Playwright precisam verificar os elementos de forma diferente (checar estilo inline aplicado pela lib) |
| A2 | `getComputedStyle(el).transform` retorna `"matrix(1, 0, 0, 1, 0, 0)"` para `transform: none` em Chromium | Pitfalls | Se retornar `"none"`, o codigo de verificacao simplifica |

---

## Open Questions

1. **MotionConfig + emulateMedia: comportamento verificado?**
   - O que sabemos: `MotionConfig reducedMotion="user"` usa `window.matchMedia("(prefers-reduced-motion: reduce)")` internamente.
   - O que nao sabemos: Se o Playwright `emulateMedia` tambem afeta o `matchMedia` chamado dentro de React hidratado (SSR + hydration).
   - Recomendacao: O plano 05-02 deve incluir uma task explorartoria: rodar o teste e inspecionar o DOM para confirmar que `motion.span` tem o estado final correto. Se necessario, verificar via `page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)` para confirmar que o Playwright realmente seta a preferencia.

2. **`sleep 3` no script `lighthouse:ci` e suficiente?**
   - O que sabemos: `playwright.config.ts` usa `timeout: 60000` para aguardar o servidor. O script `lighthouse:ci` usa `sleep 3` que pode nao ser suficiente para `astro preview` iniciar.
   - Recomendacao: No plano 05-03, usar `sleep 5` ou adicionar um loop de verificacao de saude antes de rodar o lighthouse.

---

## Environment Availability

| Dependencia | Requerida por | Disponivel | Versao | Fallback |
|-------------|--------------|-----------|--------|----------|
| impeccable (npx) | QUAL-01 | sim | 2.1.9 | Nenhum — executar via npx confirma versao |
| @playwright/test | QUAL-02 | sim | 1.59.1 | — |
| lighthouse (CLI) | QUAL-03 | sim | 13.3.0 | — |
| astro preview | QUAL-02, QUAL-03 | sim | 6.3.1 | — |
| Chrome (headless) | QUAL-02 (Playwright), QUAL-03 (Lighthouse) | presumido | — | — |

[VERIFIED: package.json e node_modules inspecionados na sessao]

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Playwright 1.59.1 (E2E) |
| Config file | `playwright.config.ts` |
| Comando rapido | `npm run test:axe` (so chromium, so motion-accessibility.spec.ts) |
| Suite completa | `npx playwright test --project=chromium` |

### Phase Requirements -> Test Map

| Req ID | Comportamento | Tipo de teste | Comando | Arquivo existe? |
|--------|--------------|--------------|---------|----------------|
| QUAL-01 | will-change em escopo controlado, sem layout thrashing | Inspecao manual (nao automatizavel via impeccable) | `npx impeccable detect src/ --json` (registro) + inspecao visual | N/A — inspecao |
| QUAL-02 | prefers-reduced-motion desativa 100% das animacoes v1.2 | E2E Playwright com emulateMedia | `npm run test:axe` | Parcialmente — novos testes a adicionar em `motion-accessibility.spec.ts` |
| QUAL-03 | CLS <= 0.1 apos animacoes da Fase 4 | Lighthouse CI | `npx lighthouse http://localhost:4321/deep-dive-vm/ --output json --output-path lighthouse-report.json` | N/A — script existente, URL a ajustar |

### Wave 0 Gaps

- [ ] `tests/e2e/motion-accessibility.spec.ts` — adicionar Group 7 (QUAL-02): 3-5 novos testes com `emulateMedia`
- [ ] Script auxiliar `scripts/check-cls.js` (opcional) — verificacao programatica do `lighthouse-report.json`

---

## Security Domain

Nao aplicavel — fase de auditoria de animacoes. Nenhuma autenticacao, dados de usuario ou entrada de formulario envolvidos. `security_enforcement` nao configurado em `.planning/config.json`.

---

## Sources

### Primary (HIGH confidence)
- Execucao direta `npx impeccable detect src/ --json` na sessao — saida completa verificada
- `playwright.config.ts` lido diretamente — webServer config confirmada
- `package.json` lido diretamente — scripts lighthouse e lighthouse:ci confirmados
- `lighthouse-report.json` lido diretamente — estrutura JSON e finalUrl confirmados
- `src/layouts/Layout.astro` linhas 185-252 — CSS de animacoes e 3 blocos @media reduced-motion verificados
- `src/components/HeroMotion.tsx` — logica prefers-reduced-motion no useEffect verificada
- `src/components/SettingsToggle.tsx` — MotionConfig reducedMotion="user" verificado
- `src/components/sections/Pricing.astro` e `Button.astro` — will-change em :hover verificados

### Secondary (MEDIUM confidence)
- Playwright 1.59.1 API `page.emulateMedia` — baseado em documentacao oficial Playwright e versao instalada confirmada

### Tertiary (LOW confidence / ASSUMED)
- Comportamento do MotionConfig com emulateMedia — A1 no Assumptions Log

---

## Metadata

**Confidence breakdown:**
- QUAL-01 gate design: HIGH — verificado que impeccable nao detecta will-change; inventario manual e correto
- QUAL-02 API Playwright: HIGH — versao instalada confirmada, API estavel desde Playwright 1.x
- QUAL-02 comportamento motion/react: MEDIUM — MotionConfig com matchMedia e comportamento documentado mas nao testado com emulateMedia especificamente
- QUAL-03 estrutura JSON: HIGH — lido do arquivo existente, campo confirmado

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stack estavel — motion, Playwright, Lighthouse sao maduro)
