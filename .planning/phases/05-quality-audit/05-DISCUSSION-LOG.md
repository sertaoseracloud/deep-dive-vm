# Phase 5: Quality Audit — Discussion Log

**Date:** 2026-05-16
**Duration:** ~15 min
**Areas covered:** 4/4

---

## Area 1: impeccable audit — como rodar (QUAL-01)

**Q1:** impeccable v2.1.9 só tem 'detect' (não existe 'audit'). Como rodar o gate de QUAL-01?
**Selected:** `npx impeccable detect` (rodar `npx impeccable detect src/ --json` e filtrar findings de performance)

**Q2:** O 'impeccable detect' deve rodar contra o quê?
**Selected:** `src/` (código-fonte) — mais rápido, sem servidor

**Decisão capturada:** D-AUDIT-01 — npx impeccable detect src/ --json contra código-fonte

---

## Area 2: reduced-motion — estratégia de verificação (QUAL-02)

**Q1:** Como verificar QUAL-02 (100% das animações v1.2 desativam)?
**Selected:** Playwright com emulação de mídia (`page.emulateMedia({ reducedMotion: 'reduce' })`)

**Q2:** Playwright já está configurado. Como adicionar?
**Selected:** Novo spec no `motion-accessibility.spec.ts` (arquivo existente)

**Q3:** O que os testes devem verificar?
**Selected:** CSS computed style — `getComputedStyle()` nas seções com [data-reveal], [data-stagger], .hero-stagger-item

**Decisão capturada:** D-AUDIT-02 — Playwright + emulateMedia + getComputedStyle em motion-accessibility.spec.ts

---

## Area 3: CLS — como medir (QUAL-03)

**Q1:** npm run lighthouse:ci já existe. Como usar para o gate QUAL-03?
**Selected:** Rodar `npm run lighthouse:ci` e verificar CLS no JSON gerado (numericValue <= 0.1)

**Q2:** O que fazer se CLS > 0.1?
**Selected:** Investigar e corrigir antes de fechar a fase (gate só fecha com verde)

**Decisão capturada:** D-AUDIT-03 — lighthouse:ci local + verificação numericValue <= 0.1 no JSON

---

## Area 4: estrutura dos planos

**Q1:** Como estruturar os planos?
**Selected:** 3 planos — um por QUAL requirement (05-01, 05-02, 05-03)

**Q2:** Paralelo ou sequência?
**Selected:** Sequência (05-01 → 05-02 → 05-03) — dependência lógica real (correções do detect afetam o que CLS mede)

**Decisão capturada:** D-PLAN-01 — 3 planos em waves sequenciais; D-PLAN-02 — gate deve passar antes de avançar

---

## Summary

4 decisões de implementação capturadas. Todas as 4 áreas discutidas e resolvidas.
Nenhuma ideia deferida.