---
phase: 06-route-migration
plan: 02
status: COMPLETE
wave: 2
completed: 2026-05-17
duration: ~10min
tasks_completed: 3
tasks_total: 3

subsystem: routing/pages
tags: [astro, routing, migration, ssg, hub-placeholder]

dependency_graph:
  requires: [06-01]
  provides: [06-03]
  affects: [astro.config.mjs, src/pages/deep-dive-vm/index.astro, src/pages/index.astro, src/layouts/Layout.astro]

tech_stack:
  patterns:
    - Astro file-based routing: src/pages/[slug]/index.astro → dist/[slug]/index.html
    - Layout slot nomeado para injeção de meta tags no <head>
    - Hub placeholder com noindex para conteúdo ainda não publicado

key_files:
  modified:
    - astro.config.mjs
    - src/pages/index.astro
    - src/layouts/Layout.astro
  created:
    - src/pages/deep-dive-vm/index.astro

decisions:
  - "Adicionado <slot name=\"head\" /> ao Layout.astro para permitir injeção de meta tags no <head> (não havia slot nomeado)"
  - "noindex injetado via slot nomeado: <meta slot=\"head\" name=\"robots\" content=\"noindex\" />"
  - "offersUrl passado explicitamente na VM page — JSON-LD Course ativado apenas para a landing page"

requirements_satisfied:
  - MIGR-01
  - MIGR-02
---

# Phase 06 Plan 02: Route Migration — Core Summary

**One-liner:** Remoção de `base` do config Astro + migração da landing page para `/deep-dive-vm/` via file-based routing + hub placeholder com noindex em 3 tasks atômicas.

---

## Status: COMPLETE

Todas as 3 tasks executadas com sucesso. Build validado com exit code 0.

---

## Tasks Executadas

### Task 1: Remover base de astro.config.mjs

**Commit:** `57d1f6d`
**Status:** OK

Removida a linha `base: '/deep-dive-vm/'` do `astro.config.mjs`. O arquivo resultante contém apenas `site`, `outDir` e `integrations`.

**Verify automatizado:**
```
astro.config.mjs OK
```

**Resultado:** `astro.config.mjs` sem `base:` — site servido da raiz (MIGR-01).

---

### Task 2: Criar src/pages/deep-dive-vm/index.astro

**Commit:** `5c1af68`
**Status:** OK

Criado `src/pages/deep-dive-vm/index.astro` com:
- Todo o conteúdo de `src/pages/index.astro` (todos os imports, seções e slots)
- Imports corrigidos de `../` para `../../layouts/` e `../../components/`
- Prop `offersUrl="https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento"` passada ao Layout
- JSON-LD Course ativado via `offersUrl` (prop opcional no Layout)

**Verify automatizado:**
```
deep-dive-vm/index.astro OK
```

**Resultado:** Landing page da VM acessível em `/deep-dive-vm/` (MIGR-02).

---

### Task 3: Hub placeholder + build de validação

**Commit:** `0f2173b`
**Status:** OK

Substituído `src/pages/index.astro` pelo hub placeholder mínimo:
- `title="Mentoria Sertão Será Cloud"`
- `description="Formações técnicas de Azure para engenheiros. Microsoft MVP."`
- `<meta slot="head" name="robots" content="noindex" />` (per D-10, D-11)
- Conteúdo: `<h1>`, `<p>` e link para `/deep-dive-vm/`
- Sem componentes da landing page

**Desvio automático (Rule 2):** O `Layout.astro` não possuía `<slot name="head">` no `<head>`. Para injetar o `noindex` corretamente no `<head>` do HTML gerado, foi adicionado `<slot name="head" />` ao Layout antes do `</head>`. Esta é uma funcionalidade crítica ausente — sem ela, `<meta slot="head">` seria ignorado ou renderizado no body.

**Build executado:** `npm run build`

**Saída do build:**
```
[build] output: "static"
[build] Building static entrypoints...
[vite] ✓ built in 2.86s
generating static routes
  ├─ /deep-dive-vm/index.html (+53ms)
  ├─ /index.html (+6ms)
✓ Completed in 262ms.
[build] 2 page(s) built in 4.29s
[build] Complete!
```

**Exit code:** 0

**Verify automatizado:**
```
Build OK — todos os artefatos presentes
```

---

## Verificação Final Global

| Check | Resultado |
|-------|-----------|
| 1. `astro.config.mjs` sem `base:` | OK |
| 2. `src/pages/deep-dive-vm/index.astro` existe | OK |
| 3. Hub placeholder sem componentes da LP | OK |
| 4. `dist/index.html`, `dist/deep-dive-vm/index.html`, `dist/CNAME` presentes | OK |
| `dist/index.html` contém `noindex` | OK |
| `dist/deep-dive-vm/index.html` contém "Deep Dive Azure VM" | OK |
| `dist/CNAME` = `mentoria.sertaoseracloud.com` | OK |

---

## Arquivos Modificados

| Arquivo | Tipo | Mudança |
|---------|------|---------|
| `astro.config.mjs` | Modified | Removida linha `base: '/deep-dive-vm/'` |
| `src/pages/deep-dive-vm/index.astro` | Created | Landing page completa com imports `../../` e `offersUrl` |
| `src/pages/index.astro` | Modified | Substituído por hub placeholder mínimo com noindex |
| `src/layouts/Layout.astro` | Modified | Adicionado `<slot name="head" />` antes de `</head>` |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Adicionado `<slot name="head" />` ao Layout.astro**
- **Found during:** Task 3
- **Issue:** O `Layout.astro` não possuía `<slot name="head">` no `<head>` do HTML. Sem ele, a diretiva `<meta slot="head" name="robots" content="noindex" />` usada no hub placeholder seria ignorada pelo Astro (slot não existia → conteúdo não seria inserido no `<head>`).
- **Fix:** Adicionada a linha `<slot name="head" />` ao `Layout.astro` imediatamente antes de `</head>` — alinhado com o padrão de injeção de meta tags via slot nomeado documentado no RESEARCH.md.
- **Files modified:** `src/layouts/Layout.astro`
- **Commit:** `0f2173b` (incluído junto com Task 3)

---

## Success Criteria — Conferência Final

| Critério | Status |
|----------|--------|
| `astro.config.mjs` não possui `base` (MIGR-01) | PASS |
| `src/pages/deep-dive-vm/index.astro` com conteúdo completo da LP e `offersUrl` (MIGR-02) | PASS |
| `src/pages/index.astro` é hub placeholder com title, description e noindex (D-10, D-11) | PASS |
| `npm run build` conclui com exit code 0 | PASS |
| `dist/deep-dive-vm/index.html` existe e contém "Deep Dive Azure VM" | PASS |
| `dist/index.html` existe e contém noindex | PASS |
| `dist/CNAME` existe e contém `mentoria.sertaoseracloud.com` | PASS |

---

## Self-Check: PASSED

- `src/pages/deep-dive-vm/index.astro` — FOUND
- `src/pages/index.astro` — FOUND (hub placeholder)
- `astro.config.mjs` — FOUND (sem base)
- `dist/index.html` — FOUND
- `dist/deep-dive-vm/index.html` — FOUND
- `dist/CNAME` — FOUND
- Commits `57d1f6d`, `5c1af68`, `0f2173b` — verificados em git log
