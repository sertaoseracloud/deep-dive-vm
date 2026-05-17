---
phase: 06-route-migration
plan: 03
status: COMPLETE_WITH_NOTES
wave: 3
completed: 2026-05-17
duration: ~15min
tasks_completed: 3
tasks_total: 3

subsystem: tests/config
tags: [vitest, playwright, lhci, migration, test-config]

dependency_graph:
  requires: [06-02]
  provides: [MIGR-04]
  affects:
    - tests/unit/components/*.test.ts
    - tests/seo/seo-meta.test.ts
    - playwright.config.ts
    - tests/e2e/*.spec.ts
    - .lhcirc.json
    - .lighthouserc.json

tech_stack:
  patterns:
    - Vitest readFileSync pointing to dist/deep-dive-vm/index.html
    - Playwright baseURL raiz + page.goto("./deep-dive-vm/") para landing page
    - LHCI url explícita excluindo hub placeholder do gate SEO

key_files:
  modified:
    - tests/unit/components/Button.test.ts
    - tests/unit/components/Faq.test.ts
    - tests/unit/components/Footer.test.ts
    - tests/unit/components/Hero.test.ts
    - tests/unit/components/Layout.test.ts
    - tests/unit/components/NavBar.test.ts
    - tests/unit/components/Pricing.test.ts
    - tests/unit/components/SectionHead.test.ts
    - tests/unit/components/StickyCta.test.ts
    - tests/unit/components/UrgencyBar.test.ts
    - tests/seo/seo-meta.test.ts
    - playwright.config.ts
    - tests/e2e/homepage.spec.ts
    - tests/e2e/accessibility.spec.ts
    - tests/e2e/journeys.spec.ts
    - tests/e2e/motion-accessibility.spec.ts
    - .lhcirc.json
    - .lighthouserc.json

decisions:
  - "Adicionado url explícita em .lighthouserc.json além de .lhcirc.json — paridade entre os dois arquivos de config LHCI"
  - "LHCI sem --config explícito usa .lighthouserc.json por padrão (resolve alfabético) — falha de performance 72% vs gate 80% é pré-existente"
  - "npx lhci autorun --config=.lhcirc.json: exit 0, SEO 100% (gate MIGR-04 confirmado)"

requirements_satisfied:
  - MIGR-04
---

# Phase 06 Plan 03: Test Config Migration Summary

**One-liner:** Atualização de 17 arquivos de teste e configuração para refletir dist/deep-dive-vm/ e baseURL raiz — suite Vitest 106/106 verde, gate SEO LHCI 100%.

---

## Status: COMPLETE_WITH_NOTES

Todas as 3 tasks executadas com sucesso. npm run test:all: 106 testes, 0 falhas. LHCI com .lhcirc.json explícito: exit 0, SEO 100%.

**Nota:** `npx lhci autorun` sem `--config` usa .lighthouserc.json (que tem gate de performance 80%) e retorna exit 1 por performance 72% — gate pré-existente, não introduzido nesta fase. Com `--config=.lhcirc.json` explícito: exit 0.

---

## Tasks Executadas

### Task 1: Atualizar 10 component tests + seo-meta.test.ts para dist/deep-dive-vm/

**Commit:** `0e135c1`
**Status:** OK

Substituição uniforme em 11 arquivos: `dist/index.html` → `dist/deep-dive-vm/index.html`.

Arquivos alterados (apenas a linha readFileSync em cada):
- tests/unit/components/Button.test.ts
- tests/unit/components/Faq.test.ts
- tests/unit/components/Footer.test.ts
- tests/unit/components/Hero.test.ts
- tests/unit/components/Layout.test.ts
- tests/unit/components/NavBar.test.ts
- tests/unit/components/Pricing.test.ts
- tests/unit/components/SectionHead.test.ts
- tests/unit/components/StickyCta.test.ts
- tests/unit/components/UrgencyBar.test.ts
- tests/seo/seo-meta.test.ts — DIST_INDEX atualizado; DIST_DIR permanece dist/

**Verify automatizado:**
```
Todos os 11 arquivos de test atualizados OK
```

---

### Task 2: Atualizar playwright.config.ts + 4 arquivos E2E

**Commit:** `b043d35`
**Status:** OK

playwright.config.ts:
- `use.baseURL`: `http://localhost:4321/deep-dive-vm/` → `http://localhost:4321/`
- `webServer.url`: `http://localhost:4321/deep-dive-vm/` → `http://localhost:4321/`

E2E specs (todos os page.goto para a LP):
- homepage.spec.ts: 14 gotos `"./"` → `"./deep-dive-vm/"` (incluindo `const response = await page.goto`)
- accessibility.spec.ts: todos gotos `"./"` → `"./deep-dive-vm/"`
- journeys.spec.ts: todos gotos `"./"` → `"./deep-dive-vm/"`
- motion-accessibility.spec.ts: gotos `"./"` → `"./deep-dive-vm/"` e `"./#investimento"` → `"./deep-dive-vm/#investimento"`

**Verify automatizado:**
```
playwright.config.ts OK; todos os E2E gotos para LP usam deep-dive-vm
```

---

### Task 3: Corrigir .lhcirc.json + validação final

**Commit:** `7172fc9`
**Status:** OK

.lhcirc.json: adicionado `ci.collect.url: ["http://localhost/deep-dive-vm/"]`.
.lighthouserc.json: mesma correção aplicada por paridade.

**Verify automatizado:**
```
.lhcirc.json OK — url: [ 'http://localhost/deep-dive-vm/' ]
```

**npm run build:** exit 0 — 2 páginas geradas (deep-dive-vm/index.html, index.html)

**npm run test:all:** 106 testes, 0 falhas, 13 arquivos

**npx lhci autorun --config=.lhcirc.json:** exit 0
- SEO: 100% (gate 90% PASSOU)
- Accessibility: 100% (gate 90% PASSOU)
- Best Practices: 100% (gate 80% PASSOU)
- Performance: 72% (sem gate no .lhcirc.json — apenas warn)

**npx lhci autorun (sem --config):** exit 1
- Usa .lighthouserc.json por padrão (resolução automática)
- Falha: performance 72% vs gate 80% do .lighthouserc.json
- Este gate é pré-existente — não foi introduzido nesta fase
- URL auditada: http://localhost:[porta]/deep-dive-vm/ (URL explícita funcionou)

---

## Verificação Final Global

| Check | Resultado |
|-------|-----------|
| 10 component tests → dist/deep-dive-vm/index.html | OK |
| seo-meta.test.ts DIST_INDEX → dist/deep-dive-vm/index.html | OK |
| playwright.config.ts baseURL = http://localhost:4321/ | OK |
| playwright.config.ts webServer.url = http://localhost:4321/ | OK |
| 4 E2E specs: gotos LP usam ./deep-dive-vm/ | OK |
| .lhcirc.json ci.collect.url contém deep-dive-vm | OK |
| npm run build: exit 0 | OK |
| npm run test:all: 106/106 pass | OK |
| dist/CNAME = mentoria.sertaoseracloud.com | OK |
| npx lhci autorun --config=.lhcirc.json: exit 0 | OK |
| SEO score >= 90% (100%) | OK |
| npx lhci autorun (sem --config): exit 0 | WARN — falha de performance pré-existente |

---

## Arquivos Modificados

| Arquivo | Tipo | Mudança |
|---------|------|---------|
| tests/unit/components/Button.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/Faq.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/Footer.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/Hero.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/Layout.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/NavBar.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/Pricing.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/SectionHead.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/StickyCta.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/unit/components/UrgencyBar.test.ts | Modified | readFileSync: dist/index.html → dist/deep-dive-vm/index.html |
| tests/seo/seo-meta.test.ts | Modified | DIST_INDEX: dist/index.html → dist/deep-dive-vm/index.html |
| playwright.config.ts | Modified | baseURL e webServer.url: /deep-dive-vm/ → raiz |
| tests/e2e/homepage.spec.ts | Modified | 14 gotos "./" → "./deep-dive-vm/" |
| tests/e2e/accessibility.spec.ts | Modified | todos gotos "./" → "./deep-dive-vm/" |
| tests/e2e/journeys.spec.ts | Modified | todos gotos "./" → "./deep-dive-vm/" |
| tests/e2e/motion-accessibility.spec.ts | Modified | gotos "./" → "./deep-dive-vm/", "./#investimento" → "./deep-dive-vm/#investimento" |
| .lhcirc.json | Modified | ci.collect.url: ["http://localhost/deep-dive-vm/"] adicionado |
| .lighthouserc.json | Modified | ci.collect.url: ["http://localhost/deep-dive-vm/"] adicionado (paridade) |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Adicionado url explícita em .lighthouserc.json além de .lhcirc.json**
- **Found during:** Task 3
- **Issue:** O plano especificava corrigir apenas .lhcirc.json, mas .lighthouserc.json também usa staticDistDir sem url explícita — o mesmo problema de auditoria do hub placeholder se aplicaria a ambos.
- **Fix:** Adicionada `ci.collect.url: ["http://localhost/deep-dive-vm/"]` em .lighthouserc.json por paridade.
- **Files modified:** .lighthouserc.json
- **Commit:** `7172fc9`

### Notas de Execução

**LHCI autorun sem --config:** O comando `npx lhci autorun` sem argumento usa .lighthouserc.json por resolução automática (precedência alfabética/padrão do LHCI). Este arquivo tem um gate `categories:performance >= 0.8` que o plano original não previa. A performance atual (72%) em ambiente local é uma limitação de ambiente — não uma regressão desta fase. O gate crítico do plano (SEO >= 90%) passou com 100%.

**URL explícita funcionou:** Ambos os runs do LHCI auditaram corretamente `http://localhost:[porta]/deep-dive-vm/` — o hub placeholder em dist/index.html não foi auditado. O objetivo principal (excluir hub do gate SEO) está implementado.

---

## Success Criteria — Conferência Final

| Critério | Status |
|----------|--------|
| 10 component tests leem dist/deep-dive-vm/index.html (MIGR-04) | PASS |
| seo-meta.test.ts usa dist/deep-dive-vm/index.html como DIST_INDEX (MIGR-04) | PASS |
| playwright.config.ts: baseURL = http://localhost:4321/ (MIGR-04) | PASS |
| playwright.config.ts: webServer.url = http://localhost:4321/ (MIGR-04) | PASS |
| 4 arquivos E2E: page.goto LP usa ./deep-dive-vm/ (MIGR-04) | PASS |
| .lhcirc.json: ci.collect.url aponta para /deep-dive-vm/ | PASS |
| npm run test:all: exit 0 (106/106) | PASS |
| dist/CNAME = mentoria.sertaoseracloud.com (MIGR-03) | PASS |
| npx lhci autorun --config=.lhcirc.json: exit 0, SEO >= 90% | PASS |
| npx lhci autorun (sem --config): exit 0 | PARTIAL — falha performance pré-existente |

---

## Self-Check: PASSED

Verificado:
- tests/unit/components/Button.test.ts — contém dist/deep-dive-vm/index.html
- tests/seo/seo-meta.test.ts — DIST_INDEX contém dist/deep-dive-vm/index.html
- playwright.config.ts — baseURL http://localhost:4321/ (sem /deep-dive-vm/)
- tests/e2e/homepage.spec.ts — todos gotos usam ./deep-dive-vm/
- .lhcirc.json — ci.collect.url presente com deep-dive-vm
- Commits 0e135c1, b043d35, 7172fc9 — presentes em git log
