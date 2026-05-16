# Project Retrospective

## Milestone: v1.0 — Testing & SEO Optimization

**Shipped:** 2026-05-12
**Phases:** 4 | **Plans:** 10

### What Was Built

- Vitest unit + integration suite — 106 tests covering all Astro components, content collection schemas, and route generation with Zod validation
- Playwright E2E — home page journeys, keyboard navigation (skip links, tab flow), 3-browser matrix (Chromium, Firefox, WebKit + mobile viewports)
- SEO optimization — Lighthouse SEO 100, Performance 91, Accessibility 96; JSON-LD structured data, WebP images, sitemap, heading hierarchy enforcement
- Continuous validation CI — 95% coverage gate, shields.io live badge from `badges` orphan branch, weekly Lighthouse cron (Sunday midnight UTC), LHCI filesystem persistence to `lhci-results` branch

### What Worked

- **GSD discuss → plan → execute workflow**: Locked decisions early (filesystem LHCI, `[skip ci]` convention) prevented rework during execution
- **Code review gate**: Caught 3 critical issues (CI loop risk, over-privileged permissions, unbounded main branch bloat) before phase was marked complete
- **Wave-based execution**: Phase 4 ran all 4 plans across 2 waves, detecting file overlap (04-01 + 04-02 both modify test.yml) and serializing correctly
- **Verifier agent**: Re-ran after CR fixes and accepted D-12 override (lhci-results vs main) with documented rationale — no false-positive gap

### What Was Inefficient

- **LHCI persistence decision flip**: Originally planned SQLite, then switched to filesystem in discuss-phase; the CONTEXT.md change forced a full replan of 04-04 (extra loop)
- **VERIFICATION.md stale after CR fixes**: Items 12/13 referenced "push to main" after CR-03 changed it to `lhci-results` — required re-verification pass
- **gsd-code-fixer spawn rejected mid-session**: Code fixes had to be applied in a subsequent session; continuity breaks cost context

### Patterns Established

- `.lighthouseci/` should never be committed to main — orphan branch is the right pattern for binary/JSON audit artifacts
- Machine commits MUST include `[skip ci]` — make this a D-13-style hard rule in all future CI-writing phases
- Phase 4 "continuous validation" is a reusable phase type: coverage gate + badge + weekly audit + CI persistence

### Key Lessons

- Lock CI-interaction decisions (machine commits, permissions, loop prevention) in discuss-phase before planning — they cascade across all plans in a phase
- `github.actor != 'github-actions[bot]'` guard is cheaper to add upfront than to fix post-review
- `bc` is not guaranteed on minimal runner images — always use bash integer arithmetic for CI scripts

### Cost Observations

- Model mix: sonnet-4.6 (orchestrator + executor), opus for planner/checker
- Sessions: ~3 sessions (discuss, plan+execute, execute continuation + code review + verify + complete)
- Notable: Re-verification after code review fixes was fast (~2.5 min) because verifier context is bounded and focused

## Milestone: v1.2 — Animation Polish

**Shipped:** 2026-05-16
**Phases:** 3 (Phase 3, 4, 5) | **Plans:** 11 | **Commits:** ~49

### What Was Built

- Impeccable critique: 5×P0 / 6×P1 / 2×P2 gaps identificados, cobrindo todos os ANIM-IDs — inventário guiou toda a implementação de Phase 4
- Hero stagger: HeroMotion refatorado com staggerChildren:0.12 + ease [0.25,1,0.5,1]; HeroMotionSingle com querySelectorAll + .hero-stagger-item CSS (dual-path para single-child em produção)
- 8 seções com scroll-triggered reveals via IntersectionObserver + CSS vars --ease-entrance/--ease-micro; @keyframes fade-up
- SettingsToggle animado: motion.span indicator spring {stiffness:400, damping:30} + label opacity fade + MotionConfig reducedMotion="user"
- Stagger coordenado: bonus-card (0/80/160ms) e price-includes li (0–560ms, step 80ms) via data-stagger + animation-delay inline
- Quality gates: QUAL-01 (25/25 inspeção manual), QUAL-02 (4/4 Playwright), QUAL-03 (CLS=0 Lighthouse)
- 180 testes unitários passando + 4 novos E2E reduced-motion tests

### What Worked

- **Impeccable critique como input estruturado**: 5×P0 bem definidos evitaram ambiguidade no plano de animação — todos endereçados em Phase 4
- **CSS + IntersectionObserver para seções Astro**: Sem overhead React, testável via unit tests de HTML estático, zero deps adicionais
- **TDD no HeroMotion e SettingsToggle**: Testes escritos antes da implementação capturaram o dual-path problem do HeroMotion antecipadamente
- **Code review gate**: CR-01 (aria-live popover sempre montado) e WR-01/02 (toggle inativo + label PT) capturados antes de ship
- **D-AUDIT-03 (localhost em vez de produção)**: Evitou spoofing de URL no Lighthouse CLS — pattern documentado para futuros audits

### What Was Inefficient

- **Locator PT/EN mismatch no QUAL-02**: Fix WR-02 (aria-label PT) não atualizou o teste Group 2 correspondente — causa o test always-skip. Custo de descoberta: integration checker no audit
- **Nenhum VERIFICATION.md em nenhuma fase**: Fases executadas fora do workflow execute-phase — gaps não detectados formalmente até o audit de milestone
- **Testimonials.astro dead code**: data-reveal adicionado a um arquivo nunca renderizado em index.astro — cleanup necessário
- **impeccable v2.1.9 detecta só tipografia**: D-AUDIT-01 exigiu inspeção manual para QUAL-01 — ferramenta não cobre CSS performance. Documentar limitação antes de usar em futuros audits

### Patterns Established

- `emulateMedia({ reducedMotion: 'reduce' })` DEVE ser chamado ANTES de `page.goto()` em todos os testes Playwright de reduced-motion (D-AUDIT-02)
- Lighthouse deve rodar contra localhost (não produção) para CLS confiável — validar `requestedUrl` contém localhost antes de aceitar resultado (D-AUDIT-03)
- Stagger pattern: section-pai com data-reveal + filhos com data-stagger + style animation-delay inline — sem JS extra, testável via grep/HTML estático
- MotionConfig reducedMotion="user" por componente (não page-level) + useMotionEnabled() dual-path — documentar arquitetura explicitamente

### Key Lessons

- Fix de aria-label num componente DEVE disparar update no(s) teste(s) que localizam pelo mesmo label — nunca atualizar um sem o outro
- Fases executadas fora do workflow execute-phase perdem VERIFICATION.md — preferir execute-phase mesmo para fases simples, ou criar VERIFICATION.md manualmente ao final
- Antes de usar uma ferramenta de audit (impeccable, Lighthouse), verificar o que ela cobre e documentar limitações — evita descobrir na execução

### Cost Observations

- Model mix: sonnet-4.6 (orchestrator + executor), sonnet para integration checker
- Sessions: ~3 sessions (phases 3+4, phase 5, audit+complete)
- Notable: Integration checker identificou locator mismatch que não seria detectado sem análise cross-phase — audit vale o custo

## Cross-Milestone Trends

| Metric | v1.0 | v1.2 |
|--------|------|------|
| Phases | 4 | 3 |
| Plans | 10 | 11 |
| Tests (unit) | 106 | 180 |
| Lighthouse SEO | 100 | 100 |
| Lighthouse Performance | 91 | 91 |
| Lighthouse CLS | — | 0 |
| Coverage gate | 95% | 95% |
| Code review findings | 7 (3 critical, 4 warning) | 8 (1 critical, 4 warning, 3 info) |
| Verification score | 16/16 | 7/9 (gaps aceitos como tech debt) |
