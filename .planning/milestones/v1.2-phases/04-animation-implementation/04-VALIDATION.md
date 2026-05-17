---
phase: 04
phase-slug: animation-implementation
date: 2026-05-16
nyquist_compliant: true
---

# Phase 04: Animation Implementation — Validation Strategy

## Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run | `npm run test:unit -- --reporter=dot` |
| Full suite | `npm run test:unit` |
| Build check | `npm run build` |

## Phase Requirements → Test Map

| Req ID | Comportamento | Status | Arquivo de Teste | Comando |
|--------|--------------|--------|-----------------|---------|
| ANIM-01 | HeroMotion renderiza motion.div filhos com staggerChildren: 0.12 (Path A) | COVERED | `tests/unit/components/HeroMotion.test.tsx` | `npx vitest run tests/unit/components/HeroMotion.test.tsx` |
| ANIM-01 | trigger é `animate` (load), não `whileInView` | COVERED | idem | idem |
| ANIM-02 | IO script adiciona `data-revealed` quando `isIntersecting=true` | COVERED | `tests/unit/components/Layout.test.ts` | `npx vitest run tests/unit/components/Layout.test.ts` |
| ANIM-02 | fire-once: `unobserve` chamado após revelar | COVERED | idem | idem |
| ANIM-02 | cleanup `astro:before-swap` → `disconnect` | COVERED | idem | idem |
| ANIM-03 | Nenhum `"easeOut"` permanece nos componentes | COVERED | grep smoke test | `grep -r '"easeOut"' src/components/` |
| ANIM-03 | CSS usa `var(--ease-micro)` onde havia `ease-out` | COVERED | grep smoke test | `grep "ease-out" src/components/ui/Button.astro` |
| ANIM-04 | SettingsToggle renderiza `motion.span` indicador com `animate.x` | COVERED | `tests/unit/components/SettingsToggle.test.ts` | `npx vitest run tests/unit/components/SettingsToggle.test.ts` |
| ANIM-04 | `motion.span` label tem `animate.opacity` 1/0.4 | COVERED | idem | idem |
| ANIM-05 | `.bonus-card` tem `data-stagger` + `animation-delay` 0/80/160ms | COVERED | `tests/unit/components/Bonuses.test.ts` | `npx vitest run tests/unit/components/Bonuses.test.ts` |
| ANIM-05 | `.price-includes li` tem `data-stagger` + delays 0–560ms | COVERED | `tests/unit/components/Pricing.test.ts` | `npx vitest run tests/unit/components/Pricing.test.ts` |

## Sampling Rate

- **Por task commit:** testes do componente modificado
- **Por wave:** `npm run test:unit`
- **Phase gate:** suite completa verde antes de `/gsd:verify-work`

## Smoke Tests (validação pós-execução)

```powershell
# A partir de C:\Repo\landing-page\deep-dive-vm

# 1. Suite unitária completa (180 testes)
npm run test:unit

# 2. Build TypeScript sem erros
npm run build

# 3. Nenhum easing genérico permanece
grep -r '"easeOut"' src/components/ | Select-String -NotMatch "node_modules"
grep -r "ease-out" src/components/ui/Button.astro src/components/layout/NavBar.astro

# 4. staggerChildren presente no HeroMotion
grep "staggerChildren" src/components/HeroMotion.tsx

# 5. motion.span presente no SettingsToggle
grep "motion.span" src/components/SettingsToggle.tsx

# 6. data-reveal nas 9 secoes (8 + Pricing)
grep -rl "data-reveal" src/components/sections/ | Measure-Object -Line

# 7. CSS custom properties definidas em Layout.astro
Select-String -Path "src/layouts/Layout.astro" -Pattern "--ease-entrance"
Select-String -Path "src/layouts/Layout.astro" -Pattern "--ease-micro"
```

## Validation Audit 2026-05-16

| Metrica | Contagem |
|---------|----------|
| Gaps encontrados | 3 |
| Resolvidos | 3 |
| Escalados | 0 |

Gaps preenchidos:
- ANIM-02: 6 novos testes em `Layout.test.ts` (IntersectionObserver mock)
- ANIM-05 Bonuses: 8 novos testes em `Bonuses.test.ts` (static HTML analysis)
- ANIM-05 Pricing: 8 novos testes em `Pricing.test.ts` (static HTML analysis)

Suite final: **180 testes passando, 0 falhas**