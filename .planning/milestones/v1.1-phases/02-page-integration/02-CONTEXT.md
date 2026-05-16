# Contexto da Fase 2 – Page Integration & Remaining Animations (v1.1)

**Coletado:** 2026-05-15
**Status:** Pronto para planejamento
**Fonte:** D-SCOPE-01 (Phase 01 CONTEXT.md) + REQUIREMENTS.md

## Decisões Bloqueadas

### D-SCOPE-02-A — Escopo desta fase (LOCKED)

Phase 02 entrega exatamente os itens explicitamente adiados por D-SCOPE-01 em Phase 01, mais os loose ends de integração de Phase 01:

**Loose ends de Phase 01 (integração):**
- Wiring do trigger de abrir/fechar o `MobileMenuMotion` (botão hamburger no NavBar)
- Substituir os itens de teste do `CarouselMotion` pelos depoimentos reais da seção Testimonials
- Estilizar `SettingsToggle` de forma visualmente proeminente (posição, cores, ícone)

**Animações restantes de REQUIREMENTS.md:**
- Hero Section: fade-in no scroll para elementos, hover states nos botões CTA
- Pricing Cards: hover com elevação sutil, transições de estado, indicadores de foco acessíveis
- Navigation Bar: sticky behavior com transição suave, indicadores de estado ativo nos links

### D-SCOPE-02-B — Parallax explicitamente fora de escopo (LOCKED)

Parallax scrolling no Hero foi removido do escopo após análise de impacto em acessibilidade (WCAG 2.1 AA, prefers-reduced-motion) e performance (CLS). Substituído por fade-in no scroll via Intersection Observer ou motion/react `useInView`.

### D-SCOPE-02-C — Biblioteca de animação (LOCKED, herdada de Phase 01)

Continua usando `motion` npm package (v12.38.0). Entrada React via `motion/react`. Entrada imperativa via `motion`. Sem framer-motion, sem @motionone/dom.

### D-SCOPE-02-D — Constraints de performance e acessibilidade (LOCKED, herdadas)

- Animações ≤ 150 ms, easing "ease-out" (exceto loops contínuos que usam "linear")
- `prefers-reduced-motion` sempre sobrescreve localStorage
- CLS ≤ 0.1, TBT < 50 ms (Lighthouse CI)
- WCAG 2.1 AA compliance obrigatório

### D-SCOPE-02-E — Dados reais para CarouselMotion (LOCKED)

O `CarouselMotion` deve receber os depoimentos reais já existentes na seção `Testimonials`. Os dados devem ser extraídos do componente `Testimonials.astro` existente (ou da collection de conteúdo, se houver) e passados como prop `items` para `CarouselMotion` em `index.astro`. O componente `Testimonials.astro` estático deve ser substituído ou complementado pelo `CarouselMotion` animado.

## Perguntas Abertas / Próximas Etapas

- Determinar se o sticky NavBar usa CSS `position: sticky` (preferido, zero JS) ou uma abordagem JavaScript-driven com motion.
- Definir os depoimentos reais: são dados hardcoded em Testimonials.astro ou vêm de content collections?
- Definir visual do SettingsToggle: ícone de animação (como ✨ ou 🎬), posição na página (footer ou header), e se é visível em mobile.

## Referências

- Phase 01 CONTEXT.md: `.planning/milestones/v1.1-phases/01-motion-effects/01-CONTEXT.md`
- Phase 01 VERIFICATION.md: `.planning/milestones/v1.1-phases/01-motion-effects/01-VERIFICATION.md`
- REQUIREMENTS.md: `.planning/REQUIREMENTS.md`
- motion/react docs: https://motion.dev/docs/react
- WCAG 2.1 AA — Guideline on animations and motion preferences
