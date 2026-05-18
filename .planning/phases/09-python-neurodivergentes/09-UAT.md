---
status: complete
phase: 09-python-neurodivergentes
source: 09-01-SUMMARY.md, 09-02-SUMMARY.md, 09-03-SUMMARY.md
started: 2026-05-18T09:00:00Z
updated: 2026-05-18T09:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Pricing — grid de 3 planos visível
expected: Abrindo http://localhost:4321/deep-dive-python-neurodivergentes/#investimento no browser, a seção Pricing exibe um grid com 3 cards lado a lado (desktop). O título da seção é "Três caminhos. Você escolhe." e o lede diz "Acesso por 12 meses em todos os planos."
result: pass

### 2. Tier 1 — Curso Solo
expected: O primeiro card (à esquerda) exibe tier "DEEP DIVE · PYTHON", título "Curso Solo", preço "R$ 59" (sem parcelas), nota "À vista no PIX · acesso imediato.", 6 itens incluídos com checkmark ciano, e 1 item excluído "Sem sessões 1:1 com o professor" com X e opacidade reduzida. O botão CTA é ghost "Quero o curso solo".
result: pass

### 3. Tier 2 — Curso + 4 Sessões (featured)
expected: O card central exibe ribbon "⟡ MAIS ESCOLHIDO · 4 SESSÕES 1:1", tier "DEEP DIVE · PYTHON + 4 SESSÕES", título "Curso + 4 Sessões 1:1", preço "12× R$ 53,92" e "OU R$ 647 à vista no PIX", 5 itens incluídos. O botão CTA é primary "Quero curso + 4 sessões". O card central tem borda e sombra mais evidentes que os demais.
result: pass

### 4. Tier 3 — Curso + 6 Sessões
expected: O terceiro card (à direita) exibe tier "DEEP DIVE · PYTHON + MENTORIA", título "Curso + 6 Sessões 1:1", preço "12× R$ 78,92" e "OU R$ 947 à vista no PIX", 6 itens incluídos. O botão CTA é ghost "Quero curso + 6 sessões".
result: pass

### 5. Guarantee — presente abaixo do grid
expected: Abaixo dos 3 cards (e do price-secure badges), aparece o selo de garantia circular "7 / DIAS" com o texto "Garantia incondicional de 7 dias." e o corpo explicativo mencionando "100% do investimento".
result: pass

### 6. StickyCta — preço atualizado
expected: Em viewport mobile (largura < 720px), a barra sticky exibe "DESDE R$ 59 · à vista" (antes era "12× R$ 78,92"). O botão "Quero começar →" ainda funciona e leva para #investimento.
result: pass

### 7. VM LP — Pricing sem regressão
expected: Abrindo http://localhost:4321/deep-dive-vm/#investimento no browser, a seção Pricing exibe o card único com ribbon "⟡ ACESSO COMPLETO · ECONOMIA DE R$ 1.050", tier "DEEP DIVE · VM", preço 12× R$ 78,92, 8 includes e o botão primário — sem grid de 3 cards.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
