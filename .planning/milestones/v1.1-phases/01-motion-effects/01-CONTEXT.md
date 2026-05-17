# Contexto da Fase 1 – Motion Effects Implementation (v1.1)

## Decisões bloqueadas
- Decidido usar o pacote npm **motion** (https://www.npmjs.com/package/motion) ao invés do motion.dev para animações.

- **Estratégia de animação:** JavaScript‑driven usando **Motion.dev** (<https://www.npmjs.com/package/motion/docs/quick-start>).
- **Controle de "reduce motion":** Expor toggle nas configurações do site; o toggle controla a habilitação das animações e ainda respeita a media query `prefers-reduced-motion`.
- **Carrossel de depoimentos:** Implementar componente customizado usando **Motion.dev**.
- **Menu móvel:** Controle via JavaScript usando **Motion.dev** (slide‑in animado).

## Perguntas abertas / próximas etapas

- Definir design visual e timing das animações (duração, easing).
- Determinar localização do toggle de controle de motion nas configurações UI.
- Planejar testes de acessibilidade para animações (axe‑core, Lighthouse, testes manuais).
- Avaliar fallback para navegadores sem suporte a Motion.dev.

## Decisões Bloqueadas (adicionais)

- **Performance:** animações ≤ 150 ms, easing "ease‑out", budget < 100 ms, medição via Lighthouse Performance (TBT < 50 ms) e code‑splitting de Motion.dev.
- **Fallbacks:** detectar `window.Motion`; se ausente, aplicar transições CSS simples; polyfill opcional não incluído por padrão.
- **Acessibilidade‑Teste:** integrar `axe-core` no CI (`npm run test:axe`), garantir ausência de alertas de motion‑sensory; Playwright testa toggle de "reduce motion".
- **Estado‑Animação:** flag `motionEnabled` em `localStorage` + store global; UI toggle nas configurações; sempre respeitar `prefers-reduced-motion`.

## Decisões Bloqueadas (D-SCOPE-01 — Escopo da Fase 01)

**D-SCOPE-01 — Componentes no escopo da Fase 01 (LOCKED):**
Phase 01 is limited to exactly these three components:
- `CarouselMotion` (testimonials carousel)
- `MobileMenuMotion` (mobile menu slide-in)
- `SettingsToggle` (motion enable/disable toggle)

The following items from REQUIREMENTS.md are explicitly deferred to Phase 02 or later:
- Hero Section: parallax scrolling, fade-in on scroll, CTA hover states
- Pricing Cards: hover elevation, state transitions, focus indicators
- Navigation Bar: sticky behavior, active state indicators

Rationale: The user's discussion session scoped the implementation to the three motion components already scaffolded in the repository. Hero Section, Pricing Cards, and NavBar animations require additional design decisions (timing, visual targets) that are not yet locked.

## Referências

- Motion.dev quick‑start: <https://www.npmjs.com/package/motion/> e <https://github.com/motiondivision/motion>
- WCAG 2.1 AA – Guideline sobre animações e preferências de redução de movimento.
