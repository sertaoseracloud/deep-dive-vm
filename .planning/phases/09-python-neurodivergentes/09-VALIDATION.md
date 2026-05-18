---
phase: 9
slug: python-neurodivergentes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^3.2.4 (SEO/unit) + Playwright ^1.59.1 (E2E) |
| **Config file** | `vitest.config.ts` / `playwright.config.ts` |
| **Quick run command** | `npx vitest run tests/seo/seo-meta.test.ts` |
| **Full suite command** | `npm run test:all && npx playwright test --project=chromium` |
| **Estimated runtime** | ~60–90 seconds (build required before Vitest/Playwright) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (smoke — exits 0, dist created)
- **After every plan wave:** Run `npm run test:all` (Vitest) + `npx playwright test --project=chromium` (E2E)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Automated Command | File Exists | Status |
|---------|------|------|-------------|-------------------|-------------|--------|
| 09-01-01 | 09-01 | 1 | PY-04, PY-03 | `npm run build` | ❌ W0 (OG PNG + data files) | ⬜ pending |
| 09-02-01 | 09-02 | 2 | PY-01, PY-02, PY-03 | `npm run build` | ❌ W0 (11 components refactored) | ⬜ pending |
| 09-02-02 | 09-02 | 2 | PY-01, PY-02, PY-04 | `npm run build` | ❌ W0 (index.astro + FinalCTA) | ⬜ pending |
| 09-03-01 | 09-03 | 3 | PY-05, PY-03 | `npx playwright test tests/e2e/python-lp.spec.ts tests/e2e/hub.spec.ts --project=chromium` | ❌ W0 (python-lp.spec.ts new) | ⬜ pending |
| 09-03-02 | 09-03 | 3 | PY-04, PY-05 | `npx vitest run tests/seo/seo-meta.test.ts` | ✅ (test 17-18 to add) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/python-lp.spec.ts` — novo spec cobrindo PY-01, PY-05 (HTTP 200, seções, CTA, a11y, mobile) — criado em Wave 3 (09-03)
- [ ] `tests/e2e/hub.spec.ts` linha 42 — atualizar `toHaveCount(2)` → `toHaveCount(3)` — cobertura PY-03 — criado em Wave 3 (09-03)
- [ ] `tests/seo/seo-meta.test.ts` — adicionar `it("17. ...")` python og:image e `it("18. ...")` sitemap — cobertura PY-04, PY-05 — criado em Wave 3 (09-03)
- [ ] `public/python-neurodivergentes-og.png` — gerado via sharp script em Wave 1 (09-01) antes de qualquer build

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Design visual fiel ao wireframe (cores, tipografia, layout) | PY-02 | Verificação visual — não automatizável sem screenshot comparison | Abrir `/deep-dive-python-neurodivergentes/` no browser; comparar cada seção com o wireframe HTML side-by-side |
| Social preview do OG image no WhatsApp/LinkedIn | PY-04 | Requer compartilhamento real ou ferramenta de debug de OG | Usar `opengraph.xyz` para testar URL do staging OU verificar `<meta property="og:image">` no HTML gerado |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
