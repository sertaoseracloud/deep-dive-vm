# Phase 8: Multi-LP Scaffold - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Criar o padrão documentado e demonstrável para adicionar novas landing pages à plataforma — entregando: (1) a rota `/deep-dive-ec2/` como página LP-lite "em breve" funcionando e indexada, e (2) `HOWTO-new-landing-page.md` na raiz do repositório como checklist completo e replicável. O EC2 é simultaneamente o primeiro uso do padrão e o exemplo vivo do HOWTO.

</domain>

<decisions>
## Implementation Decisions

### D-01 — Página /deep-dive-ec2/ (SCAFF-01)
- **Estilo:** LP-lite com teaser — usa `Layout.astro` (dark theme, sem NavBar, sem Footer), consistente com o visual do hub. Não é um redirect, é uma página própria que demonstra o padrão.
- **Conteúdo:** `h1` com título do curso + parágrafo de descrição curta (2-3 linhas sobre AWS EC2) + badge visual "Em breve".
- **Indexação:** indexada desde o início — sem `noindex`. A página aparece no sitemap e é rastreada pelo Google desde o deploy. (Decisão deliberada para gerar sinais de SEO antecipados.)
- **Navegação:** link de volta ao hub (`← Ver todos os cursos` ou similar apontando para `/`) incluído na página.

### D-02 — Open Graph da página EC2 (HUB-04 pattern)
- **og:image:** placeholder dedicado `public/ec2-og.png` 1200×630px — gerado com o mesmo script sharp usado para `hub-og.png`. Usuário substitui antes do deploy real.
- **OG completo:** `og:title` (título do curso), `og:description` (descrição curta), `og:image` (/ec2-og.png), `og:url` (`https://mentoria.sertaoseracloud.com/deep-dive-ec2/`). Segue o mesmo padrão completo do hub e da LP.

### D-03 — Testes (SCAFF-01)
- **E2E dedicado:** criar `tests/e2e/ec2-coming-soon.spec.ts` seguindo o padrão de `hub.spec.ts`. Asserções: HTTP 200, `h1` visível, badge "EM BREVE" visível, link de volta ao hub presente.
- **SEO test:** adicionar asserção no `tests/seo/seo-meta.test.ts` (teste 16) verificando que `dist/deep-dive-ec2/index.html` contém `ec2-og.png` no `og:image`. Segue o padrão do teste 15 (hub).

### D-04 — HOWTO-new-landing-page.md (SCAFF-02)
- **Formato:** checklist numérico com trechos de código — sequencial, objetivo, fácil de seguir.
- **Escopo completo:** cobre todos os passos do zero ao vivo:
  1. Criar `src/pages/[slug]/index.astro` (snippet com Layout.astro props)
  2. Adicionar card em `src/data/courses.ts` (snippet)
  3. Criar `public/[slug]-og.png` placeholder (comando sharp)
  4. Criar `tests/e2e/[slug]-coming-soon.spec.ts` (snippet do spec)
  5. Adicionar asserção no `tests/seo/seo-meta.test.ts`
  6. Validar: `npm run build && npm run test:all`
  7. Deploy checklist (push, Pages build, CNAME survive)
- **Exemplo vivo:** o HOWTO referencia explicitamente a rota EC2 como o exemplo concreto criado nesta fase — "veja como foi feito para `/deep-dive-ec2/`".

### Claude's Discretion
- Texto exato da descrição do curso EC2 na página teaser — usar o que já existe em `src/data/courses.ts` (`"Formação técnica focada em AWS EC2 — em preparação."`) como base, expandindo para 2-3 linhas se necessário.
- Estilo visual do badge "Em breve" e do link de volta ao hub — seguir os tokens de design existentes (`--nucleo-eletrico`, `--texto-principal`, Space Grotesk).
- Localização do link de volta ao hub na página EC2 — topo ou rodapé da página, conforme melhor UX.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap e Requisitos
- `.planning/ROADMAP.md` §Phase 8 — Goal, Success Criteria, Requirements (SCAFF-01, SCAFF-02)
- `.planning/REQUIREMENTS.md` §SCAFF — Requisitos SCAFF-01 e SCAFF-02 com critérios exatos

### Código existente (referência de padrão)
- `src/pages/index.astro` — padrão do hub: como usar Layout.astro sem NavBar/Footer, como passar ogImage e url
- `src/pages/deep-dive-vm/index.astro` — padrão da LP completa: como usar Layout.astro com jsonLd
- `src/layouts/Layout.astro` — interface Props atual (title, description, url, ogImage, noindex, jsonLd)
- `src/data/courses.ts` — já contém EC2 com `status: 'coming-soon'` e `url: '/deep-dive-ec2/'`
- `public/hub-og.png` — referência para geração do ec2-og.png (mesmo script sharp)

### Testes (padrões a seguir)
- `tests/e2e/hub.spec.ts` — padrão de spec E2E que o ec2-coming-soon.spec.ts deve seguir
- `tests/seo/seo-meta.test.ts` — teste 15 é o padrão para o novo teste 16 do EC2

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/layouts/Layout.astro` — wrapper universal já aceita `ogImage`, `noindex`, `jsonLd`, `url`; a página EC2 precisa só das props corretas
- `src/data/courses.ts` — EC2 já declarado com url e status; não precisa de alteração para criar a página
- Script sharp usado em hub-og.png (no-deps, stdin) — reutilizável para ec2-og.png com parâmetros diferentes

### Established Patterns
- `src/pages/[slug]/index.astro` com Layout.astro é o padrão de rota — exatamente o que o HOWTO vai documentar
- `hub.spec.ts` estrutura (describe + test load/a11y/responsive) é o template para `ec2-coming-soon.spec.ts`
- Teste SEO com `existsSync` + `expect().toBe(true)` + `readFileSync` + `toContain` — padrão do teste 15

### Integration Points
- `src/pages/deep-dive-ec2/index.astro` — arquivo a criar (rota ainda não existe)
- `astro.config.mjs` — sitemap já inclui todas as rotas (sem filtros de exclusão pós-Fase 7); EC2 aparecerá automaticamente se indexada
- CI pipeline — `npm run build && npm run test:all` precisa continuar verde com o novo spec E2E

</code_context>

<specifics>
## Specific Ideas

- A página EC2 é simultaneamente a demonstração do padrão e o primeiro conteúdo real do scaffold — deve ser implementada *seguindo* os passos do HOWTO (ou o HOWTO deve ser escrito *observando* como a página foi criada)
- O HOWTO deve referenciar commits específicos desta fase como prova de que o processo funciona
- Feature toggle para liberar rotas por deploy foi mencionado pelo usuário e registrado em Deferred

</specifics>

<deferred>
## Deferred Ideas

- **Feature toggle para liberar o acesso às rotas pelo deploy** — capacidade nova (ex: flags por environment variable ou config JSON que habilita/desabilita uma rota no build). Não pertence ao scaffold básico; pertence a uma fase de "Platform Config" futura quando houver múltiplos cursos em estágios diferentes.

</deferred>

---

*Phase: 8-multi-lp-scaffold*
*Context gathered: 2026-05-17*
