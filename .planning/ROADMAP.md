# Roadmap: Motion Effects Implementation (v1.1) + Animation Polish (v1.2)

## Milestones

- ✅ **v1.0 Testing & SEO Optimization** — Shipped 2026-05-12
- ✅ **v1.1 Motion Effects Implementation** — Complete 2026-05-15
- 🔄 **v1.2 Animation Polish** — In progress

## Phases

<details>
<summary>✅ v1.1 Motion Effects Implementation (Phase 1) — Complete (3/3 plans)</summary>

- [x] Plan 01-01: Install motion@12.38.0 and create motion-utils.ts (MOTION_STORAGE_KEY, useMotionEnabled, setMotionEnabled, isMotionSupported, applyFallback)
- [x] Plan 01-02: Rewrite CarouselMotion, MobileMenuMotion, SettingsToggle with motion/react; wire into index.astro with client:load
- [x] Plan 01-03: Full test suite — Vitest unit tests (renderHook hook coverage), Playwright E2E axe-core spec, Lighthouse CI CLS/TBT budget

</details>

<details>
<summary>✅ v1.1 Motion Effects Implementation (Phase 2) — Page Integration & Remaining Animations — Complete (3/3 plans)</summary>

**Goal:** Complete the remaining v1.1 motion scope deferred by D-SCOPE-01: wire the MobileMenuMotion trigger, connect real testimonials to CarouselMotion, style SettingsToggle visibly, and implement Hero Section, Pricing Cards, and NavBar motion effects.

**Depends on:** Phase 1

- [x] Plan 02-01: Integration loose ends — MobileMenuMotion trigger button, real testimonials in CarouselMotion, SettingsToggle styling
- [x] Plan 02-02: Hero Section animations — whileInView fade-in on scroll, CTA hover states, NavBar sticky + active section
- [x] Plan 02-03: Pricing Cards hover effects and full test suite (142 tests, 21 files)

</details>

---

## v1.2 Animation Polish

- [ ] **Phase 3: Motion Critique** — Run impeccable critique for motion gap inventory
- [ ] **Phase 4: Animation Implementation** — Orchestrated entrances, scroll reveals, easing tokens, and list stagger
- [ ] **Phase 5: Quality Audit** — Technical animation audit (60fps, reduced-motion, CLS)

## Phase Details

### Phase 3: Motion Critique
**Goal**: A prioritized inventory of animation gaps exists and guides all implementation decisions in Phase 4
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: CRIT-01
**Success Criteria** (what must be TRUE):
  1. `impeccable critique` has been run against the homepage with motion scope and produced output
  2. A gap list with P0/P1/P2 priority labels exists and covers all visible animated regions of the page
  3. Phase 4 implementation targets are determined by the critique output — no animation work proceeds before this list exists
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — Migrar contexto impeccable (PRODUCT.md, DESIGN.md, .impeccable/design.json) do worktree para main e commitar
- [x] 03-02-PLAN.md — Executar critique de motion (Assessment A + B), filtrar por motion-only, gerar 03-CRITIQUE.md com tabela P0/P1/P2
**UI hint**: yes

### Phase 4: Animation Implementation
**Goal**: The landing page has orchestrated entrance animations, scroll-triggered section reveals, standardized easing, animated SettingsToggle transitions, and staggered list/card entrances — all without altering visual design
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05
**Success Criteria** (what must be TRUE):
  1. On first visit, Hero headline, lede, and CTA appear sequentially with 100-150ms delays between each element
  2. Scrolling into Método, Ementa, Testimonials, Pricing, and FAQ sections triggers a visible reveal animation on each
  3. Toggling SettingsToggle produces a spring-animated indicator movement and a fade transition on the label
  4. Item groups in lists and cards (bônus cards, pricing feature list) stagger their entrance rather than appearing simultaneously
  5. All animations use the `ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)` curve from DESIGN.md — no generic `"easeOut"` strings remain
**Plans**: 6 plans
Plans:
- [ ] 04-01-PLAN.md — CSS foundation: --ease-entrance, --ease-micro, [data-reveal]/[data-revealed] CSS, @keyframes fade-up, [data-stagger], script IO em Layout.astro
- [ ] 04-02-PLAN.md — ANIM-02: adicionar data-reveal nas 8 seções (Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials)
- [ ] 04-03-PLAN.md — ANIM-01 + ANIM-03 (Hero): HeroMotion refatorado com variants + staggerChildren:0.12 + ease array numérico (TDD)
- [ ] 04-04-PLAN.md — ANIM-03 (restante): substituir easing genérico em MobileMenuMotion, CarouselMotion, Button.astro, NavBar.astro, motion-utils.ts
- [ ] 04-05-PLAN.md — ANIM-04: SettingsToggle spring no indicador (motion.span x:0/16) e fade no label (TDD)
- [ ] 04-06-PLAN.md — ANIM-05 + ANIM-03 (Pricing): stagger em bonus-card e price-includes li + data-reveal em Pricing.astro
**UI hint**: yes

### Phase 5: Quality Audit
**Goal**: All v1.2 animations pass technical quality gates — 60fps performance, full reduced-motion compliance, and CLS within budget — verified by impeccable audit
**Depends on**: Phase 4
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. `impeccable audit` reports no layout thrashing and confirms `will-change` usage is scoped to animated elements only
  2. With `prefers-reduced-motion: reduce` set in the browser, every animation added in v1.2 either stops or is replaced by an instant state change
  3. Lighthouse CI reports CLS ≤ 0.1 after all Phase 4 animations are present in the built output
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Motion Effects (v1.1) | 3/3 | Complete | 2026-05-15 |
| 2. Page Integration (v1.1) | 3/3 | Complete | 2026-05-15 |
| 3. Motion Critique (v1.2) | 2/2 | Complete | 2026-05-15 |
| 4. Animation Implementation (v1.2) | 0/6 | Not started | - |
| 5. Quality Audit (v1.2) | 0/? | Not started | - |
