# Phase 6: Route Migration — Validation Architecture

**Phase:** 06-route-migration
**Generated from:** RESEARCH.md § Validation Architecture

---

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^3.2.4 + Playwright ^1.59.1 + LHCI ^0.14.0 |
| Config file | `vitest.config.ts` (dois projetos: `seo`, `unit-integration`) |
| Quick run command | `npx vitest run tests/unit/components/Button.test.ts` |
| Full suite command | `npm run test:all` (vitest run --coverage) |

---

## Requirements → Test Map

| Req ID | Comportamento verificado | Tipo | Comando automatizado | Arquivo de teste |
|--------|--------------------------|------|----------------------|------------------|
| MIGR-01 | `base` removido de `astro.config.mjs` — build não falha | build + unit | `npm run build` + `node -e "if(require('fs').readFileSync('astro.config.mjs','utf-8').includes('base:')) throw new Error('base presente')"` | verificação inline (build step) |
| MIGR-02 | Landing page acessível em `/deep-dive-vm/` via Playwright | e2e | `npx playwright test --project=chromium` | `tests/e2e/homepage.spec.ts` |
| MIGR-03 | `dist/CNAME` contém `mentoria.sertaoseracloud.com` após build | unit | `node -e "const c=require('fs').readFileSync('dist/CNAME','utf-8').trim(); if(c!=='mentoria.sertaoseracloud.com') throw new Error(c); console.log('CNAME OK')"` | verificação inline (Plan 02 Task 3 verify) |
| MIGR-04 | Paths hardcoded corrigidos + todos os testes atualizados passam | unit + e2e + lhci | `npm run test:all && npx playwright test --project=chromium && npx lhci autorun` | `tests/unit/components/*.test.ts`, `tests/seo/seo-meta.test.ts`, `tests/e2e/*.spec.ts`, `.lhcirc.json` |

---

## Sampling Rate

| Momento | Comando | Escopo |
|---------|---------|--------|
| Por commit de task | `npx vitest run tests/unit/components/<arquivo>.test.ts` | Arquivo isolado, < 5s |
| Por wave merge | `npm run build && npm run test:all` | Build completo + Vitest |
| Phase gate (final) | `npm run build && npm run test:all && npx playwright test --project=chromium && npx lhci autorun` | Suite completa + LHCI |

---

## Wave 0 Gaps (itens sem cobertura automatizada antes das tasks)

- [ ] `dist/CNAME` — verificação automatizada pode ser adicionada ao `seo-meta.test.ts` ou como step CI. Coberto inline na Task 3 do Plan 02 (verify script).
- [ ] `dist/deep-dive-vm/index.html` existe após build — coberto pelo verify da Task 3 do Plan 02.

---

## Critérios de Passagem por Requisito

### MIGR-01 — base removido

```bash
node -e "
const s = require('fs').readFileSync('astro.config.mjs', 'utf-8');
if (s.includes('base:')) throw new Error('base ainda presente');
if (!s.includes('mentoria.sertaoseracloud.com')) throw new Error('site URL removida incorretamente');
console.log('MIGR-01 OK');
"
```

Passagem: exit code 0.

### MIGR-02 — Landing page em /deep-dive-vm/

```bash
npx playwright test --project=chromium tests/e2e/homepage.spec.ts
```

Passagem: 0 falhas. A landing page responde com conteúdo esperado em `http://localhost:4321/deep-dive-vm/`.

### MIGR-03 — CNAME preservado

```bash
node -e "
const c = require('fs').readFileSync('dist/CNAME', 'utf-8').trim();
if (c !== 'mentoria.sertaoseracloud.com') throw new Error('CNAME incorreto: ' + c);
console.log('MIGR-03 OK');
"
```

Passagem: exit code 0, sem lançar erro.

### MIGR-04 — Testes atualizados

```bash
# Vitest (unit + SEO)
npm run test:all

# Playwright E2E
npx playwright test --project=chromium

# LHCI — gate SEO >= 90% apenas para /deep-dive-vm/
npx lhci autorun
```

Passagem: exit code 0 em cada comando. LHCI audita exclusivamente `http://localhost/deep-dive-vm/` (hub excluído via `ci.collect.url`).

---

## Artefatos Obrigatórios por Requisito

| Req ID | Artefato | Verificação de existência |
|--------|----------|--------------------------|
| MIGR-01 | `astro.config.mjs` sem `base:` | `grep -v 'base:' astro.config.mjs` — sem output indica ausência |
| MIGR-02 | `src/pages/deep-dive-vm/index.astro` | `test -f src/pages/deep-dive-vm/index.astro` |
| MIGR-03 | `public/CNAME`, `dist/CNAME` (após build) | `test -f public/CNAME && test -f dist/CNAME` |
| MIGR-04 | `playwright.config.ts` com `baseURL: 'http://localhost:4321/'`, todos os spec files com `./deep-dive-vm/`, `.lhcirc.json` com `ci.collect.url` apontando para `/deep-dive-vm/` | Verificações inline nas tasks do Plan 03 |
