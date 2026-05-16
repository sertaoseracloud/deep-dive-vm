# Phase 6: Route Migration - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrar o site Astro de `base: '/deep-dive-vm/'` para root (sem `base`), preservando a landing page da VM em `/deep-dive-vm/` via file-based routing nativo, adicionando um placeholder mínimo em `/` para manter CI verde, e atualizando todos os paths hardcoded e configs de teste.

</domain>

<decisions>
## Implementation Decisions

### Astro Config

- **D-01:** Remover completamente a propriedade `base` de `astro.config.mjs` — não substituir por `'/'`. O `site` permanece `'https://mentoria.sertaoseracloud.com'`.
- **D-02:** `public/CNAME` criado com `mentoria.sertaoseracloud.com` como primeira ação — safety net antes de qualquer outra mudança.
- **D-03:** A landing page da VM migra para `src/pages/deep-dive-vm/index.astro` (file-based routing nativo do Astro — nenhuma config de rotas necessária).

### Testes Unitários (Vitest)

- **D-04:** Todos os 10+ component tests que leem `dist/index.html` são atualizados para `dist/deep-dive-vm/index.html` — uma mudança de path por arquivo, sem abstrações adicionais.
- **D-05:** `tests/seo/seo-meta.test.ts` também atualiza para `dist/deep-dive-vm/index.html` — os assertions SEO continuam verificando a landing page da VM, não o hub.

### Testes E2E (Playwright)

- **D-06:** `playwright.config.ts` `baseURL` muda para `http://localhost:4321/` (raiz — aponta para o hub). `webServer.url` também muda para `http://localhost:4321/`.
- **D-07:** Testes E2E existentes (homepage, accessibility, journeys, motion-accessibility) precisam atualizar suas navegações de `./` para `./deep-dive-vm/` onde necessário, uma vez que a `baseURL` passa a ser o hub.

### Layout.astro — Hardcoded Paths

- **D-08:** Favicon: `Layout.astro` linha 48 muda de `"/deep-dive-vm/favicon.svg"` para `"/favicon.ico"`. `public/favicon.ico` já existe e é copiado para `dist/` automaticamente.
- **D-09:** `offersUrl`: tornar prop opcional em `Layout.astro`. Hub passa `undefined` → JSON-LD de produto não renderiza. VM page passa `https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento` explicitamente.

### Hub Placeholder (Fase 6)

- **D-10:** Criar `src/pages/index.astro` com conteúdo placeholder mínimo: título `Mentoria Sertão Será Cloud`, description, e `<meta name="robots" content="noindex">`. Usar o `Layout.astro` existente com props básicas (sem hub design definitivo — esse é o escopo da Fase 7).
- **D-11:** O placeholder deve ter SEO mínimo suficiente para o LHCI não falhar o gate de score. `<meta name="description">` e `<title>` são obrigatórios.

### Ordem de Execução (crítica)

- **D-12:** Sequência obrigatória dentro da Fase 6:
  1. Criar `public/CNAME`
  2. Corrigir todos os paths hardcoded em `src/` (favicon, offersUrl)
  3. Remover `base` de `astro.config.mjs` + mover LP para `src/pages/deep-dive-vm/`
  4. Criar hub placeholder `src/pages/index.astro`
  5. Atualizar configs de teste (`playwright.config.ts`, 10+ Vitest files, seo-meta.test.ts)
  6. Validar CI (build + testes + LHCI)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Config files (alterar nesta fase)
- `astro.config.mjs` — Remover `base: '/deep-dive-vm/'`; manter `site`
- `playwright.config.ts` — Atualizar `baseURL` e `webServer.url` para `http://localhost:4321/`
- `.lhcirc.json` e `.lighthouserc.json` — Verificar se precisam de ajuste para multi-page

### Arquivos com paths hardcoded (corrigir nesta fase)
- `src/layouts/Layout.astro` linha 16 — `offersUrl` hardcoded
- `src/layouts/Layout.astro` linha 48 — favicon href hardcoded

### Testes unitários (atualizar `dist/index.html` → `dist/deep-dive-vm/index.html`)
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
- `tests/seo/seo-meta.test.ts`

### Testes E2E (verificar navegações após mudança de baseURL)
- `tests/e2e/homepage.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/journeys.spec.ts`
- `tests/e2e/motion-accessibility.spec.ts`

### Arquivos públicos
- `public/CNAME` — Criar (não existe ainda)
- `public/favicon.ico` — Já existe; será copiado para `dist/favicon.ico`
- `public/favicon.svg` — Já existe

### Requirements
- `.planning/REQUIREMENTS.md` — MIGR-01, MIGR-02, MIGR-03, MIGR-04
- `.planning/research/STACK.md` — Análise detalhada dos arquivos que mudam
- `.planning/research/PITFALLS.md` — Ordem de execução e armadilhas documentadas

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/favicon.ico` — Já existe; mover referência de `/deep-dive-vm/favicon.svg` para `/favicon.ico`
- `src/layouts/Layout.astro` — Layout compartilhado; precisa de refactoring de 2 props (favicon, offersUrl)
- `astro-seo` (já instalado) — Cobre todos os meta tags necessários para o placeholder do hub

### Established Patterns
- File-based routing do Astro: `src/pages/[slug]/index.astro` → `/[slug]/` automaticamente. Zero config adicional.
- `public/` → copiado para `dist/` raiz automaticamente — `public/CNAME` → `dist/CNAME`
- `readFileSync(DIST_INDEX)` em 10+ testes — padrão estabelecido; atualizar apenas o path

### Integration Points
- `astro.config.mjs` → `playwright.config.ts` → `tests/` — pipeline de configuração. Mudar `base` quebra a cadeia inteira se a ordem não for respeitada.
- `import.meta.env.BASE_URL` — será `/` após remover `base`. Verificar se é usado em algum outro lugar além de `Layout.astro`.

</code_context>

<specifics>
## Specific Ideas

- Favicon: usar `/favicon.ico` (convenção universal, arquivo já existe em `public/`)
- `offersUrl`: prop opcional — hub passa `undefined`, VM page passa a URL completa `https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento`
- Hub placeholder: `<meta name="robots" content="noindex">` para não indexar um conteúdo incompleto

</specifics>

<deferred>
## Deferred Ideas

- Design definitivo do hub (foto, bio, cards de cursos, links sociais) → Fase 7
- Testes E2E do hub page → Fase 7
- SEO meta tags completos do hub com og:image → Fase 7
- Plausible analytics (cookieless) → pós-v1.3

</deferred>

---

*Phase: 6-route-migration*
*Context gathered: 2026-05-16*
