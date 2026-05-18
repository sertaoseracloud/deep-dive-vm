---
phase: 09-python-neurodivergentes
plan: "03"
subsystem: testing
tags: [playwright, vitest, e2e, seo, axe-core, a11y]

requires:
  - phase: 09-02
    provides: built dist/deep-dive-python-neurodivergentes/index.html with og:image python-neurodivergentes-og.png and sitemap entry

provides:
  - tests/e2e/python-lp.spec.ts — 9-test Playwright spec for Python LP (HTTP 200, h1, CTAs, sections, a11y, responsive)
  - tests/e2e/hub.spec.ts — updated with toHaveCount(3) and Python active card link assertion
  - tests/seo/seo-meta.test.ts — tests 17 (og:image Python) and 18 (sitemap Python) added

affects:
  - CI pipeline (new spec files are auto-discovered by Playwright)
  - hub.spec.ts (now verifies 3 course cards and 2 active card links)

tech-stack:
  added: []
  patterns:
    - "E2E spec follows journeys.spec.ts pattern: describe-blocks per concern (load, a11y, responsive)"
    - "SEO test variables declared locally inside each it() block — never reuse module-level DIST_INDEX"
    - "Strict-mode locators with .first() when multiple matching elements exist"

key-files:
  created:
    - tests/e2e/python-lp.spec.ts
  modified:
    - tests/e2e/hub.spec.ts
    - tests/seo/seo-meta.test.ts

key-decisions:
  - "Added .first() to hub.spec.ts active card locators — now that 2 courses are active, strict mode would throw without it"
  - "pre-existing failures in Bonuses.test.ts and SettingsToggle.test.ts (15 tests) are out of scope and predate this wave"
  - "motion-accessibility.spec.ts has 2 pre-existing failures (hamburger JS) — not introduced by this plan"

patterns-established:
  - "python-lp.spec.ts: 3 describe blocks (load, accessibility, responsive) — standard LP E2E pattern"
  - "SEO pitfall 5 compliance: const pythonIndexPath declared inside it() block, never referencing DIST_INDEX"

requirements-completed:
  - PY-05

duration: 18min
completed: 2026-05-17
---

# Phase 09 Plan 03: Python Neurodivergentes — Testes E2E + SEO

**Suite de testes completa para LP Python: 9 specs Playwright (load/a11y/responsive), hub.spec.ts corrigido para 3 cards, e testes SEO 17-18 (og:image + sitemap) adicionados ao Vitest**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-17T23:15:00Z
- **Completed:** 2026-05-17T23:33:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Criado `tests/e2e/python-lp.spec.ts` com 9 testes cobrindo HTTP 200, h1 com "Python", CTAs primária/ghost, seções #investimento/#ementa, sticky CTA, skip link #main, axe-core WCAG 2.0, e responsivo mobile 375x812 — todos passam (10/10 Playwright)
- Corrigido `tests/e2e/hub.spec.ts`: `toHaveCount(2)` → `toHaveCount(3)` para course cards, adicionado `.first()` em locators strict-mode, novo test asserting link Python com `/deep-dive-python-neurodivergentes/` — todos os 15 testes passam
- Adicionados testes 17 e 18 a `tests/seo/seo-meta.test.ts`: og:image Python aponta para `python-neurodivergentes-og.png` e sitemap contém `deep-dive-python-neurodivergentes` — todos os 20 testes SEO passam

## Task Commits

1. **Task 1: python-lp.spec.ts + hub.spec.ts** — `3ba6ea4` (feat)
2. **Task 2: SEO tests 17 e 18** — `c52ce43` (feat)
3. **Plan metadata:** vide commit final (docs)

## Files Created/Modified

- `tests/e2e/python-lp.spec.ts` — Spec E2E novo: 3 describe blocks, 9 testes totais para LP Python
- `tests/e2e/hub.spec.ts` — Corrigido count 2→3, adicionado .first() em locators, novo test link Python
- `tests/seo/seo-meta.test.ts` — Testes 17 (og:image Python) e 18 (sitemap Python) inseridos antes do fechamento do describe

## Decisions Made

- Adicionado `.first()` aos locators `.course-card.active` em hub.spec.ts — necessário porque agora há 2 active cards (VM + Python); sem isso, Playwright strict mode lança erro com "resolved to 2 elements"
- Testes 17 e 18 usam variáveis locais dentro de cada `it()` (pitfall 5 compliance) — nunca reutilizam `DIST_INDEX` do escopo de módulo

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed strict-mode violation in hub.spec.ts for active course card locator**
- **Found during:** Task 1 (hub.spec.ts update)
- **Issue:** O teste `"active course card is visible"` usava `.course-card.active` sem `.first()`. Com 2 active cards (VM + Python), o Playwright strict mode lança erro: "resolved to 2 elements"
- **Fix:** Adicionado `.first()` ao locator em `toBeVisible()` e no teste de link `/deep-dive-vm/`
- **Files modified:** `tests/e2e/hub.spec.ts`
- **Verification:** `npx playwright test tests/e2e/hub.spec.ts --project=chromium` → PASS (15) FAIL (0)
- **Committed in:** `3ba6ea4` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Fix necessário para correção do comportamento com 2 active courses. Sem escopo extra.

## Issues Encountered

- Falhas preexistentes não relacionadas: `Bonuses.test.ts` (6 falhas) e `SettingsToggle.test.ts` (9 falhas) no Vitest, e 2 falhas em `motion-accessibility.spec.ts` (hamburger JS) no Playwright — todas confirmadas como preexistentes ao Wave 3 via git stash + re-run. Documentadas em deferred-items.

## Next Phase Readiness

- Suite completa de testes para LP Python está verde: 10/10 Playwright (python-lp), 15/15 Playwright (hub), 20/20 Vitest (seo-meta)
- Zero regressão introduzida em LP VM, hub, EC2
- PY-05 completo — LP Python tem cobertura de testes E2E + SEO

## Self-Check

- [x] `tests/e2e/python-lp.spec.ts` existe: FOUND
- [x] `tests/e2e/hub.spec.ts` contém `toHaveCount(3)`: FOUND
- [x] `tests/seo/seo-meta.test.ts` contém "17." e "18.": FOUND
- [x] Commit `3ba6ea4` existe: FOUND
- [x] Commit `c52ce43` existe: FOUND

## Self-Check: PASSED

---
*Phase: 09-python-neurodivergentes*
*Completed: 2026-05-17*
