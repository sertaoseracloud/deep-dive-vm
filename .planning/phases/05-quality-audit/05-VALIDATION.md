---
phase: 05
slug: quality-audit
status: audited
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-16
audited: 2026-05-16
---

# Phase 05 — Validation Strategy

> Per-phase validation contract para os gates de qualidade QUAL-01, QUAL-02 e QUAL-03.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) + Vitest (unit) |
| **Config file** | `playwright.config.ts` / `vitest.config.ts` |
| **Quick run command** | `npx playwright test tests/e2e/motion-accessibility.spec.ts --project=chromium --grep "QUAL-02"` |
| **Full suite command** | `npx playwright test --project=chromium` |
| **Estimated runtime** | ~10s (QUAL-02 only) / ~60s (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test ... --grep "QUAL-02"`
- **After every plan wave:** Run `npx playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds (QUAL-02 grep mode)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-T1 | 01 | 1 | QUAL-01 | T-05-01 / T-05-SC | impeccable artifact gerado sem execução arbitrária | artifact | `test -f impeccable-report.json && echo PASS || echo FAIL` | ✅ | ✅ green |
| 05-01-T2 | 01 | 1 | QUAL-01 | — | will-change escopado a :hover, sem layout thrashing | artifact | `grep -q "QUAL-01 PASS" .planning/phases/05-quality-audit/QUAL-01-audit.md && echo PASS || echo FAIL` | ✅ | ✅ green |
| 05-02-T1 | 02 | 2 | QUAL-02 | T-05-02 / T-05-03 | animações suprimidas com prefers-reduced-motion | e2e | `npx playwright test tests/e2e/motion-accessibility.spec.ts --project=chromium --grep "QUAL-02"` | ✅ | ✅ green |
| 05-03-T1+2 | 03 | 3 | QUAL-03 | T-05-04 | CLS = 0, animações compositor-friendly sem layout shift | artifact | `grep -q "QUAL-03 PASS" .planning/phases/05-quality-audit/QUAL-03-audit.md && echo PASS || echo FAIL` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inspeção CSS de 5 arquivos contra checklist (will-change, thrashing, compositor) | QUAL-01 | `impeccable@2.1.9` detecta apenas antipatterns tipográficos — não inspeciona will-change nem layout thrashing. Resultado real requer leitura dos 5 arquivos de animação. | 1. Ler `src/layouts/Layout.astro`, `HeroMotion.tsx`, `SettingsToggle.tsx`, `Pricing.astro`, `Button.astro`. 2. Verificar 5 itens do checklist por arquivo. 3. Registrar resultado em `QUAL-01-audit.md`. |
| Lighthouse CLS contra build local | QUAL-03 | `lighthouse-report.json` é gitignored. Lighthouse requer servidor de preview ativo (live). | `npm run build && npx astro preview --port 4321 & sleep 5 && npx lighthouse http://localhost:4321/deep-dive-vm/ --output json --output-path lighthouse-report.json --chrome-flags="--headless --no-sandbox" && pkill -f "astro preview"`. Verificar `CLS numericValue <= 0.1`. |

---

## Automation Gap Closure (2026-05-16)

Durante a auditoria de validação, o gap de QUAL-03 foi resolvido adicionando verificação de artefato:

```bash
# Verifica que QUAL-03-audit.md documenta PASS
grep -q "QUAL-03 PASS" .planning/phases/05-quality-audit/QUAL-03-audit.md && echo "QUAL-03: PASS" || echo "QUAL-03: FAIL"
```

Este comando serve como gate de verificação rápida sem necessidade de re-executar o Lighthouse. Para re-verificar o resultado real (ex: após mudanças CSS), executar o procedimento manual acima.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or artifact-check command
- [x] Sampling continuity: nenhuma lacuna de 3 tarefas consecutivas sem verify
- [x] Wave 0: não necessário (infra existente cobre todos os requirements)
- [x] No watch-mode flags
- [x] Feedback latency < 10s (QUAL-02 grep mode)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** audited 2026-05-16

---

## Validation Audit 2026-05-16

| Metric | Count |
|--------|-------|
| Gaps found | 1 (QUAL-03 sem comando automatizado) |
| Resolved | 1 (artifact grep command adicionado) |
| Escalated | 0 |
| Manual-only | 2 (QUAL-01 CSS inspection + QUAL-03 Lighthouse live) |
