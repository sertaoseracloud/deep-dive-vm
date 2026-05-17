# Phase 6: Route Migration - Research

**Researched:** 2026-05-16
**Domain:** Astro file-based routing, GitHub Pages custom domain, Playwright/Vitest test path migration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Remover completamente a propriedade `base` de `astro.config.mjs` — não substituir por `'/'`. O `site` permanece `'https://mentoria.sertaoseracloud.com'`.
- **D-02:** `public/CNAME` criado com `mentoria.sertaoseracloud.com` como primeira ação — safety net antes de qualquer outra mudança.
- **D-03:** A landing page da VM migra para `src/pages/deep-dive-vm/index.astro` (file-based routing nativo do Astro — nenhuma config de rotas necessária).
- **D-04:** Todos os 10+ component tests que leem `dist/index.html` são atualizados para `dist/deep-dive-vm/index.html` — uma mudança de path por arquivo, sem abstrações adicionais.
- **D-05:** `tests/seo/seo-meta.test.ts` também atualiza para `dist/deep-dive-vm/index.html` — os assertions SEO continuam verificando a landing page da VM, não o hub.
- **D-06:** `playwright.config.ts` `baseURL` muda para `http://localhost:4321/` (raiz — aponta para o hub). `webServer.url` também muda para `http://localhost:4321/`.
- **D-07:** Testes E2E existentes (homepage, accessibility, journeys, motion-accessibility) precisam atualizar suas navegações de `./` para `./deep-dive-vm/` onde necessário, uma vez que a `baseURL` passa a ser o hub.
- **D-08:** Favicon: `Layout.astro` linha 48 muda de `"/deep-dive-vm/favicon.svg"` para `"/favicon.ico"`. `public/favicon.ico` já existe e é copiado para `dist/` automaticamente.
- **D-09:** `offersUrl`: tornar prop opcional em `Layout.astro`. Hub passa `undefined` → JSON-LD de produto não renderiza. VM page passa `https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento` explicitamente.
- **D-10:** Criar `src/pages/index.astro` com conteúdo placeholder mínimo: título `Mentoria Sertão Será Cloud`, description, e `<meta name="robots" content="noindex">`. Usar o `Layout.astro` existente com props básicas.
- **D-11:** O placeholder deve ter SEO mínimo suficiente para o LHCI não falhar o gate de score. `<meta name="description">` e `<title>` são obrigatórios.
- **D-12:** Sequência obrigatória dentro da Fase 6:
  1. Criar `public/CNAME`
  2. Corrigir todos os paths hardcoded em `src/` (favicon, offersUrl)
  3. Remover `base` de `astro.config.mjs` + mover LP para `src/pages/deep-dive-vm/`
  4. Criar hub placeholder `src/pages/index.astro`
  5. Atualizar configs de teste (playwright.config.ts, 10+ Vitest files, seo-meta.test.ts)
  6. Validar CI (build + testes + LHCI)

### Claude's Discretion

- Nenhuma área de discrição identificada — todas as decisões estão travadas.

### Deferred Ideas (OUT OF SCOPE)

- Design definitivo do hub (foto, bio, cards de cursos, links sociais) → Fase 7
- Testes E2E do hub page → Fase 7
- SEO meta tags completos do hub com og:image → Fase 7
- Plausible analytics (cookieless) → pós-v1.3
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MIGR-01 | `astro.config.mjs` não possui a propriedade `base` — site servido da raiz com domínio personalizado | Remoção de `base` confirmada nos docs Astro: `import.meta.env.BASE_URL` passa a ser `/`; `site` permanece inalterado |
| MIGR-02 | Landing page Deep Dive VM acessível em `/deep-dive-vm/` via `src/pages/deep-dive-vm/index.astro` | File-based routing nativo do Astro: `src/pages/[slug]/index.astro` → `dist/[slug]/index.html` automaticamente, zero config |
| MIGR-03 | `public/CNAME` contém `mentoria.sertaoseracloud.com` — presente em cada build | Padrão oficial GitHub Pages + Astro: arquivos `public/` são copiados para `dist/` raiz automaticamente |
| MIGR-04 | Paths hardcoded `/deep-dive-vm/` em `src/` corrigidos + testes de CI atualizados | Dois paths em `Layout.astro` (linha 16 e 48) confirmados via grep; 11 arquivos de teste Vitest + playwright.config.ts identificados |
</phase_requirements>

---

## Summary

Esta fase é uma migração cirúrgica de configuração de roteamento Astro: remover a propriedade `base: '/deep-dive-vm/'` do config e substituí-la por file-based routing nativo (`src/pages/deep-dive-vm/index.astro`). O resultado é idêntico para o usuário final — a landing page continua em `/deep-dive-vm/` — mas o mecanismo muda de "prefixo de URL global" para "estrutura de diretório nativa".

O risco principal não é técnico, é de ordem de execução. Existem dependências em cascata entre o config do Astro, os paths de output do build, e as referências nos testes. Se `base` for removido antes de mover os arquivos de teste, o build passa mas os testes falham. Se `playwright.config.ts` for atualizado antes de mover os E2E, os testes apontam para uma página que ainda não existe no novo caminho.

Um segundo risco real é o LHCI: com `staticDistDir: ./dist`, o Lighthouse CI descobre e audita TODOS os `index.html` presentes no dist, incluindo o novo `dist/index.html` (hub placeholder). O hub placeholder terá `<meta name="robots" content="noindex">` por decisão de design (D-10) — e o Lighthouse **penaliza SEO por noindex** na mesma proporção de qualquer outro audit SEO. Isso pode derrubar o score SEO do hub abaixo do gate de 90% (`error`). A solução é ou (a) usar `autodiscoverUrlBlocklist` no `.lhcirc.json` para excluir `/` do audit, ou (b) remover o `noindex` do hub placeholder.

**Primary recommendation:** Adicionar `autodiscoverUrlBlocklist: ["http://localhost:XXXX/"]` ao `.lhcirc.json` para excluir o hub placeholder do LHCI — isso garante que o gate de SEO 90% continua válido apenas para a landing page da VM (conteúdo real), sem remover o `noindex` do placeholder.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| File-based routing (LP em /deep-dive-vm/) | Frontend Server (Astro build) | — | `src/pages/` → `dist/` é processamento build-time; zero runtime config |
| Custom domain preservation (CNAME) | CDN / Static (GitHub Pages) | — | `public/CNAME` copiado para `dist/CNAME`; GitHub Pages lê no deploy |
| Path hardcoded fix (favicon, offersUrl) | Frontend Server (Astro SSG) | — | Mudanças em `Layout.astro` aplicadas em build-time para todos os consumers |
| Atualização de paths de teste Vitest | Toolchain (test suite) | — | 11 arquivos lendo `dist/index.html` → `dist/deep-dive-vm/index.html` |
| baseURL do Playwright | Toolchain (E2E config) | — | `playwright.config.ts` é config de ferramenta, não código de produção |
| Hub placeholder SEO (noindex vs LHCI gate) | CDN / Static + Toolchain | — | Tensão entre SEO intencionalmente vazio e gate de CI — resolvida via LHCI blocklist |

---

## Standard Stack

Esta fase não instala pacotes novos. Usa exclusivamente o stack já instalado.

### Core (já presente no projeto)

| Library | Version atual | Purpose | Status nesta fase |
|---------|--------------|---------|-------------------|
| astro | ^6.3.1 | SSG framework, file-based routing | Config change only |
| @astrojs/sitemap | ^3.7.2 | Geração de sitemap | Comportamento muda automaticamente com novo routing |
| astro-seo | ^1.1.0 | Meta tags SEO no Layout | Usado no hub placeholder |
| @playwright/test | ^1.59.1 | E2E tests | Config change + navigation path updates |
| vitest | ^3.2.4 | Unit/integration tests | Path updates only |
| @lhci/cli | ^0.14.0 | Lighthouse CI | Possível adição de autodiscoverUrlBlocklist |

### Sem Novas Dependências

O REQUIREMENTS.md é explícito: "Sem novas dependências de runtime — usar apenas o que já existe no projeto." [CITED: .planning/REQUIREMENTS.md]

---

## Package Legitimacy Audit

> Esta fase não instala novos pacotes externos. Auditoria não aplicável.

Todos os pacotes envolvidos já estão instalados e passaram por auditorias anteriores (Phases 1-5).

---

## Architecture Patterns

### Sistema de Routing Astro File-Based

```
src/pages/
├── index.astro           → dist/index.html         (hub placeholder)
└── deep-dive-vm/
    └── index.astro       → dist/deep-dive-vm/index.html  (landing page VM)
```

Sem config adicional. O Astro mapeia automaticamente:
- `src/pages/index.astro` → `GET /`
- `src/pages/deep-dive-vm/index.astro` → `GET /deep-dive-vm/`

[CITED: https://docs.astro.build/en/guides/routing/]

### Mecanismo CNAME / GitHub Pages

```
public/CNAME           → dist/CNAME (copiado pelo build)
dist/CNAME             → lido pelo GitHub Pages no deploy
GitHub Pages           → serve mentoria.sertaoseracloud.com → repositório
```

Arquivos em `public/` são copiados verbatim para `dist/` por todos os builds do Astro — nenhum passo adicional de CI necessário. [CITED: https://docs.astro.build/en/guides/deploy/github/]

### Impacto da Remoção de `base`

Antes (com `base: '/deep-dive-vm/'`):
- `import.meta.env.BASE_URL` = `/deep-dive-vm/`
- `dist/index.html` contém a landing page
- Playwright `baseURL` = `http://localhost:4321/deep-dive-vm/`

Depois (sem `base`):
- `import.meta.env.BASE_URL` = `/` (com trailingSlash default `ignore` → comportamento é `/`) [CITED: https://docs.astro.build/en/reference/configuration-reference/]
- `dist/index.html` contém o hub placeholder
- `dist/deep-dive-vm/index.html` contém a landing page
- Playwright `baseURL` = `http://localhost:4321/`

**Grep confirmou:** `import.meta.env.BASE_URL` NÃO é usado em nenhum arquivo `src/` [VERIFIED: grep no codebase] — apenas as duas referências hardcoded em `Layout.astro` (linhas 16 e 48) precisam ser corrigidas.

### Mapeamento de Mudanças por Arquivo

```
astro.config.mjs
  ANTES: base: '/deep-dive-vm/'
  DEPOIS: (linha removida)

src/layouts/Layout.astro linha 16
  ANTES: const offersUrl = `${siteOrigin}/deep-dive-vm#investimento`;
  DEPOIS: const offersUrl = offersUrlProp;  (prop opcional)

src/layouts/Layout.astro interface Props linha 5-9
  ANTES: { title, description?, url? }
  DEPOIS: { title, description?, url?, offersUrl? }

src/layouts/Layout.astro linha 48
  ANTES: href: "/deep-dive-vm/favicon.svg"
  DEPOIS: href: "/favicon.ico"

src/pages/index.astro (EXISTENTE → VIRA hub placeholder)
  Atual: landing page completa da VM
  Novo:  placeholder com Layout, title, description, noindex

src/pages/deep-dive-vm/index.astro (CRIAR)
  Conteúdo: todo o conteúdo atual de src/pages/index.astro
  (mover, não copiar — com offersUrl prop explícita)

public/CNAME (CRIAR)
  Conteúdo: mentoria.sertaoseracloud.com

playwright.config.ts
  baseURL: http://localhost:4321/deep-dive-vm/ → http://localhost:4321/
  webServer.url: idem

tests/unit/components/*.test.ts (10 arquivos)
tests/seo/seo-meta.test.ts
  dist/index.html → dist/deep-dive-vm/index.html

tests/e2e/*.spec.ts (4 arquivos)
  page.goto("./") → page.goto("./deep-dive-vm/")
  (onde estão navegando para a landing page da VM)
```

### Padrão Hub Placeholder

```astro
---
import Layout from "../layouts/Layout.astro";
---
<Layout
  title="Mentoria Sertão Será Cloud"
  description="Formações técnicas de Azure para engenheiros."
>
  <meta slot="head" name="robots" content="noindex" />
  <!-- conteúdo mínimo — design definitivo na Fase 7 -->
  <main>
    <h1>Mentoria Sertão Será Cloud</h1>
  </main>
</Layout>
```

**Atenção:** `Layout.astro` usa `<SEO>` da biblioteca `astro-seo` — verificar se `noindex` pode ser passado como prop ou se precisa ser injetado de outra forma. [ASSUMED — verificar API de astro-seo para noindex]

### LHCI e o Problema do Hub Placeholder

Com `staticDistDir: ./dist` e `staticDirFileDiscoveryDepth` padrão (2), o LHCI descobre automaticamente:
- `dist/index.html` → audita `/` (hub placeholder)
- `dist/deep-dive-vm/index.html` → audita `/deep-dive-vm/` (landing page VM)

O hub placeholder tem `noindex` → Lighthouse reduz score SEO [CITED: https://developer.chrome.com/docs/lighthouse/seo/is-crawlable].

**Solução recomendada — adicionar ao `.lhcirc.json`:**

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "autodiscoverUrlBlocklist": ["http://localhost:XXXX/"]
    }
  }
}
```

**Nota:** A porta exata usada pelo servidor LHCI quando `staticDistDir` é configurado varia (geralmente `9001` ou porta aleatória). Alternativa mais robusta: especificar apenas a URL da landing page:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "url": ["http://localhost:XXXX/deep-dive-vm/"]
    }
  }
}
```

**Estratégia mais simples:** Usar `url` explícita em vez de autodiscovery — especifica exatamente qual página auditar, sem risco de descobrir o placeholder. [CITED: https://googlechrome.github.io/lighthouse-ci/docs/configuration.html]

### Anti-Patterns a Evitar

- **Não substituir `base: '/deep-dive-vm/'` por `base: '/'`** — Astro com `base: '/'` se comporta diferente de sem `base`. A decisão D-01 é remover completamente.
- **Não atualizar playwright.config.ts antes de mover os arquivos E2E** — o servidor web precisará da página nova no caminho novo.
- **Não deixar `dist/index.html` como conteúdo da LP** — após remover `base`, `astro build` gera a landing page em `dist/deep-dive-vm/index.html` apenas se o arquivo page estiver no lugar correto.
- **Não esquecer de passar `offersUrl` explicitamente na VM page** — se o prop virar opcional e a VM page não passar, o JSON-LD de Schema.org ficará sem `offers.url`.
- **Não testar com `npm run dev` para validar paths** — o dev server do Astro pode se comportar diferente do preview/build em relação a redirects. Usar `npm run build && npm run preview`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subdirectory routing | Middleware customizado | `src/pages/deep-dive-vm/index.astro` | File-based routing do Astro: zero config, zero risco |
| Custom domain no GitHub Pages | Deploy script customizado | `public/CNAME` | Padrão oficial; arquivo copiado automaticamente para `dist/` |
| noindex no Layout.astro | String hardcoded condicional | Prop `robots?: string` ou slot de head | Extensibilidade para Fase 7 sem reescrever o Layout |
| LHCI multi-page audit | Script de filtragem customizado | `autodiscoverUrlBlocklist` ou `url` explícito no `.lhcirc.json` | Configuração nativa do LHCI — documentada e testada |

---

## Common Pitfalls

### Pitfall 1: Ordem de Execução Quebra o CI

**What goes wrong:** Remover `base` antes de mover `src/pages/index.astro` resulta em `dist/index.html` com o hub placeholder vazio enquanto os testes ainda apontam para `dist/index.html` esperando a landing page.

**Why it happens:** Os 10+ testes Vitest leem `dist/index.html` com `readFileSync`. Se o arquivo existir mas for o placeholder, todos os assertions da landing page falham (sem `<h1>` da VM, sem JSON-LD de Course, etc.).

**How to avoid:** Seguir rigorosamente a ordem D-12:
1. CNAME primeiro (sem risco)
2. Corrigir paths em `src/` (não afeta testes — testes leem `dist/`)
3. Remover `base` + mover page + criar deep-dive-vm/index.astro
4. Criar placeholder index.astro
5. Atualizar TODOS os testes
6. Rodar `npm run build` + `npm run test:all` + Playwright

**Warning signs:** `dist/index.html` existe mas não contém `Deep Dive Azure VM` no title — indica que o placeholder foi gerado antes dos testes serem atualizados.

### Pitfall 2: LHCI Penaliza SEO do Hub Placeholder

**What goes wrong:** O LHCI com `staticDistDir: ./dist` descobre e audita `dist/index.html` (hub com noindex). O score SEO do hub falha o gate `error: minScore 0.9`.

**Why it happens:** O Lighthouse flagra `<meta name="robots" content="noindex">` como "Page is blocked from indexing" — reduz o score SEO proporcionalmente. Com o gate atual de 90% como `error`, uma página com noindex provavelmente ficará abaixo do threshold.

**How to avoid:** Configurar LHCI para auditar apenas `/deep-dive-vm/`:

```json
// .lhcirc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "autodiscoverUrlBlocklist": ["<URL_DO_HUB>"]
    }
  }
}
```

Ou preferível: especificar `url` explícita removendo autodiscovery.

**Warning signs:** CI falha no step `Lighthouse CI (SEO >= 90)` com mensagem sobre indexação bloqueada.

### Pitfall 3: offersUrl Virar undefined na VM Page

**What goes wrong:** `offersUrl` torna-se prop opcional em `Layout.astro` (D-09). Se a VM page (`src/pages/deep-dive-vm/index.astro`) não passar `offersUrl`, o JSON-LD de Course fica sem `offers.url`.

**Why it happens:** Ao mover `src/pages/index.astro` para `src/pages/deep-dive-vm/index.astro`, é fácil esquecer de adicionar `offersUrl` explícito no componente `<Layout>`.

**How to avoid:** Ao criar `src/pages/deep-dive-vm/index.astro`, garantir que o `<Layout>` inclui:
```astro
<Layout
  title="..."
  offersUrl="https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento"
>
```

**Warning signs:** `tests/seo/seo-meta.test.ts` teste 11 falha — "JSON-LD is not valid JSON" ou JSON-LD sem `offers.url`.

### Pitfall 4: Playwright E2E Navegando para Hub em Vez da LP

**What goes wrong:** Após mudar `baseURL` para `http://localhost:4321/`, todos os `page.goto("./")` nos testes E2E navegam para o hub placeholder (que não tem `<nav>`, `<footer>`, `#investimento`, etc.).

**Why it happens:** Os testes dependem da `baseURL` do `playwright.config.ts`. Mudar baseURL para a raiz sem atualizar as navegações faz os testes apontarem para o hub.

**How to avoid:** Para cada `page.goto("./")` nos arquivos E2E que testam a landing page da VM, mudar para `page.goto("./deep-dive-vm/")`. Arquivos afetados:
- `tests/e2e/homepage.spec.ts` — todos os `goto("./")` → `goto("./deep-dive-vm/")`
- `tests/e2e/accessibility.spec.ts` — todos os `goto("./")` → `goto("./deep-dive-vm/")`
- `tests/e2e/journeys.spec.ts` — todos os `goto("./")` → `goto("./deep-dive-vm/")`
- `tests/e2e/motion-accessibility.spec.ts` — todos os `goto("./")` e `goto("./#investimento")` → `goto("./deep-dive-vm/")` e `goto("./deep-dive-vm/#investimento")`

**Warning signs:** Playwright falha com "Element not found: #top" ou "nav is not visible" — indicando que está na página errada.

### Pitfall 5: Sitemap Inclui Hub Placeholder Sem noindex Canonical

**What goes wrong:** `@astrojs/sitemap` gera `sitemap-0.xml` incluindo a URL raiz `https://mentoria.sertaoseracloud.com/`. Um hub com noindex na sitemap é tecnicamente inconsistente (diz para não indexar, mas está no sitemap).

**Why it happens:** O sitemap é gerado automaticamente para todas as pages do Astro. O `noindex` é apenas meta tag de HTML — não afeta a geração do sitemap.

**How to avoid:** Para a Fase 6, isso é aceitável — o hub placeholder é temporário. Na Fase 7, quando o hub tiver conteúdo definitivo, remover o noindex. Alternativamente, usar `filter` na config do sitemap para excluir a raiz. [ASSUMED — verificar se @astrojs/sitemap suporta filter na versão atual]

---

## Code Examples

### 1. astro.config.mjs após remoção de base

```javascript
// Source: astro.config.mjs atual + D-01
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  // base: '/deep-dive-vm/',  ← REMOVIDO
  outDir: 'dist',
  integrations: [sitemap()],
});
```

### 2. Layout.astro — offersUrl como prop opcional

```astro
---
// Source: Layout.astro atual + D-09
import { SEO } from "astro-seo";
import claudio1 from "../assets/claudio1.png";

interface Props {
  title: string;
  description?: string;
  url?: string;
  offersUrl?: string;  // ← ADICIONADO (opcional)
}

const { title, description, url, offersUrl } = Astro.props;

const siteOrigin = "https://mentoria.sertaoseracloud.com";
// offersUrl agora vem da prop — não mais hardcoded
---
```

O bloco JSON-LD deve ser condicional quando `offersUrl` for undefined:
```astro
{offersUrl && (
  <script type="application/ld+json" set:html={JSON.stringify({
    // ... Course schema com offers.url: offersUrl
  })} />
)}
```

### 3. Layout.astro — favicon corrigido

```astro
// Source: Layout.astro linha 48 + D-08
// ANTES:
href: "/deep-dive-vm/favicon.svg"
// DEPOIS:
href: "/favicon.ico"
```

### 4. VM page com offersUrl explícito

```astro
---
// Source: src/pages/deep-dive-vm/index.astro (novo arquivo)
import Layout from "../../layouts/Layout.astro";
// ... outros imports iguais ao index.astro atual
---
<Layout
  title="Deep Dive Azure VM · O Sertao será Cloud"
  description="Formação de 54h para Engenheiros dominarem Azure VMs..."
  url={Astro.url.toString()}
  offersUrl="https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento"
>
  <!-- conteúdo idêntico ao index.astro atual -->
</Layout>
```

### 5. Hub placeholder index.astro

```astro
---
// Source: D-10, D-11
import Layout from "../layouts/Layout.astro";
---
<Layout
  title="Mentoria Sertão Será Cloud"
  description="Formações técnicas de Azure para engenheiros. Microsoft MVP."
>
  <meta slot="head" name="robots" content="noindex" />
  <main id="main" tabindex="-1">
    <h1>Mentoria Sertão Será Cloud</h1>
    <p>Em breve: hub de cursos.</p>
    <a href="/deep-dive-vm/">Deep Dive Azure VM →</a>
  </main>
</Layout>
```

**Nota:** Verificar se `astro-seo` permite injetar `noindex` via prop `noindex` ou se o slot de head é necessário. [ASSUMED]

### 6. playwright.config.ts após migração

```typescript
// Source: playwright.config.ts atual + D-06
export default defineConfig({
  // ...
  use: {
    baseURL: "http://localhost:4321/",  // ← mudou de /deep-dive-vm/ para /
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321/",       // ← mudou
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});
```

### 7. Atualização dos testes Vitest (padrão uniforme)

```typescript
// Source: Button.test.ts + D-04 — padrão para todos os 10+ arquivos
// ANTES:
builtHtml = readFileSync(join(PROJECT_ROOT, "dist/index.html"), "utf-8");
// DEPOIS:
builtHtml = readFileSync(join(PROJECT_ROOT, "dist/deep-dive-vm/index.html"), "utf-8");
```

Mesma mudança em:
- `tests/unit/components/Button.test.ts`
- `tests/unit/components/Faq.test.ts`
- `tests/unit/components/Footer.test.ts`
- `tests/unit/components/Hero.test.ts`
- `tests/unit/components/Layout.test.ts`
- `tests/unit/components/NavBar.test.ts`
- `tests/unit/components/Pricing.test.ts`
- `tests/unit/components/SectionHead.test.ts`
- `tests/unit/components/StickyCta.test.ts`
- `tests/unit/components/UrgencyBar.test.ts`
- `tests/seo/seo-meta.test.ts` (variável `DIST_INDEX`)

### 8. seo-meta.test.ts — variável DIST_INDEX

```typescript
// Source: tests/seo/seo-meta.test.ts + D-05
// ANTES:
const DIST_INDEX = join(__dirname, "../../dist/index.html");
const DIST_DIR = join(__dirname, "../../dist");
// DEPOIS:
const DIST_INDEX = join(__dirname, "../../dist/deep-dive-vm/index.html");
const DIST_DIR = join(__dirname, "../../dist");  // dist/ permanece (sitemap ainda em dist/)
```

### 9. .lhcirc.json — excluir hub do audit

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "autodiscoverUrlBlocklist": ["<URL_EXATA_DO_HUB>"]
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Nota sobre a porta:** Quando o LHCI usa `staticDistDir`, sobe um servidor HTTP próprio em porta aleatória. A estratégia de `autodiscoverUrlBlocklist` com URL completa pode ser frágil por causa da porta variável. Alternativa: especificar `url` explícita:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 3,
      "url": ["http://localhost/deep-dive-vm/"]
    }
  }
}
```

[CITED: https://googlechrome.github.io/lighthouse-ci/docs/configuration.html]

---

## Runtime State Inventory

> Fase de migração — inventário de estado em runtime necessário.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Nenhum — site é totalmente estático, sem banco de dados | None |
| Live service config | GitHub Pages: CNAME configurado via UI do repositório (Settings > Pages > Custom domain). Atualmente pode estar configurado como `mentoria.sertaoseracloud.com` via UI. | Verificar antes do deploy: se o CNAME UI já existe, o arquivo `public/CNAME` é suficiente para manter. Se não existir, pode ser necessário configurar via UI após o primeiro deploy com CNAME. |
| OS-registered state | GitHub Actions workflows (`.github/workflows/test.yml`, `lighthouse-weekly.yml`) — não possuem referências hardcoded a `/deep-dive-vm/` nos steps | None — workflows usam `npm run build` genérico |
| Secrets/env vars | Nenhum secret referencia `/deep-dive-vm/` | None |
| Build artifacts | `dist/` gerado pelo build atual tem `dist/index.html` como landing page. Após migração, `dist/index.html` será o hub placeholder e `dist/deep-dive-vm/index.html` será a LP. | Rodar `npm run build` fresh após as mudanças — não reutilizar dist/ antigo |

**Verificação pré-deploy:** O GitHub Pages pode ter armazenado o CNAME anterior via UI (Settings). Se o arquivo `public/CNAME` for criado ANTES de qualquer deploy problemático, o domínio personalizado sobrevive. [CITED: https://docs.astro.build/en/guides/deploy/github/]

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >= 22 | astro build, vitest, playwright | ✓ (CI: node-version: "22") | 22.x | — |
| npm | package management | ✓ | bundled com Node | — |
| Playwright browsers (chromium) | E2E tests CI | ✓ (instalado via npx playwright install) | ^1.59.1 | — |
| astro preview server | Playwright webServer | ✓ | via npm run preview | — |
| LHCI CLI | Lighthouse gate | ✓ (@lhci/cli ^0.14.0 em devDependencies) | 0.14.x | — |
| public/favicon.ico | Favicon ref após migração | ✓ (arquivo existe em public/) | — | — |

**Missing dependencies with no fallback:** Nenhuma.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 + Playwright ^1.59.1 |
| Config file | `vitest.config.ts` (dois projetos: `seo`, `unit-integration`) |
| Quick run command | `npx vitest run tests/unit/components/Button.test.ts` |
| Full suite command | `npm run test:all` (vitest run --coverage) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIGR-01 | `base` removido do config | unit (build verificação) | `npm run build` — build sem erros | ✅ (build step) |
| MIGR-02 | LP acessível em /deep-dive-vm/ | e2e | `npx playwright test --project=chromium` | ✅ `tests/e2e/homepage.spec.ts` |
| MIGR-03 | CNAME em dist/ após build | unit | `node -e "require('fs').existsSync('dist/CNAME')"` | ❌ Wave 0 — verificação manual |
| MIGR-04 | Paths hardcoded corrigidos + testes atualizados | unit | `npm run test:all` | ✅ (após atualização dos paths) |

### Sampling Rate

- **Por task commit:** `npx vitest run tests/unit/components/<arquivo>.test.ts` (isolado, <5s)
- **Por wave merge:** `npm run build && npm run test:all`
- **Phase gate:** `npm run build && npm run test:all && npx playwright test --project=chromium && npx lhci autorun`

### Wave 0 Gaps

- [ ] Verificação automatizada de `dist/CNAME` — pode ser adicionada ao `seo-meta.test.ts` ou como step no CI
- [ ] Verificação de que `dist/deep-dive-vm/index.html` existe após build

*(Existentes: infraestrutura de testes cobre todos os requirements após atualização de paths)*

---

## Security Domain

> `security_enforcement` não está configurado explicitamente em `.planning/config.json` — tratado como habilitado.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | não | Site estático sem auth |
| V3 Session Management | não | Site estático sem sessões |
| V4 Access Control | não | Site estático público |
| V5 Input Validation | não | Sem forms ou inputs nesta fase |
| V6 Cryptography | não | Sem dados criptografados |

### Known Threat Patterns for esta fase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CNAME hijacking (subdomain takeover) | Spoofing | CNAME aponta para domínio GitHub Pages próprio; verificar DNS |
| Conteúdo do hub placeholder exposto | Information Disclosure | noindex mitiga indexação; conteúdo é estático e público por design |

Esta fase tem superficie de ataque mínima — são mudanças de config e paths, não de lógica de segurança.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `astro-seo` aceita `noindex` via prop ou slot — API não verificada via Context7 nesta sessão | Hub placeholder / Code Examples | Hub placeholder pode exigir abordagem diferente para injetar noindex |
| A2 | A porta do servidor LHCI com `staticDistDir` é variável — `autodiscoverUrlBlocklist` pode ser frágil | LHCI Pitfall + Code Examples | Gate LHCI pode continuar auditando hub se a blocklist não funcionar com porta variável |
| A3 | `@astrojs/sitemap` suporta `filter` para excluir rotas específicas na versão ^3.7.2 | Pitfall 5 | Sitemap pode incluir hub placeholder inconsistentemente com noindex |
| A4 | GitHub Pages custom domain já configurado via UI — arquivo CNAME é suficiente para preservar | Runtime State Inventory | Pode requerer reconfiguração manual via GitHub UI após o primeiro deploy |

**Se esta tabela for lida pelo implementador:** Os itens A1 e A2 devem ser verificados ANTES de escrever o código do hub placeholder e de configurar o LHCI. Ambos têm soluções alternativas documentadas acima.

---

## Open Questions (RESOLVED)

1. **API de noindex no astro-seo**
   - What we know: `astro-seo` é a biblioteca instalada para SEO meta tags. O Layout.astro usa `<SEO>` com props.
   - What's unclear: A versão `^1.1.0` do astro-seo tem uma prop `noindex` direta ou requer injeção via slot/extend?
   - Recommendation: Verificar README do astro-seo ou testar localmente. Se não suportar, usar `<meta name="robots" content="noindex">` diretamente no hub placeholder sem passar pelo componente `<SEO>`.
   - RESOLVED: Plan 02 Task 3 usa injeção via `<meta slot="head" name="robots" content="noindex" />` — prop `noindex` do astro-seo não é necessária; o slot de head é a abordagem adotada.

2. **Porta LHCI com staticDistDir**
   - What we know: O LHCI com `staticDistDir` sobe um servidor HTTP próprio. A `autodiscoverUrlBlocklist` requer a URL completa incluindo porta.
   - What's unclear: A porta é fixa (ex: 9001) ou aleatória em cada run?
   - Recommendation: Testar localmente com `npx lhci autorun` após fazer o build para descobrir a porta. Ou usar `url` explícita em vez de autodiscovery — mais determinístico.
   - RESOLVED: Plan 03 Task 3 adota `ci.collect.url: ["http://localhost/deep-dive-vm/"]` com `staticDistDir` mantido — estratégia de url explícita elimina dependência da porta variável.

3. **JSON-LD condicional no Layout.astro**
   - What we know: O bloco JSON-LD atual sempre renderiza com `offersUrl` hardcoded.
   - What's unclear: Renderizar JSON-LD de `Course` no hub placeholder (que não é um curso) é semanticamente errado. Com `offersUrl` undefined, o JSON-LD deve ser suprimido inteiramente, não renderizado sem `offers`.
   - Recommendation: Usar condicional `{offersUrl && <script>...JSON-LD...</script>}` — suprime o JSON-LD inteiramente quando hub passa `undefined`.
   - RESOLVED: Plan 01 adota condicional `{offersUrl && (...)}` no bloco JSON-LD do Layout.astro; hub placeholder não passa `offersUrl` — JSON-LD de Course suprimido inteiramente.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `base: '/deep-dive-vm/'` + `dist/index.html` | file-based routing `src/pages/deep-dive-vm/index.astro` | Esta fase | Routing idiomático Astro; sem prefixo global |
| CNAME via GitHub UI (frágil em cada deploy) | `public/CNAME` em git | Esta fase | CNAME sobrevive a todos os deploys automaticamente |
| offersUrl hardcoded em Layout | offersUrl prop opcional | Esta fase | Layout reutilizável para hub e landing pages futuras |

---

## Sources

### Primary (HIGH confidence)

- [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) — comportamento de `base` e `import.meta.env.BASE_URL`
- [Astro Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) — CNAME e custom domain
- [Astro Routing Guide](https://docs.astro.build/en/guides/routing/) — file-based routing
- [LHCI Configuration](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html) — staticDistDir, autodiscoverUrlBlocklist
- [Lighthouse SEO: is-crawlable audit](https://developer.chrome.com/docs/lighthouse/seo/is-crawlable) — impacto de noindex no score SEO
- Grep no codebase: `import.meta.env.BASE_URL` — zero usos em `src/` [VERIFIED: grep no codebase]
- Grep no codebase: paths `/deep-dive-vm/` em `src/` — apenas `Layout.astro` linhas 16 e 48 [VERIFIED: grep no codebase]

### Secondary (MEDIUM confidence)

- [GitHub Docs: Managing custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) — CNAME DNS setup
- LHCI issue #208 — `autodiscoverUrlBlocklist` para excluir URLs específicas [CITED: github.com/GoogleChrome/lighthouse-ci/issues/208]

### Tertiary (LOW confidence)

- A3 (sitemap filter) e A4 (porta LHCI) — [ASSUMED], não verificados diretamente

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — stack existente, sem novos pacotes
- Architecture (routing): HIGH — confirmado via docs Astro oficiais
- Architecture (LHCI noindex): HIGH — confirmado via Chrome Developers docs + LHCI docs
- Pitfalls (ordem de execução): HIGH — derivado da análise de dependências reais do código
- A1 (astro-seo noindex API): LOW — não verificado nesta sessão

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stack estável; Astro 6.x e LHCI 0.14.x são versões maduras)
