# Milestones

## v1.0 Testing & SEO Optimization (Shipped: 2026-05-12)

**Phases completed:** 4 phases, 10 plans, 9 tasks

**Key accomplishments:**

- 1. [Rule 1 - Bug] SEO title exceeded 60-character limit
- One-liner:
- Three new Vitest SEO assertions for JSON-LD schema, heading hierarchy, and sitemap presence appended to the existing 10-test suite, plus vitest.config.ts fix enabling test discovery for tests/seo/
- 1. [Rule 1 - Bug] Fixed missing og:description in built HTML (pre-existing Test 4 failure)
- Phase 3 gate verified green: Lighthouse Performance 91, SEO 100, Accessibility 96, all 13 Vitest SEO assertions passing, 3 WebP images in dist/_astro, preload font pattern confirmed, and sitemap-index.xml present
- GitHub Actions weekly cron scaffold triggering Lighthouse CI on Sunday midnight UTC, independent of push/PR gate, with contents:write permission and fetch-depth:0 pre-wired for Plan 04-04 filesystem commit integration

---

## v1.1 Motion Effects Implementation (Shipped: 2026-05-15)

**Phases completed:** 2 phases (Phase 1, Phase 2), 6 plans

**Key accomplishments:**

- motion@12.38.0 integrado: CarouselMotion, MobileMenuMotion, SettingsToggle reescritos com motion/react
- Hero Section fade-in whileInView, NavBar sticky + active section detection implementados
- Pricing Card hover elevation, Button CTA hover lift com spring transitions
- 136+ testes unitários + E2E coverage (WCAG 2.1 AA, axe-core)
- useMotionEnabled hook + prefers-reduced-motion override no localStorage

---

## v1.2 Animation Polish (Shipped: 2026-05-16)

**Phases completed:** 3 phases (Phase 3, 4, 5), 11 plans, ~49 commits
**Files changed:** 146 | +27.849 / -355 linhas
**Timeline:** 2026-05-15 → 2026-05-16 (2 dias)

**Key accomplishments:**

- Impeccable critique executada: 5×P0/6×P1/2×P2 gaps identificados cobrindo todos os ANIM-IDs — inventário guiando toda a implementação de Phase 4
- Hero stagger orquestrado: HeroMotion refatorado com staggerChildren:0.12 + ease [0.25,1,0.5,1]; HeroMotionSingle com querySelectorAll + .hero-stagger-item CSS para o path de produção
- 8 seções com scroll-triggered reveals via IntersectionObserver + data-reveal/data-stagger CSS (CSS vars --ease-entrance e --ease-micro)
- SettingsToggle animado: motion.span indicator com spring {stiffness:400, damping:30} + label opacity fade + MotionConfig reducedMotion="user"
- Quality gates PASS: QUAL-01 (25/25 CSS inspection), QUAL-02 (4/4 Playwright reduced-motion), QUAL-03 (CLS=0 via Lighthouse)
- 180 testes unitários passando + 4 novos testes E2E de reduced-motion compliance

**Known Gaps (accepted as tech debt):**
- ANIM-03 partial: Button.astro, NavBar.astro, SettingsToggle.tsx:123 easing P1 gaps
- QUAL-02 partial: locator aria-label mismatch PT/EN no teste SettingsToggle após WR-02 fix

Known deferred items at close: 2 gaps (see .planning/milestones/v1.2-MILESTONE-AUDIT.md)

---
