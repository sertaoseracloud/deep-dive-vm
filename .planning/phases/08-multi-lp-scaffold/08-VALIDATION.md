---
phase: 8
slug: multi-lp-scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 (unit/SEO) + Playwright 1.59.1 (E2E) |
| **Config file** | `vitest.config.ts` / `playwright.config.ts` |
| **Quick run command** | `npm run build && npx playwright test --project=chromium tests/e2e/ec2-coming-soon.spec.ts` |
| **Full suite command** | `npm run build && npm run test:all && npx playwright test` |
| **Estimated runtime** | ~90 seconds (build ~5s + unit ~10s + E2E ~75s) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build && npx playwright test --project=chromium tests/e2e/ec2-coming-soon.spec.ts`
- **After every plan wave:** Run `npm run build && npm run test:all && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| T1: ec2-og.png placeholder | 08-01 | 1 | SCAFF-01 | T-08-01 | Asset estático servido de public/ — script sharp descartado após uso | source | `node -e "const {statSync}=require('fs'); const s=statSync('public/ec2-og.png'); console.log('OK', s.size, 'bytes')"` | ❌ Wave 0 | ⬜ pending |
| T2: src/pages/deep-dive-ec2/index.astro | 08-01 | 1 | SCAFF-01 | T-08-02 | ogImage é string literal hardcoded — sem interpolação de dados externos | build + E2E | `npm run build && npx playwright test tests/e2e/ec2-coming-soon.spec.ts --project=chromium` | ❌ Wave 0 | ⬜ pending |
| T3: tests/e2e/ec2-coming-soon.spec.ts | 08-01 | 1 | SCAFF-01 | — | E2E verifica HTTP 200, h1, badge, back-link, a11y, responsivo | e2e | `npx playwright test tests/e2e/ec2-coming-soon.spec.ts` | ❌ Wave 0 | ⬜ pending |
| T4: Teste 16 em seo-meta.test.ts | 08-01 | 1 | SCAFF-01 | — | og:image do EC2 aponta para ec2-og.png no HTML compilado | unit/SEO | `npm run test:unit` | ❌ Wave 0 (linha extra em arquivo existente) | ⬜ pending |
| T5: HOWTO-new-landing-page.md | 08-02 | 2 | SCAFF-02 | — | Documento estático verificado por existência e leitura | manual | `test -f HOWTO-new-landing-page.md && echo OK` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `public/ec2-og.png` — pré-requisito para build não gerar og:image quebrada; deve existir antes do build
- [ ] `src/pages/deep-dive-ec2/index.astro` — a rota EC2 em si (SCAFF-01)
- [ ] `tests/e2e/ec2-coming-soon.spec.ts` — spec E2E para SCAFF-01
- [ ] `tests/seo/seo-meta.test.ts` — adicionar teste 16 (uma linha de `it()`)
- [ ] `HOWTO-new-landing-page.md` — documento SCAFF-02 na raiz do repositório

*Infraestrutura existente (Vitest + Playwright + 114 testes passando) cobre todos os requisitos. Apenas novos arquivos e um teste incremental são necessários.*

---

## Threat Model

| Threat ID | Threat | Mitigated By |
|-----------|--------|-------------|
| T-08-01 | Script sharp com acesso ao filesystem | Script descartado após uso inline (stdin); acessa apenas `src/assets/` e `public/` — sem commit do script |
| T-08-02 | ogImage URL com conteúdo dinâmico | `ogImage="/ec2-og.png"` é string literal hardcoded na página — sem interpolação de query params ou cookies |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Página EC2 indexada pelo Google (sem noindex) | SCAFF-01 | grep no HTML gerado é suficiente | `grep -c "noindex" dist/deep-dive-ec2/index.html` deve retornar 0 |
| HOWTO descreve os passos corretos e completos | SCAFF-02 | Verificação semântica — conteúdo não pode ser automatizado | Ler HOWTO-new-landing-page.md e confirmar 7 passos presentes: criar página, courses.ts, og:image, spec E2E, teste SEO, validar, deploy |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
