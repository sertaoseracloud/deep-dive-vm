# Phase 8: Multi-LP Scaffold - Research

**Researched:** 2026-05-17
**Domain:** Astro SSG — rota estática LP-lite, Open Graph placeholder, testes E2E Playwright, HOWTO de desenvolvedor
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01 — Página /deep-dive-ec2/ (SCAFF-01)**
- Estilo: LP-lite com teaser — usa `Layout.astro` (dark theme, sem NavBar, sem Footer)
- Conteúdo: `h1` + parágrafo de descrição (2-3 linhas sobre AWS EC2) + badge visual "Em breve"
- Indexação: sem `noindex` — a página aparece no sitemap desde o deploy inicial
- Navegação: link `← Ver todos os cursos` apontando para `/`

**D-02 — Open Graph da página EC2**
- `public/ec2-og.png` — placeholder 1200×630px gerado com o mesmo script sharp de hub-og.png
- OG completo: `og:title`, `og:description`, `og:image` (/ec2-og.png), `og:url`

**D-03 — Testes (SCAFF-01)**
- E2E: `tests/e2e/ec2-coming-soon.spec.ts` seguindo padrão de `hub.spec.ts`
- SEO: adicionar teste 16 em `tests/seo/seo-meta.test.ts` verificando `ec2-og.png` em `dist/deep-dive-ec2/index.html`

**D-04 — HOWTO-new-landing-page.md (SCAFF-02)**
- Formato: checklist numérico com trechos de código
- Escopo: 7 passos do zero ao deploy, referenciando EC2 como exemplo vivo

### Claude's Discretion
- Texto exato da descrição do curso EC2 na página teaser
- Estilo visual do badge "Em breve" e do link de volta ao hub
- Localização do link de volta ao hub (topo definido por 08-UI-SPEC.md)

### Deferred Ideas (OUT OF SCOPE)
- Feature toggle para liberar rotas por deploy (ex: flags por environment variable)

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCAFF-01 | Rota `/deep-dive-ec2/` existe e exibe página "em breve" simples, demonstrando o padrão de adição de nova LP | Layout.astro aceita `ogImage` e `noindex` — criar `src/pages/deep-dive-ec2/index.astro` com as props corretas; sitemap automático via `@astrojs/sitemap` sem filtros; padrão do hub verificado como template |
| SCAFF-02 | `HOWTO-new-landing-page.md` na raiz documenta o processo completo: criar `src/pages/[slug]/index.astro`, adicionar card ao hub, criar og:image, atualizar testes | O codebase atual fornece todos os artefatos de exemplo reais para documentar; 7 passos mapeados com os arquivos exatos envolvidos |

</phase_requirements>

---

## Summary

A Fase 8 é a fase mais simples do milestone v1.3 — nenhuma nova dependência, nenhum padrão novo. Tudo que o executor precisa já existe no codebase: o `Layout.astro` aceita `ogImage` e `noindex`, `src/data/courses.ts` já declara o EC2 com a URL correta, e `hub.spec.ts` e `seo-meta.test.ts` (teste 15) são templates prontos para replicação.

Os três entregáveis são independentes e podem ser planejados em planos sequenciais: (1) criar a página EC2 + placeholder OG, (2) criar os testes E2E e SEO, (3) escrever o HOWTO. A ordem importa porque o HOWTO deve referenciar artefatos reais já criados.

A única armadilha identificada é o teste SEO existente: `seo-meta.test.ts` usa `DIST_INDEX` apontando para `dist/deep-dive-vm/index.html` como variável singleton no `beforeAll` — o teste 16 precisará declarar seu próprio caminho `dist/deep-dive-ec2/index.html` localmente dentro do `it()`, não reutilizar `DIST_INDEX`.

**Recomendação primária:** Implementar na ordem: página EC2 → testes → HOWTO. Não criar arquivo de rota sem ter o placeholder OG pronto (o build falha se `public/ec2-og.png` não existir quando referenciado).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Rota /deep-dive-ec2/ | Frontend Server (SSR/SSG) | — | File-based routing do Astro: `src/pages/deep-dive-ec2/index.astro` → `dist/deep-dive-ec2/index.html` |
| Open Graph ec2-og.png | CDN / Static | — | `public/` é copiado verbatim para `dist/` e servido pelo GitHub Pages |
| Sitemap entry /deep-dive-ec2/ | Build pipeline | — | `@astrojs/sitemap` descobre rotas automaticamente no build — nenhuma config manual |
| Testes E2E (Playwright) | CI / Verificação | — | `ec2-coming-soon.spec.ts` corre via `npx playwright test` no CI |
| Testes SEO (Vitest) | CI / Verificação | — | `seo-meta.test.ts` lê `dist/` após `npm run build` |
| HOWTO-new-landing-page.md | Documentação | — | Arquivo Markdown na raiz do repositório |

---

## Standard Stack

### Core (zero mudanças — stack já existente)

| Biblioteca | Versão atual | Propósito | Por que padrão |
|------------|-------------|-----------|----------------|
| astro | ^6.3.1 | SSG file-based routing, build, preview | Motor do projeto |
| @astrojs/sitemap | ^3.7.2 | Geração automática de sitemap | Integração já configurada |
| sharp | ^0.34.5 | Geração de PNG 1200×630 para og:image | Já em `dependencies` — usado para hub-og.png |
| astro-seo | ^1.1.0 | Emissão de meta tags OG no `<head>` | Usado em Layout.astro |
| @playwright/test | ^1.59.1 | Testes E2E multi-browser | Infraestrutura já em uso |
| vitest | ^3.2.4 | Testes unitários e SEO estáticos | Infraestrutura já em uso |

**Nenhuma instalação necessária.** [VERIFIED: package.json do projeto]

### Alternativas Consideradas

| Em vez de | Poderia usar | Tradeoff |
|-----------|-------------|----------|
| sharp (script inline) | comando `convert` do ImageMagick | sharp já está em `dependencies`; ImageMagick seria nova dependência de sistema |
| file-based routing nativo | `getStaticPaths()` | Para rota estática simples, file-based é suficiente e mais simples |

---

## Package Legitimacy Audit

> Esta fase instala **zero pacotes novos**. Todos os pacotes já estão em `package.json`.

| Package | Decisão |
|---------|---------|
| sharp, astro, @astrojs/sitemap, astro-seo, @playwright/test, vitest | Já instalados — sem gate necessário |

**Pacotes removidos por slopcheck:** nenhum
**Pacotes suspeitos:** nenhum

---

## Architecture Patterns

### Diagrama de Fluxo — Criação de Nova LP

```
Desenvolvedor (checklist HOWTO)
         │
         ▼
src/pages/[slug]/index.astro  ──────────────────────────────┐
         │ importa                                           │
         ▼                                                   │
src/layouts/Layout.astro       ◄── ogImage prop → OG meta  │
         │ usa                                               │
         ▼                                                   │
src/data/courses.ts            (EC2 já declarado — sem editar) │
                                                             │
public/[slug]-og.png  ◄── script sharp (1200×630)           │
         │                                                   │
         ▼                                                   │
npm run build                                                │
         │                                                   │
         ▼                                                   │
dist/[slug]/index.html ─────────────────────────────────────┘
dist/sitemap-0.xml     (EC2 aparece automaticamente)
         │
         ▼
tests/e2e/[slug]-coming-soon.spec.ts  → Playwright → HTTP 200, h1, badge, back-link
tests/seo/seo-meta.test.ts (teste 16) → Vitest → dist/deep-dive-ec2/index.html contém ec2-og.png
```

### Estrutura de Projeto (arquivos a criar/modificar)

```
raiz do repositório
├── HOWTO-new-landing-page.md        ← CRIAR (SCAFF-02)
├── public/
│   └── ec2-og.png                   ← CRIAR (placeholder 1200×630)
├── src/
│   └── pages/
│       └── deep-dive-ec2/
│           └── index.astro          ← CRIAR (SCAFF-01)
└── tests/
    ├── e2e/
    │   └── ec2-coming-soon.spec.ts  ← CRIAR (D-03)
    └── seo/
        └── seo-meta.test.ts         ← MODIFICAR (adicionar teste 16)
```

**Arquivos que NÃO precisam de alteração:**
- `src/layouts/Layout.astro` — props já completas (ogImage, noindex, url, title, description)
- `src/data/courses.ts` — EC2 já declarado com `status: 'coming-soon'` e `url: '/deep-dive-ec2/'`
- `astro.config.mjs` — sitemap sem filtros, EC2 aparece automaticamente
- `.lhcirc.json` / `.lighthouserc.json` — auditam `/deep-dive-vm/` especificamente; EC2 não precisa ser adicionado

### Padrão 1: Página LP-lite (baseado em src/pages/index.astro)

**O que é:** Página Astro usando `Layout.astro` sem NavBar/Footer, com `main` e skip-link, coluna única compacta.

**Quando usar:** Qualquer nova landing page "em breve" ou teaser.

**Template exato para `src/pages/deep-dive-ec2/index.astro`:**
```astro
---
// Source: src/pages/index.astro (padrão do hub, Fase 7)
import Layout from "../../layouts/Layout.astro";
---

<Layout
  title="Deep Dive EC2 — Em breve · O Sertão será Cloud"
  description="Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática. Em breve na plataforma."
  url="https://mentoria.sertaoseracloud.com/deep-dive-ec2/"
  ogImage="/ec2-og.png"
>
  <a href="#conteudo-principal" class="skip-link">Pular para o conteúdo</a>

  <main id="conteudo-principal" tabindex="-1" aria-label="Página do curso Deep Dive EC2">
    <div class="ec2-container">
      <a href="/" class="back-link">← Ver todos os cursos</a>
      <h1>Deep Dive EC2</h1>
      <span class="badge badge-coming-soon">EM BREVE</span>
      <p>Formação técnica focada em AWS EC2 — domine instâncias,
         auto scaling e arquitetura na prática. Em breve na plataforma.</p>
    </div>
  </main>
</Layout>

<style>
  /* Tokens herdados de Layout.astro :root — não criar variáveis novas */
  .ec2-container {
    max-width: 480px;
    margin: 0 auto;
    padding: 48px 32px;
    position: relative;
    z-index: 1;
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--texto-terciario);
    text-decoration: none;
    font-family: "Space Grotesk", system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    padding: 12px 0;
    margin-bottom: 32px;
    transition: color 0.2s ease;
  }
  .back-link:hover { color: var(--nucleo-eletrico); }
  @media (prefers-reduced-motion: reduce) {
    .back-link { transition: none; }
  }
  h1 {
    font-family: "Chakra Petch", sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--texto-principal);
    margin: 0 0 16px 0;
  }
  .badge {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    padding: 2px 8px;
    border-radius: 2px;
    white-space: nowrap;
  }
  .badge-coming-soon {
    color: var(--alerta);
    border: 1px solid var(--alerta);
  }
  p {
    font-family: "Space Grotesk", system-ui, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    color: var(--texto-secundario);
    margin: 16px 0 0 0;
  }
  @media (max-width: 480px) {
    .ec2-container { padding: 48px 16px; }
  }
</style>
```
[VERIFIED: baseado nos arquivos `src/pages/index.astro`, `src/layouts/Layout.astro` e `08-UI-SPEC.md`]

### Padrão 2: Script sharp para gerar ec2-og.png

**O que é:** Script Node ESM one-shot — executa e descarta. Mesmo padrão do hub-og.png (Fase 7, Plano 01, Tarefa 4).

**Template do script:**
```javascript
// Source: 07-01-PLAN.md Task 4 — mesmo padrão, cor diferente
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

await sharp(join(__dirname, 'src/assets/claudio1.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png()
  .toFile(join(__dirname, 'public/ec2-og.png'));

console.log('ec2-og.png gerado: 1200x630');
```

**Execução:** `node gerar-ec2-og.mjs` → verificar → deletar o script.
**Verificar após execução:**
```bash
node -e "import('sharp').then(s=>s.default('public/ec2-og.png').metadata().then(m=>console.log(m.width,m.height,m.format)))"
```
Esperado: `1200 630 png` [VERIFIED: hub-og.png foi gerado com este padrão exato — confirmado via `sharp().metadata()` que retornou `{format:'png',width:1200,height:630}`]

### Padrão 3: Spec E2E (baseado em hub.spec.ts)

**Template para `tests/e2e/ec2-coming-soon.spec.ts`:**
```typescript
// Source: tests/e2e/hub.spec.ts — estrutura espelhada para EC2
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("EC2 coming-soon load", () => {
  test("GET /deep-dive-ec2/ returns HTTP 200", async ({ page }) => {
    const response = await page.goto("./deep-dive-ec2/");
    expect(response?.status()).toBe(200);
  });

  test("<h1> Deep Dive EC2 is visible", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Deep Dive EC2");
  });

  test("badge EM BREVE is visible", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    await expect(page.locator(".badge-coming-soon")).toBeVisible();
    await expect(page.locator(".badge-coming-soon")).toContainText("EM BREVE");
  });

  test("back link to hub is present and points to /", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    const backLink = page.locator("a.back-link");
    await expect(backLink).toBeVisible();
    const href = await backLink.getAttribute("href");
    expect(href).toBe("/");
  });
});

test.describe("EC2 coming-soon accessibility", () => {
  test("skip link has href='#conteudo-principal'", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toHaveAttribute("href", "#conteudo-principal");
  });

  test("no critical axe-core violations (WCAG 2.0 A/AA)", async ({ page }) => {
    await page.goto("./deep-dive-ec2/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const criticalViolations = results.violations.filter(v => v.impact === "critical");
    expect(criticalViolations).toHaveLength(0);
  });
});

test.describe("EC2 coming-soon responsive", () => {
  test("mobile 375x812: h1 visible, no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("./deep-dive-ec2/");
    await expect(page.locator("h1")).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
  });
});
```
[VERIFIED: estrutura diretamente derivada de `tests/e2e/hub.spec.ts`]

### Padrão 4: Teste SEO 16 (baseado no teste 15)

**Onde adicionar:** ao final de `tests/seo/seo-meta.test.ts`, depois do teste 15.

**Ponto crítico:** O arquivo usa `DIST_INDEX` e `html` como variáveis de módulo apontando para `dist/deep-dive-vm/index.html`. O teste 16 NÃO pode reutilizar essas variáveis — deve declarar seu próprio path.

```typescript
// Source: tests/seo/seo-meta.test.ts teste 15 — padrão espelhado para EC2
it("16. dist/deep-dive-ec2/index.html og:image points to ec2-og.png", () => {
  const ec2IndexPath = join(DIST_DIR, "deep-dive-ec2/index.html");
  expect(
    existsSync(ec2IndexPath),
    `dist/deep-dive-ec2/index.html not found at ${ec2IndexPath}`
  ).toBe(true);
  const ec2Html = readFileSync(ec2IndexPath, "utf-8");
  const ogImage = extractMetaContent(ec2Html, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("ec2-og.png");
});
```
[VERIFIED: baseado no código real do arquivo `tests/seo/seo-meta.test.ts`, especialmente testes 14 e 15]

### Anti-Patterns a Evitar

- **Adicionar filtro no sitemap:** `astro.config.mjs` já sem filtros após Fase 7 — NÃO adicionar `filter()`. EC2 aparece automaticamente.
- **Referenciar `DIST_INDEX` no teste 16:** A variável aponta para `dist/deep-dive-vm/index.html`. Declara variável local no teste 16.
- **Criar ec2-og.png sem verificar dimensões:** Sharp produz o arquivo mas não garante dimensões sem verificação. Sempre rodar `sharp().metadata()` antes de commitar.
- **Adicionar ogImage ao `src/data/courses.ts`:** O design não usa o campo de dados para ogImage na página EC2. A página lê diretamente o caminho hardcoded.
- **Adicionar EC2 à lista de URLs do LHCI:** Os arquivos `.lhcirc.json` e `.lighthouserc.json` auditam `/deep-dive-vm/` explicitamente. Adicionar `/deep-dive-ec2/` ao LHCI não é requisito desta fase.

---

## Don't Hand-Roll

| Problema | Não construir | Usar em vez | Por quê |
|----------|---------------|-------------|---------|
| Sitemap com nova rota | filtros manuais ou geração própria | `@astrojs/sitemap` (já configurado) | Descobre rotas automaticamente via file-based routing |
| OG image placeholder | canvas, Puppeteer, SVG manual | `sharp` (já em `dependencies`) | Uma linha — `.resize(1200, 630).png().toFile()` |
| Meta tags OG | `<meta>` tags manuais no `<head>` | `Layout.astro` com `ogImage` prop | O Layout já emite todo o bloco OG via `astro-seo` |
| Testes de acessibilidade | assertions manuais de ARIA | `@axe-core/playwright` (já em `devDependencies`) | Detecta violações críticas WCAG de forma sistemática |

---

## Pesquisa de Domínio: Respostas às Perguntas Focadas

### Q1: Como astro.config.mjs trata novas rotas no sitemap?

**Resposta:** Automático, sem configuração adicional. [VERIFIED: `astro.config.mjs`]

```javascript
// astro.config.mjs atual — sem filter(), sem exclude
export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  outDir: 'dist',
  integrations: [sitemap()],
});
```

`@astrojs/sitemap` rastreia todo o output de `dist/` durante o build. Qualquer rota nova criada por file-based routing (`src/pages/deep-dive-ec2/index.astro`) aparece automaticamente em `dist/sitemap-0.xml` como `https://mentoria.sertaoseracloud.com/deep-dive-ec2/`. Nenhuma modificação necessária em `astro.config.mjs`.

**Verificação pós-build:** O teste 14 existente (`sitemap-0.xml contains root / and /deep-dive-vm/`) não verifica EC2. O HOWTO deve mencionar que o executor pode verificar manualmente com:
```bash
grep "deep-dive-ec2" dist/sitemap-0.xml
```

### Q2: Qual é o padrão exato do script sharp para hub-og.png?

**Resposta:** Documentado em `07-01-PLAN.md` Task 4 e confirmado via `sharp().metadata()`. [VERIFIED: execução de `node -e "import('sharp').then(...)"` retornou `{format:'png',width:1200,height:630}`]

O padrão é:
1. Importar `sharp` via ESM
2. Carregar `src/assets/claudio1.png` como imagem base
3. `.resize(1200, 630, { fit: 'cover', position: 'top' })`
4. `.png()`
5. `.toFile('public/ec2-og.png')`
6. Verificar dimensões via `.metadata()`
7. Commitar apenas `public/ec2-og.png` (não commitar o script)

Para EC2 o processo é idêntico — apenas o arquivo de saída muda para `public/ec2-og.png`.

### Q3: Estrutura exata de hub.spec.ts para ec2-coming-soon.spec.ts seguir

**Resposta:** [VERIFIED: `tests/e2e/hub.spec.ts` lido integralmente]

`hub.spec.ts` possui 3 `describe` blocks:
1. `"Hub load"` — 10 testes: HTTP 200, h1 visível, 4 social links com aria-label, 2 course-cards, active/coming-soon structure, mentor photo, bio text, course link href, rel noopener
2. `"Hub accessibility"` — 2 testes: skip link wiring, axe-core WCAG 2.0 A/AA
3. `"Hub responsive"` — 1 teste: mobile 375x812 sem overflow horizontal

Para EC2, a estrutura é mais simples — 3 describe blocks:
1. `"EC2 coming-soon load"` — 4 testes: HTTP 200, h1 visível com texto correto, badge "EM BREVE" visível, back-link presente e aponta para `/`
2. `"EC2 coming-soon accessibility"` — 2 testes: skip link wiring, axe-core
3. `"EC2 coming-soon responsive"` — 1 teste: mobile sem overflow

Total: 7 testes × 4 projetos Playwright (chromium, firefox, webkit, mobile) = **28 testes E2E novos**.

### Q4: Quais testes precisam ser atualizados vs. criados?

**Resposta:** [VERIFIED: leitura completa de `tests/seo/seo-meta.test.ts` e `tests/unit/components/Layout.test.ts`]

| Arquivo | Ação | Detalhe |
|---------|------|---------|
| `tests/e2e/ec2-coming-soon.spec.ts` | **CRIAR** | Novo spec, 7 testes, segue padrão hub.spec.ts |
| `tests/seo/seo-meta.test.ts` | **MODIFICAR** | Adicionar teste 16 ao final (após teste 15) |
| `tests/unit/components/Layout.test.ts` | **NÃO modificar** | Testa LP og:image (claudio1) e hub og:image (hub-og.png) — EC2 não adiciona nova prop; sem regressão esperada |
| `tests/seo/seo-meta.test.ts` `DIST_INDEX` | **Não reutilizar** | Aponta para `dist/deep-dive-vm/index.html`; teste 16 declara seu próprio path |

**Sobre `DIST_DIR`:** Já está declarado como `const DIST_DIR = join(__dirname, "../../dist")` no arquivo. O teste 16 usa `join(DIST_DIR, "deep-dive-ec2/index.html")` — sem nova importação necessária.

### Q5: Passos canônicos do HOWTO

**Resposta:** Derivados da estrutura real do codebase. [VERIFIED: todos os arquivos lidos]

```
HOWTO-new-landing-page.md — 7 passos:

1. Criar src/pages/[slug]/index.astro
   - Copiar de src/pages/deep-dive-ec2/index.astro
   - Substituir slug, título, descrição, url, ogImage path

2. Adicionar entry em src/data/courses.ts
   - Adicionar objeto { title, description, url, status: 'coming-soon' }
   - Hub atualiza automaticamente (renderiza o array)

3. Criar public/[slug]-og.png (placeholder 1200×630)
   - Executar o script sharp (snippet no HOWTO)
   - Verificar dimensões com sharp().metadata()
   - Deletar o script — commitar apenas o PNG

4. Criar tests/e2e/[slug]-coming-soon.spec.ts
   - Copiar de tests/e2e/ec2-coming-soon.spec.ts
   - Substituir "EC2" pelo nome do novo curso, ./deep-dive-ec2/ pela nova rota

5. Adicionar teste SEO em tests/seo/seo-meta.test.ts
   - Copiar padrão do teste 16 (ec2-og.png)
   - Substituir paths e string de verificação

6. Validar localmente
   - npm run build
   - npx playwright test tests/e2e/[slug]-coming-soon.spec.ts
   - npx vitest run tests/seo/seo-meta.test.ts

7. Deploy checklist
   - push para main
   - aguardar GitHub Actions (test suite + lighthouse)
   - verificar CNAME em dist/ (deve conter mentoria.sertaoseracloud.com)
   - confirmar rota ativa via curl ou browser
```

### Q6: CI/LHCI — algum arquivo precisa referenciar a nova rota?

**Resposta:** **Não.** [VERIFIED: `.lhcirc.json`, `.lighthouserc.json`, `.github/workflows/test.yml`, `.github/workflows/lighthouse-weekly.yml`]

- `.lhcirc.json` e `.lighthouserc.json` auditam `http://localhost/deep-dive-vm/` explicitamente — não escaneiam todas as rotas
- A EC2 é uma página "em breve" sem conteúdo extenso — não é candidata a auditoria de performance LHCI nesta fase
- O CI (`test.yml`) roda `npx playwright test --project=chromium` que descobre automaticamente todos os specs em `tests/e2e/` — o novo `ec2-coming-soon.spec.ts` será incluído automaticamente
- `npm run test:all` (Vitest) descobre todos os arquivos de teste automaticamente — `seo-meta.test.ts` modificado será incluído

**Conclusão:** Nenhum arquivo de CI/LHCI precisa ser modificado.

### Q7: Arquitetura de Validação — comandos para verificar cada requisito SCAFF

**Respostas verificadas:**

| Requisito | Comportamento | Comando de Verificação |
|-----------|---------------|----------------------|
| SCAFF-01: rota existe | `dist/deep-dive-ec2/index.html` existe após build | `npm run build && test -f dist/deep-dive-ec2/index.html` |
| SCAFF-01: HTTP 200 | Playwright confirma status | `npx playwright test tests/e2e/ec2-coming-soon.spec.ts --project=chromium` |
| SCAFF-01: h1 visível | Playwright localiza `<h1>` | (incluso no spec acima) |
| SCAFF-01: badge EM BREVE | Playwright localiza `.badge-coming-soon` | (incluso no spec acima) |
| SCAFF-01: back-link ao hub | Playwright verifica `href="/"` | (incluso no spec acima) |
| SCAFF-01: indexada (sem noindex) | Build HTML não contém `noindex` | `grep -L noindex dist/deep-dive-ec2/index.html` |
| SCAFF-01: og:image ec2-og.png | Vitest lê HTML construído | `npx vitest run tests/seo/seo-meta.test.ts` |
| SCAFF-01: sitemap contém EC2 | `dist/sitemap-0.xml` contém URL | `grep "deep-dive-ec2" dist/sitemap-0.xml` |
| SCAFF-02: HOWTO existe | Arquivo na raiz | `test -f HOWTO-new-landing-page.md` |
| SCAFF-02: HOWTO cobre 7 passos | Revisão manual | checklist no arquivo |

---

## Common Pitfalls

### Pitfall 1: Teste 16 reutilizando variável `html` ou `DIST_INDEX`

**O que acontece:** `html` e `DIST_INDEX` no topo de `seo-meta.test.ts` apontam para `dist/deep-dive-vm/index.html`. Reutilizá-los no teste 16 verificaria a LP, não a EC2, mas o teste passaria — falso positivo silencioso.

**Por que acontece:** O padrão do `beforeAll` carrega uma única variável de HTML global para todos os testes do `describe`.

**Como evitar:** Declarar path e leitura do HTML de EC2 inline dentro do `it()` do teste 16 (mesmo padrão dos testes 14 e 15 que declaram seus próprios paths).

**Sinal de alerta:** Teste 16 passa mesmo sem `public/ec2-og.png` existir.

### Pitfall 2: Build falha se public/ec2-og.png não existir

**O que acontece:** `Layout.astro` constrói a URL do og:image concatenando `siteOrigin + ogImage`. Se o arquivo PNG não existir em `public/`, o build do Astro termina com sucesso mas o CI do Lighthouse falha na requisição HTTP.

**Por que acontece:** Astro não valida existência de arquivos em `public/` durante build — apenas os copia.

**Como evitar:** Gerar `public/ec2-og.png` **antes** de rodar `npm run build` pela primeira vez. A Task de geração do PNG deve preceder a Task de criação da página no plano.

**Sinal de alerta:** `dist/deep-dive-ec2/index.html` referencia `ec2-og.png` mas `dist/ec2-og.png` não existe.

### Pitfall 3: ogImage prop sem barra inicial

**O que acontece:** Layout.astro constrói `ogImageUrl` como `${siteOrigin}${ogImage}`. Se `ogImage` for `"ec2-og.png"` (sem barra), a URL resulta em `https://mentoria.sertaoseracloud.comec2-og.png` — URL inválida.

**Por que acontece:** Concatenação simples de strings sem validação de path.

**Como evitar:** Sempre passar `ogImage="/ec2-og.png"` (com barra inicial). Verificar no `dist/deep-dive-ec2/index.html` que og:image contém `https://mentoria.sertaoseracloud.com/ec2-og.png`.

### Pitfall 4: Playwright não encontra ec2-coming-soon.spec.ts no CI

**O que acontece:** O CI corre `npx playwright test --project=chromium` sem especificar arquivo — descobre todos os specs em `tests/e2e/`. Se o spec novo falhar, ele bloqueia o job `e2e-chromium`.

**Por que acontece:** Auto-descoberta por glob `tests/e2e/**/*.spec.ts`.

**Como evitar:** Testar o spec localmente com `npx playwright test tests/e2e/ec2-coming-soon.spec.ts` antes de commitar. Garantir que o servidor de preview está rodando (ou o `webServer` do playwright.config.ts sobe automaticamente).

---

## Code Examples

### Layout.astro — Props Interface Atual (referência)

```typescript
// Source: src/layouts/Layout.astro (verificado)
interface Props {
  title: string;
  description?: string;
  url?: string;
  offersUrl?: string;
  ogImage?: string;    // path com barra inicial, ex: "/ec2-og.png"
  noindex?: boolean;   // default false
  jsonLd?: Record<string, unknown>;
}
```
[VERIFIED: `src/layouts/Layout.astro` linhas 5-13]

### courses.ts — Entry EC2 existente

```typescript
// Source: src/data/courses.ts (verificado — NÃO modificar)
{
  title: 'Deep Dive EC2',
  description: 'Formação técnica focada em AWS EC2 — em preparação.',
  url: '/deep-dive-ec2/',
  status: 'coming-soon',
}
```
[VERIFIED: `src/data/courses.ts` linhas 17-22]

### seo-meta.test.ts — Helpers disponíveis (sem importação adicional)

```typescript
// Source: tests/seo/seo-meta.test.ts (verificado)
// DIST_DIR já declarado: join(__dirname, "../../dist")
// existsSync, readFileSync já importados
// extractMetaContent() já declarada como função de módulo
// Uso no teste 16:
const ec2IndexPath = join(DIST_DIR, "deep-dive-ec2/index.html");
const ec2Html = readFileSync(ec2IndexPath, "utf-8");
const ogImage = extractMetaContent(ec2Html, "og:image");
```
[VERIFIED: `tests/seo/seo-meta.test.ts` linhas 17-20 e 37-55]

---

## State of the Art

| Abordagem antiga | Abordagem atual | Quando mudou | Impacto |
|-----------------|-----------------|--------------|---------|
| `base` property no astro.config.mjs | sem `base` — site servido da raiz | Fase 6 (MIGR-01) | Rotas como `/deep-dive-ec2/` funcionam diretamente |
| `noindex` via `<meta slot="head">` | prop `noindex` no Layout.astro | Fase 7 (Plano 01) | Controle de indexação por prop — sem slot |
| ogImage hardcoded para claudio1 | prop `ogImage?: string` no Layout | Fase 7 (Plano 01) | Cada página pode ter sua própria OG image |
| sitemap filtrava `/` | sem filtro | Fase 7 | Hub e EC2 indexados automaticamente |

---

## Assumptions Log

> Nenhuma claim [ASSUMED] neste research. Todos os fatos foram verificados via leitura direta dos arquivos do codebase.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | — | — | — |

**Tabela vazia:** Todos os fatos foram verificados nos arquivos fonte. Nenhuma confirmação do usuário necessária antes da execução.

---

## Open Questions

1. **Texto expandido da descrição EC2**
   - O que sabemos: `courses.ts` tem `"Formação técnica focada em AWS EC2 — em preparação."` (descrição curta). A `08-UI-SPEC.md` define o texto expandido: `"Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática. Em breve na plataforma."`
   - O que está claro: a `08-UI-SPEC.md` é o contrato definitivo — usar o texto da UI-SPEC para `description` e `<p>` na página EC2. Sem necessidade de confirmação adicional.
   - Recomendação: usar o texto da `08-UI-SPEC.md` conforme documentado na seção Copywriting Contract.

2. **Adicionar sitemap-0.xml ao teste 14 ou criar teste separado?**
   - O que sabemos: o teste 14 existente verifica que `sitemap-0.xml` contém `/` e `/deep-dive-vm/`. EC2 não é verificada nele.
   - Opções: (a) adicionar asserção de EC2 ao teste 14, (b) não adicionar (EC2 está no sitemap mas sem cobertura automatizada de teste).
   - Recomendação: adicionar asserção de EC2 ao teste 14 existente (`expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/deep-dive-ec2/")`) — é uma linha a mais no teste 14, menos disruptivo que criar teste 17. Esta questão está na **discrição do Claude**.

---

## Environment Availability

| Dependência | Necessária para | Disponível | Versão | Fallback |
|-------------|----------------|------------|--------|---------|
| Node.js | Script sharp | ✓ | >=22.12.0 (engines) | — |
| sharp | Gerar ec2-og.png | ✓ | ^0.34.5 | — |
| @playwright/test | E2E tests | ✓ | ^1.59.1 | — |
| Playwright browsers (chromium) | CI e2e-chromium | ✓ | instalado (07-03) | — |
| vitest | Testes SEO | ✓ | ^3.2.4 | — |

**Dependências ausentes sem fallback:** nenhuma.

**Nota browsers:** Na Fase 7 Plan 03, o executor precisou rodar `npx playwright install` para instalar Firefox/WebKit/mobile. O ambiente pode precisar de reinstalação se executado em máquina diferente.

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework unit/SEO | Vitest ^3.2.4 |
| Framework E2E | Playwright ^1.59.1 |
| Config Vitest | `package.json` → `"test:all": "vitest run --coverage"` |
| Config Playwright | `playwright.config.ts` (baseURL: `http://localhost:4321/`, 4 projetos) |
| Build necessário antes dos testes SEO | `npm run build` |
| Comando rápido (E2E chromium only) | `npm run build && npx playwright test --project=chromium tests/e2e/ec2-coming-soon.spec.ts` |
| Comando completo (todos os testes) | `npm run build && npm run test:all && npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando Automatizado | Arquivo Existe? |
|--------|---------------|---------------|---------------------|-----------------|
| SCAFF-01 | HTTP 200 em /deep-dive-ec2/ | E2E | `npx playwright test tests/e2e/ec2-coming-soon.spec.ts --project=chromium` | ❌ Wave 0 |
| SCAFF-01 | `<h1>` "Deep Dive EC2" visível | E2E | (incluso no spec acima) | ❌ Wave 0 |
| SCAFF-01 | Badge "EM BREVE" visível | E2E | (incluso no spec acima) | ❌ Wave 0 |
| SCAFF-01 | Back-link para hub presente | E2E | (incluso no spec acima) | ❌ Wave 0 |
| SCAFF-01 | og:image contém ec2-og.png | SEO/unit | `npx vitest run tests/seo/seo-meta.test.ts` | ❌ Wave 0 (teste 16 a adicionar) |
| SCAFF-01 | Página indexada (sem noindex) | Manual/grep | `grep "noindex" dist/deep-dive-ec2/index.html` | N/A |
| SCAFF-02 | HOWTO existe na raiz | Manual | `test -f HOWTO-new-landing-page.md` | ❌ Wave 0 |

### Sampling Rate

- **Por commit de task:** `npm run build && npx playwright test tests/e2e/ec2-coming-soon.spec.ts --project=chromium`
- **Por merge de wave:** `npm run build && npm run test:all && npx playwright test`
- **Phase gate:** Suite completa verde antes de `/gsd:verify-work 8`

### Wave 0 Gaps

- [ ] `tests/e2e/ec2-coming-soon.spec.ts` — cobre SCAFF-01 (HTTP 200, h1, badge, back-link, a11y, responsivo)
- [ ] `tests/seo/seo-meta.test.ts` — adicionar teste 16 (og:image ec2-og.png)
- [ ] `public/ec2-og.png` — pré-requisito para build não gerar HTML com og:image quebrada
- [ ] `src/pages/deep-dive-ec2/index.astro` — a rota em si

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Aplica | Controle Padrão |
|---------------|--------|-----------------|
| V2 Authentication | não | Site estático sem auth |
| V3 Session Management | não | Sem sessões |
| V4 Access Control | não | Página pública "em breve" |
| V5 Input Validation | não | Zero inputs — HTML estático |
| V6 Cryptography | não | Sem dados sensíveis |

### Threat Patterns

| Pattern | STRIDE | Mitigação |
|---------|--------|-----------|
| OG image path injection | Tampering | `ogImage` é string literal hardcoded na página — sem interpolação de dados externos |
| Script sharp executado com acesso ao filesystem | Elevation of Privilege | Script é descartado após uso; não commitado; acessa apenas `src/assets/` e `public/` |

---

## Sources

### Primary (HIGH confidence)
- `src/layouts/Layout.astro` — Props interface, ogImage pattern, ogImageUrl computation
- `src/pages/index.astro` — Template LP-lite sem NavBar/Footer
- `tests/e2e/hub.spec.ts` — Template E2E spec com 3 describe blocks
- `tests/seo/seo-meta.test.ts` — Teste 15 como template para teste 16; DIST_DIR; helpers
- `tests/unit/components/Layout.test.ts` — Padrão hubHtml como variável local
- `astro.config.mjs` — Sitemap sem filtros
- `package.json` — Stack completo, versões exatas
- `.lhcirc.json`, `.lighthouserc.json` — URLs auditadas pelo LHCI
- `.github/workflows/test.yml` — Pipeline CI completo
- `.planning/phases/07-hub-page/07-01-PLAN.md` — Padrão exato do script sharp
- `.planning/phases/08-multi-lp-scaffold/08-CONTEXT.md` — Decisões locked
- `.planning/phases/08-multi-lp-scaffold/08-UI-SPEC.md` — Contrato visual completo
- `src/data/courses.ts` — EC2 já declarado (verificado)
- `playwright.config.ts` — baseURL, projetos, webServer

### Secondary (MEDIUM confidence)
- `node -e "import('sharp').then(...)"` — Confirmação de que `public/hub-og.png` tem 1200×630 via `sharp().metadata()`

### Tertiary (LOW confidence)
- Nenhum.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todos os pacotes verificados em `package.json`
- Architecture patterns: HIGH — baseados em código real lido do codebase
- Pitfalls: HIGH — derivados de leitura direta dos arquivos de teste e SUMMARY da Fase 7
- HOWTO steps: HIGH — mapeados dos arquivos reais envolvidos

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stack estável, sem dependências novas)
