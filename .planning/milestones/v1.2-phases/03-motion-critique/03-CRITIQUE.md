# Motion Critique: Deep Dive Azure VM

**Data:** 2026-05-15
**Alvo:** http://localhost:4321/deep-dive-vm/
**Escopo:** Motion-only — timing, easing, stagger, scroll-triggers, micro-interações (D-07)
**Contexto impeccable:** PRODUCT.md + DESIGN.md carregados (hasProduct: true, hasDesign: true)

## Inventário de Gaps

| Severidade | Componente | Gap de Motion | ANIM-XX |
|-----------|-----------|---------------|---------|
| P0 | HeroMotion | Headline, lede e CTA estão envoltos em um único `motion.div` — animam como bloco simultâneo, sem delays sequenciais entre elementos | ANIM-01 |
| P0 | Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials | Nenhuma dessas 8 seções possui scroll-triggered reveal — elementos aparecem instantaneamente ao entrar no viewport | ANIM-02 |
| P0 | SettingsToggle | Indicador do toggle usa CSS `transition: left 0.15s ease-out` (não spring motion/react); label "Animações" não tem fade; componente não usa motion/react em nenhum elemento interno | ANIM-04 |
| P0 | Bonuses (cards de bônus) | Cards de bônus não têm animation-delay progressivo — aparecem simultaneamente ao carregar/scrollar | ANIM-05 |
| P0 | Pricing (`.price-includes li`) | 8 itens da feature list do plano aparecem sem stagger — rendem todos ao mesmo tempo | ANIM-05 |
| P1 | HeroMotion | `ease: "easeOut"` (string genérica) em vez do token `ease-out-standard: cubic-bezier(0.0, 0.0, 0.2, 1)` do design.json | ANIM-03 |
| P1 | MobileMenuMotion | `ease: "easeOut"` genérico e `duration: 0.15s` vs token `duration-motion-lib: 300ms` do design.json | ANIM-03 |
| P1 | CarouselMotion | Navegação por teclado usa `ease: "easeOut"` genérico; auto-scroll usa `ease: "linear"` (aceitável para scroll contínuo) | ANIM-03 |
| P1 | Button.astro | Arrow `→` usa `transition: transform 0.25s` sem `transition-timing-function` (default browser `ease`); hover com `ease-out` genérico | ANIM-03 |
| P1 | Pricing.astro | Card hover `transition: transform 0.15s ease-out, box-shadow 0.15s ease-out` — easing CSS genérico | ANIM-03 |
| P1 | NavBar.astro | Links hover `transition: color 0.15s ease-out` e sticky state `transition: background 0.2s ease-out` — CSS ease-out genérico | ANIM-03 |
| P2 | NavBar.astro | Nenhuma animação de indicador para link ativo da seção corrente (underline ou bar animado) | — |
| P2 | Method.astro | `transition: background 0.3s` no accordion detail sem timing-function especificado (browser default `ease`) | ANIM-03 |

## Nota sobre Discrepância de Easing

Existem dois valores canônicos candidatos para o token de easing principal do v1.2:

- **design.json** define `ease-out-standard: cubic-bezier(0.0, 0.0, 0.2, 1)` — Material Design motion, aceleração rápida com desaceleração suave.
- **REQUIREMENTS.md ANIM-03** especifica `ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)` — desaceleração mais expressiva, com saída mais ampla.

Ambos são reportados aqui como P1. **A decisão de qual adotar é da Phase 4** (Claude's Discretion conforme D-09 do CONTEXT.md). Recomendação para Phase 4: usar `cubic-bezier(0.25, 1, 0.5, 1)` (REQUIREMENTS.md) — é mais expressivo para animações de entrada de elementos de conteúdo; reservar `cubic-bezier(0.0, 0.0, 0.2, 1)` apenas para micro-interações de estado (hover, toggle) onde a reatividade imediata importa mais.

## Issues Fora de Escopo (descartados por D-09)

Assessment B (npx impeccable detect v2.1.9) reportou 6 findings — todos de tipografia, nenhum de motion:

- 5× `overused-font`: Space Grotesk detectado em Bonuses.astro, ModuleDetails.astro, Layout.astro — descartado (tipografia, não motion)
- 1× `single-font`: Apenas Space Grotesk detectado como única família — descartado (tipografia, não motion)

Assessment A (LLM review) não encontrou issues de contraste, cores, layout ou espaçamento que violem o design estabelecido.

## Metodologia

- **Assessment A:** LLM review com inspeção de código-fonte (HeroMotion.tsx, SettingsToggle.tsx, MobileMenuMotion.tsx, CarouselMotion.tsx, Button.astro, NavBar.astro, Pricing.astro, Bonuses.astro, Method.astro, Curriculum.astro) + dev server ativo em http://localhost:4321/deep-dive-vm/
- **Assessment B:** `npx impeccable detect --json src/` (v2.1.9) — 6 findings todos non-motion
- **Filtro:** D-07/D-08/D-09 — apenas gaps de timing, easing, stagger, scroll-triggers e micro-interações de motion

## Próximos Passos

03-CRITIQUE.md é o input direto para **Phase 4 (Animation Implementation)**.
O planner da Phase 4 DEVE ler este arquivo antes de criar os plans ANIM-XX.

Prioridade de execução sugerida para Phase 4:
1. **ANIM-02 primeiro** (scroll reveals em 8 seções) — maior impacto visual, implementação repetível
2. **ANIM-01** (HeroMotion stagger) — ponto de entrada da página
3. **ANIM-03** (easing tokens) — substituição global, baixo risco
4. **ANIM-04** (SettingsToggle spring) — componente isolado
5. **ANIM-05** (stagger em listas/cards) — refinamento final