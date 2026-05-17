---
status: complete
phase: 08-multi-lp-scaffold
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md]
started: 2026-05-17T00:00:00Z
updated: 2026-05-17T00:00:00Z
---

## Tests

### 1. EC2 coming-soon page carrega
expected: Página em /deep-dive-ec2/ carrega sem 404, heading visível, badge "Em breve" presente
result: pass

### 2. Sem CTA clicável e back-link para o hub
expected: Sem botão/link de compra, link de volta para / presente
result: pass

### 3. EC2 OG preview
expected: og:title, og:image aponta para ec2-og.png, og:url correto
result: pass

### 4. HOWTO-new-landing-page.md — 7 passos presentes
expected: Arquivo existe na raiz, contém 7 headings numerados
result: pass (verificado automaticamente via grep)

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
