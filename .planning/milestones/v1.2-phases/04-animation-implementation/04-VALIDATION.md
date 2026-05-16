---
phase: 04
phase-slug: animation-implementation
date: 2026-05-16
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

| Req ID | Comportamento | Tipo | Comando | Arquivo |
|--------|--------------|------|---------|---------|
| ANIM-01 | HeroMotion renderiza motion.div filhos com staggerChildren: 0.12 | unit | `npx vitest run tests/unit/components/HeroMotion.test.tsx` | Existe — ATUALIZAR mock |
| ANIM-01 | trigger é animate (load), não whileInView | unit | idem | idem |
| ANIM-02 | IO callback adiciona data-revealed quando isIntersecting=true | unit | `npx vitest run tests/unit/components/` | Novo teste IO |
| ANIM-03 | Nenhuma string "easeOut" permanece nos componentes afetados | grep | `grep -r "easeOut" src/` | verificação pós-edição |
| ANIM-03 | CSS usa var(--ease-micro) onde havia ease-out genérico | grep | `grep "ease-out" src/components/ui/Button.astro` | verificação pós-edição |
| ANIM-04 | SettingsToggle renderiza motion.span para indicador com animate.x | unit | `npx vitest run tests/unit/components/SettingsToggle.test.ts` | Existe — ATUALIZAR |
| ANIM-04 | motion.span label tem animate.opacity | unit | idem | idem |
| ANIM-05 | .bonus-card e .price-includes li têm data-stagger e style animation-delay | unit/HTML | `npx vitest run tests/unit/components/` | verificar se Bonuses.test existe |

## Sampling Rate

- **Por task commit:** testes do componente modificado
- **Por wave:** `npm run test:unit`
- **Phase gate:** suite completa verde antes de `/gsd:verify-work`

## Wave 0 Gaps (testes a criar ou atualizar antes da implementação)

- [ ] `tests/unit/components/HeroMotion.test.tsx` — atualizar mock para variants + staggerChildren + múltiplos motion.div filhos (plano 04-03)
- [ ] `tests/unit/components/SettingsToggle.test.ts` — adicionar mock de motion/react, testar motion.span indicador e label (plano 04-05)

## Smoke Tests (validação pós-execução)

```powershell
# A partir de C:\Repo\landing-page\deep-dive-vm

# 1. Suite unitária completa
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

# 6. data-reveal nas 8 seções
@("Method.astro","Curriculum.astro","Bonuses.astro","Faq.astro","ForWho.astro","Mentor.astro","PainPoints.astro","Testimonials.astro") | ForEach-Object {
    Select-String -Path "src/components/sections/$_" -Pattern "data-reveal" | Select-Object -First 1
}

# 7. CSS custom properties definidas em Layout.astro
Select-String -Path "src/layouts/Layout.astro" -Pattern "--ease-entrance"
Select-String -Path "src/layouts/Layout.astro" -Pattern "--ease-micro"
```