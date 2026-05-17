---
phase: 06-route-migration
plan: 01
status: COMPLETE
completed: 2026-05-17
duration: ~10min
tasks_completed: 2
tasks_total: 2
commit: 7119a4b
requirements_satisfied:
  - MIGR-03
  - MIGR-04
files_modified:
  - public/CNAME
  - src/layouts/Layout.astro
decisions:
  - "offersUrl tornada prop opcional em vez de constante hardcoded (D-09)"
  - "favicon movido de /deep-dive-vm/favicon.svg para /favicon.ico (D-08)"
  - "CNAME criado antes de qualquer mudanca de roteamento (D-02)"
---

# Phase 06 Plan 01: CNAME + Layout.astro Hardcoded Path Removal

**One-liner:** CNAME de dominio criado e Layout.astro refatorado para remover paths /deep-dive-vm/ hardcoded antes da remocao do base.

## Status: COMPLETE

## Tasks Executadas

### Task 1: Criar public/CNAME (MIGR-03)

**Resultado:** PASSOU

- Arquivo `public/CNAME` criado com conteudo exato `mentoria.sertaoseracloud.com`
- Sem protocolo, sem aspas, sem quebra de linha adicional
- Verify automatizado: `node -e "... trim() === 'mentoria.sertaoseracloud.com'"` -> OK

### Task 2: Refatorar Layout.astro (MIGR-04)

**Resultado:** PASSOU

Quatro mudancas aplicadas:

1. **interface Props** — adicionado `offersUrl?: string` como quarto campo opcional
2. **desestruturacao** — `offersUrl` incluido em `const { title, description, url, offersUrl } = Astro.props`; constante hardcoded `const offersUrl = \`${siteOrigin}/deep-dive-vm#investimento\`` removida
3. **JSON-LD condicional** — bloco `<script type="application/ld+json">` envolvido em `{offersUrl && (...)}`; so renderiza quando prop e passada
4. **favicon** — `href: "/deep-dive-vm/favicon.svg"` -> `href: "/favicon.ico"`, `type: "image/svg+xml"` -> `type: "image/x-icon"`

Verify automatizado completo: todas as 5 assertivas passaram.

## Verificacao Final

```
CNAME OK
Layout OK
favicon.ico existe
```

Checks executados:
- `node -e "require('fs').readFileSync('public/CNAME',...).trim() === 'mentoria.sertaoseracloud.com'"` -> OK
- `['offersUrl?: string','/favicon.ico','offersUrl &&'].forEach(...)` -> OK
- `require('fs').existsSync('public/favicon.ico')` -> OK

## Arquivos Modificados

| Arquivo | Tipo | Mudanca |
|---------|------|---------|
| `public/CNAME` | Criado | Contem `mentoria.sertaoseracloud.com` |
| `src/layouts/Layout.astro` | Modificado | offersUrl prop opcional; favicon /favicon.ico; JSON-LD condicional |

## Commit

**Hash:** `7119a4b`
**Mensagem:** `feat(06-01): create CNAME and refactor Layout.astro for base removal`

## Deviations from Plan

Nenhum — plano executado exatamente como especificado.

Nota tecnica: o arquivo Layout.astro usa line endings CRLF (Windows). O Edit tool nao conseguiu localizar as strings por causa da diferenca de encodings. Solucao: edicoes realizadas via `node` com fs.readFileSync/writeFileSync, que lida corretamente com CRLF. Resultado identico ao esperado pelo plano.

## Self-Check: PASSED

- [x] `public/CNAME` existe: CONFIRMADO
- [x] `src/layouts/Layout.astro` modificado: CONFIRMADO
- [x] Commit `7119a4b` existe: CONFIRMADO
- [x] Verify final passou: CONFIRMADO
