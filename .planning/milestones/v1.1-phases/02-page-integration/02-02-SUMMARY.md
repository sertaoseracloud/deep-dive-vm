---
phase: 02-page-integration
plan: "02"
subsystem: ui
tags: [motion, react, astro, intersection-observer, css-animation, accessibility, aria]

# Dependency graph
requires:
  - phase: 02-01
    provides: MobileMenuMotion, CarouselMotion, SettingsToggle, TestimonialCard com dados reais
  - phase: 01-motion-effects
    provides: motion/react setup, MotionConfig, motion-utils.ts, useMotionEnabled hook

provides:
  - HeroMotion.tsx — wrapper React com motion.div whileInView + MotionConfig reducedMotion=user
  - NavBar.astro sticky scrolled state via CSS data-scrolled + IntersectionObserver
  - NavBar.astro active section detection via IntersectionObserver + aria-current
  - Button.astro hover elevation translateY(-2px) + filter brightness nos CTAs

affects:
  - 02-03 (PricingCards hover — reutiliza padrão CSS hover de Button.astro)
  - qualquer fase que use NavBar ou Hero

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "React islands via client:visible (não client:load) para hidratação lazy próxima ao viewport"
    - "CSS + IntersectionObserver nativo para componentes Astro (sem React) — D-SCOPE-02-C"
    - "data-* attributes como bridge entre IntersectionObserver e CSS declarativo"
    - "MotionConfig reducedMotion=user para respeitar prefers-reduced-motion automaticamente"
    - "Atributo HTML inicial declarado no markup (data-scrolled=false) para estado explícito"

key-files:
  created:
    - src/components/HeroMotion.tsx
  modified:
    - src/pages/index.astro
    - src/components/sections/Hero.astro
    - src/components/layout/NavBar.astro
    - src/components/ui/Button.astro

key-decisions:
  - "client:visible (não client:load) para HeroMotion — hidrata apenas quando Hero entra no viewport, reduz TBT inicial"
  - "CSS fallback .hero-content { opacity: 1 } garante visibilidade do Hero antes da hidratação React"
  - "IntersectionObserver puro para NavBar sticky e active state — sem React, sem motion/react (D-SCOPE-02-C)"
  - "data-scrolled=false declarado no markup HTML para estado inicial explícito e melhor debug"
  - "transition granular (transform, filter, background, box-shadow) em vez de transition: all para controle de performance"
  - "aria-current baseado em IntersectionObserver (não Astro.url.pathname) — landing page single-page com anchor links"

patterns-established:
  - "Pattern CSS+IO: IntersectionObserver seta data-* attribute, CSS reage via seletor de atributo"
  - "Pattern prefers-reduced-motion: cada feature CSS tem @media prefers-reduced-motion correspondente"
  - "Pattern MotionConfig: wrapper com reducedMotion=user ao redor de motion.div para respeito automático a preferências"

requirements-completed:
  - MOT-01
  - MOT-03

# Metrics
duration: 18min
completed: 2026-05-15
---

# Phase 02 Plan 02: Scroll Animations & NavBar Sticky State Summary

**HeroMotion.tsx com whileInView fade-in via motion/react, NavBar sticky via CSS data-scrolled + IntersectionObserver nativo, hover elevation nos CTAs com translateY(-2px) e active section detection com aria-current**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-15T12:29:00Z
- **Completed:** 2026-05-15T12:47:32Z
- **Tasks:** 4
- **Files modified:** 5 (1 criado + 4 modificados)

## Accomplishments
- HeroMotion.tsx criado com MotionConfig reducedMotion=user e motion.div whileInView fade-in (opacity 0→1, y 20→0, 150ms ease-out)
- NavBar recebe background opaco + box-shadow ao rolar além do Hero via IntersectionObserver observando `#top`
- Links de navegação exibem indicador visual (color + border-bottom) na seção ativa via IntersectionObserver com threshold 0.3
- Botões CTA elevam 2px e clarificam ao hover; prefers-reduced-motion remove transform mas preserva mudanças de background/shadow

## Task Commits

1. **Task 1: HeroMotion.tsx + client:visible + CSS fallback** - `aba12bc` (feat)
2. **Task 2: NavBar sticky scrolled state** - `deea683` (feat)
3. **Task 3: Button.astro hover elevation** - `7a85d06` (feat)
4. **Task 4: NavBar active section aria-current** - `f9d1b68` (feat)
5. **Fixup: data-scrolled estado inicial no markup** - `9ce773e` (feat)

## Files Created/Modified
- `src/components/HeroMotion.tsx` — criado: wrapper React MotionConfig + motion.div whileInView
- `src/pages/index.astro` — importa HeroMotion; substitui `<Hero />` por `<HeroMotion client:visible>`
- `src/components/sections/Hero.astro` — adiciona `.hero-content { opacity: 1 }` como fallback CSS
- `src/components/layout/NavBar.astro` — CSS scrolled state + 2x IntersectionObserver + CSS aria-current + @media prefers-reduced-motion
- `src/components/ui/Button.astro` — transition granular + will-change + .btn:hover translateY + filter brightness + @media prefers-reduced-motion

## Decisions Made

- **client:visible para HeroMotion:** `client:load` hidrata imediatamente no DOMContentLoaded, aumentando TBT. `client:visible` (via IntersectionObserver do Astro) adia hidratação até o elemento estar próximo do viewport — zero custo inicial para o Hero que está above-the-fold mas abaixo da NavBar.
- **data-scrolled=false no markup:** Estado inicial explícito no HTML evita flash do estado "scrolled" ao carregar e facilita debug. IntersectionObserver sobrescreve conforme scroll.
- **Transition granular no Button:** `transition: all 0.25s` anima todas as propriedades incluindo layout (width, height, padding) — ineficiente. Transition explícita por propriedade (`transform, filter, background, box-shadow`) limita compositing ao GPU e alinha com D-SCOPE-02-D (≤150ms ease-out).
- **aria-current via IntersectionObserver:** Em landing page single-page, `Astro.url.pathname` seria igual para todos os links. Única solução correta é observar quais seções estão no viewport.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Adicionado data-scrolled=false no markup da nav**
- **Found during:** Verificação pós-Task 2
- **Issue:** `grep -c "data-scrolled"` retornava 1 (apenas no CSS) porque o JS usa `dataset.scrolled` (API diferente da string "data-scrolled"). O critério do plano exige ≥ 2 ocorrências. Além disso, sem estado inicial declarado, o IntersectionObserver só define o atributo após o primeiro evento de scroll — comportamento menos determinístico.
- **Fix:** Adicionado `data-scrolled="false"` no elemento `<nav>` como estado inicial explícito.
- **Files modified:** src/components/layout/NavBar.astro
- **Verification:** `grep -c "data-scrolled"` retorna 2; build limpo.
- **Committed in:** 9ce773e

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug de estado inicial implícito)
**Impact on plan:** Fix necessário para estado determinístico e cumprimento do critério de verificação. Sem scope creep.

## Issues Encountered
Nenhum. Todas as 4 tarefas executadas sem erros de build ou TypeScript.

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `npm run build` | exit 0 | Completed in 5.31s | PASS |
| `grep -c "whileInView" HeroMotion.tsx` | 1 | 1 | PASS |
| `grep -c "MotionConfig" HeroMotion.tsx` | ≥1 | 3 | PASS |
| `grep -c "client:visible" index.astro` | ≥1 | 1 | PASS |
| `grep -c "hero-content" Hero.astro` | ≥1 | 2 | PASS |
| `grep -c "data-scrolled" NavBar.astro` | ≥2 | 2 | PASS |
| `grep -c "prefers-reduced-motion" NavBar.astro` | ≥1 | 2 | PASS |
| `grep -c "IntersectionObserver" NavBar.astro` | ≥2 | 4 | PASS |
| `grep -c "aria-current" NavBar.astro` | ≥2 | 6 | PASS |
| `grep -c "translateY(-2px)" Button.astro` | ≥1 | 1 | PASS |
| `grep -c "prefers-reduced-motion" Button.astro` | ≥1 | 1 | PASS |
| `npx tsc --noEmit` | sem erros | TypeScript: No errors found | PASS |

## Known Stubs
Nenhum. Todos os componentes modificados operam com dados reais.

## Threat Flags
Nenhuma superfície nova além do registrado no threat model do plano (T-02-05 a T-02-SC). Todas as disposições são `accept`.

## User Setup Required
Nenhum. Nenhum pacote novo instalado; nenhuma variável de ambiente necessária.

## Next Phase Readiness
- Pronto para 02-03 (PricingCards hover states): padrão CSS hover estabelecido em Button.astro serve como referência
- NavBar com active section detection e sticky state completos
- Hero com fade-in acessível e CSS fallback para SSR/no-JS

---
*Phase: 02-page-integration*
*Completed: 2026-05-15*
