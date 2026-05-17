---
status: testing
phase: 07-hub-page
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md]
started: 2026-05-17T00:00:00Z
updated: 2026-05-17T00:00:00Z
---

## Current Test

number: 1
name: Mentor identity visible on hub
expected: |
  Abrindo mentoria.sertaoseracloud.com/ (ou localhost:4321/ após npm run preview):
  - Foto do mentor aparece na página
  - h1 com nome "Cláudio Filipe Lima Raposo" visível
  - Tagline de bio visível (ex: "Systems Architect · 2× MVP Microsoft · Docker Captain")
awaiting: user response

## Tests

### 1. Mentor identity visible on hub
expected: Foto do mentor aparece na página, h1 com nome "Cláudio Filipe Lima Raposo" visível, tagline de bio presente
result: blocked
blocked_by: server
reason: "GitHub Pages retorna 404 — alterações ainda não foram publicadas no remote"

### 2. Course cards — VM ativo e EC2 "Em breve"
expected: |
  2 cards de cursos visíveis:
  - Card "Deep Dive VM" com link clicável apontando para /deep-dive-vm/
  - Card "Deep Dive EC2" com badge "Em breve" SEM link (não clicável)
result: [pending]

### 3. Social icon links — 3 redes ativas
expected: |
  3 ícones de redes sociais visíveis com links:
  - Instagram → instagram.com/sertaoseracloud
  - YouTube → youtube.com/@sertaoseracloud
  - LinkedIn → linkedin.com/in/cfraposo/
  Cada link abre em nova aba com rel="noopener"
result: [pending]

### 4. Preview rico ao compartilhar URL do hub
expected: |
  Abrindo https://metatags.io (ou similar) com a URL do hub:
  - og:title presente (título do mentor/hub)
  - og:description presente
  - og:image aponta para hub-og.png (imagem 1200×630 gerada)
  - og:url = https://mentoria.sertaoseracloud.com/
result: [pending]

### 5. Hub indexado — sem noindex
expected: |
  No HTML de dist/index.html (ou inspecionando a página):
  - NÃO existe meta tag robots=noindex
  - Hub aparece no sitemap (mentoria.sertaoseracloud.com/sitemap-index.xml contém a rota raiz)
result: [pending]

### 6. Skip-link de acessibilidade funciona
expected: |
  Pressionando Tab na página do hub:
  - Link "Pular para o conteúdo" aparece visível no topo
  - Clicando nele ou pressionando Enter, o foco pula para o conteúdo principal
result: [pending]

### 7. Layout mobile — sem overflow horizontal (375px)
expected: |
  Redimensionando o browser para 375px de largura (ou DevTools mobile):
  - h1 visível
  - Cards e ícones sociais visíveis e legíveis
  - Nenhuma barra de scroll horizontal
result: [pending]

### 8. Landing Page /deep-dive-vm/ não regrediu
expected: |
  Abrindo mentoria.sertaoseracloud.com/deep-dive-vm/:
  - Página carrega normalmente (sem 404)
  - Hero, preços e demais seções da LP aparecem intactos
  - URL não redirecionou
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0

## Gaps

[none yet]
