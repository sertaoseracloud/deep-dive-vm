# Phase 03 — Motion Critique: Validation Strategy

**Phase:** 03
**Date:** 2026-05-15

## Requirement → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando Automatizado | Wave Gate |
|--------|--------------|---------------|---------------------|-----------|
| CRIT-01 | PRODUCT.md existe na raiz do projeto | Smoke (arquivo) | `Test-Path "PRODUCT.md"` | Wave 1 complete |
| CRIT-01 | DESIGN.md existe na raiz do projeto | Smoke (arquivo) | `Test-Path "DESIGN.md"` | Wave 1 complete |
| CRIT-01 | .impeccable/design.json existe na raiz do projeto | Smoke (arquivo) | `Test-Path ".impeccable/design.json"` | Wave 1 complete |
| CRIT-01 | 03-CRITIQUE.md existe com tabela P0/P1/P2 | Smoke (arquivo) | `Test-Path ".planning/milestones/v1.2-phases/03-motion-critique/03-CRITIQUE.md"` | Wave 2 complete |

> Nota: CRIT-01 e um processo de analise humana/LLM. As verificacoes acima confirmam que os artefatos foram gerados — nao ha testes de comportamento de UI automaticos para esta phase.

## Sampling Rate

- Por task: verificacao manual de existencia de arquivo
- Por wave: smoke tests (Test-Path) para os 4 artefatos
- Phase gate: todos os 4 Test-Path retornam True + 03-CRITIQUE.md tem pelo menos 5 linhas de conteudo (tabela nao vazia)