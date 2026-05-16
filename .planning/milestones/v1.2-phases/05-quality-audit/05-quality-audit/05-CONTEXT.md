# Phase 5: Quality Audit - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Verificar que todas as animações adicionadas no v1.2 passam 3 gates técnicos obrigatórios:
- QUAL-01: 60fps sem layout thrashing, will-change com escopo controlado (via impeccable detect)
- QUAL-02: prefers-reduced-motion desativa ou simplifica 100% das animações v1.2 (via Playwright)
- QUAL-03: CLS ≤ 0.1 verificado via Lighthouse CI (npm run lighthouse:ci)

A fase não adiciona novas animações — apenas audita e corrige problemas encontrados nos gates.

</domain>

<decisions>
## Implementation Decisions

### D-AUDIT-01: Ferramenta para QUAL-01
- **D-AUDIT-01:** Usar `npx impeccable detect src/ --json` para o gate QUAL-01. Não existe subcomando `impeccable audit` — a ferramenta v2.1.9 expõe apenas `detect`. O "audit" do ROADMAP refere-se ao processo da fase, não a um comando específico.
- Filtrar findings por categorias de performance (will-change permanente, layout thrashing, transforms não-compositor-only).
- Rodar contra `src/` (código-fonte), não dist/ nem localhost.

### D-AUDIT-02: Reduced-motion verification (QUAL-02)
- **D-AUDIT-02:** Playwright com `page.emulateMedia({ reducedMotion: 'reduce' })`.
- Adicionar testes ao arquivo existente `tests/e2e/motion-accessibility.spec.ts` (não criar novo arquivo).
- O que verificar: `getComputedStyle()` nos elementos com `[data-reveal]`, `[data-stagger]`, `.hero-stagger-item` e nos `motion.span` do SettingsToggle — garantir que animações estão desativadas (animation: none, opacity não está em 0, transform não está em translateY).
- Objetivo: sem animação visível quando preferência do sistema está ativa.

### D-AUDIT-03: CLS measurement (QUAL-03)
- **D-AUDIT-03:** Usar o script existente `npm run lighthouse:ci` (build + `astro preview` + lighthouse contra localhost).
- Verificar `lighthouse-report.json` gerado — campo `audits['cumulative-layout-shift'].numericValue <= 0.1`.
- Se CLS > 0.1: investigar qual animação/elemento causa o shift e corrigir antes de fechar a fase. Gate só fecha com resultado verde (≤ 0.1).

### D-PLAN-01: Estrutura dos planos
- **D-PLAN-01:** 3 planos em sequência (não paralelos):
  - 05-01 (Wave 1): QUAL-01 — impeccable detect + will-change audit + correções se necessário
  - 05-02 (Wave 2, depends 05-01): QUAL-02 — Playwright reduced-motion testes em motion-accessibility.spec.ts
  - 05-03 (Wave 3, depends 05-02): QUAL-03 — npm run lighthouse:ci + verificação CLS
- Dependência lógica: correções do QUAL-01 afetam o que QUAL-02 e QUAL-03 medem. Não paralelizar.

### D-PLAN-02: Política de falha
- **D-PLAN-02:** Cada gate deve passar antes de avançar. Se um gate falhar: investigar causa, corrigir no mesmo plano, re-rodar. Fase só fecha com todos os 3 gates verdes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos da fase
- `.planning/REQUIREMENTS.md` — QUAL-01, QUAL-02, QUAL-03 com critérios de aceitação exatos
- `.planning/ROADMAP.md` §Phase 5 — goal, success criteria, dependências

### Animações implementadas na Fase 4 (o que está sendo auditado)
- `src/layouts/Layout.astro` — CSS global: [data-reveal], [data-stagger], @keyframes fade-up, --ease-entrance, --ease-micro, IO script, 3 blocos @media prefers-reduced-motion
- `src/components/HeroMotion.tsx` — HeroMotionSingle com querySelectorAll + hero-stagger-item class + prefers-reduced-motion check no useEffect
- `src/components/SettingsToggle.tsx` — motion.span indicador (spring x:0/16) e label (opacity:0.4/1), MotionConfig reducedMotion="user"
- `src/components/sections/Bonuses.astro` — 3 bonus-card com data-stagger, delays 0/80/160ms
- `src/components/sections/Pricing.astro` — data-reveal na section, 8 li com data-stagger + delays 0–560ms, ease-micro no .price-card

### Infraestrutura de testes existente
- `playwright.config.ts` — configuração Playwright, baseURL http://localhost:4321/deep-dive-vm/, projetos chromium + firefox
- `tests/e2e/motion-accessibility.spec.ts` — spec E2E de acessibilidade de motion (adicionar reduced-motion aqui)
- `package.json` → script `lighthouse:ci` — build + astro preview + lighthouse report → `lighthouse-report.json`

### Impeccable
- `.impeccable/design.json` — design tokens de referência (ease-out-standard, durations)
- Versão instalada: `npx impeccable --version` = 2.1.9 (comandos: detect, skills)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tests/e2e/motion-accessibility.spec.ts` — já existe com estructura de testes E2E; adicionar `page.emulateMedia` neste arquivo
- `npm run lighthouse:ci` — script funcional que já produz `lighthouse-report.json`
- `npx impeccable detect` — verificado em funcionamento (Fase 3 usou `detect --json`)

### Established Patterns
- Pattern de reduced-motion via CSS: Layout.astro tem 3 blocos `@media (prefers-reduced-motion: reduce)` como exemplo
- Pattern de reduced-motion via JS: HeroMotion.tsx usa `window.matchMedia("(prefers-reduced-motion: reduce)").matches` no useEffect
- MotionConfig reducedMotion="user": SettingsToggle.tsx — motion/react suprime animações automaticamente

### Integration Points
- QUAL-01 pode encontrar will-change pendente: atualmente `will-change: transform` em `:hover` no Pricing.astro e Button.astro (já corrigido pelo WR-07). Se detect apontar outros, corrigir nos mesmos arquivos.
- QUAL-02 Playwright precisa do servidor rodando: usar `webServer` config no playwright.config.ts ou instruir executor a fazer `npm run preview` antes dos testes
- QUAL-03 Lighthouse: o script `lighthouse:ci` usa `astro preview` mas aponta para URL de produção no comando lighthouse — verificar/ajustar para localhost

</code_context>

<specifics>
## Specific Ideas

- O `lighthouse:ci` no package.json aponta para `https://mentoria.sertaoseracloud.com/deep-dive-vm/` (URL de produção). O executor do 05-03 deve verificar isso e ajustar para localhost se necessário para gate confiável sem deploy.
- Para QUAL-02 Playwright, verificar se o `webServer` está configurado no playwright.config.ts ou se o executor precisa iniciar o servidor manualmente antes de rodar os testes.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-Quality Audit*
*Context gathered: 2026-05-16*