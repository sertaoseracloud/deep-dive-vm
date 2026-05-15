# Requirements: Animation Polish (v1.2)

## Business Requirements

### Core Objective

Elevar a qualidade das animações da landing page usando o framework impeccable (critique → animate → audit), sem alterar o design visual estabelecido. As animações devem servir o design — não redefini-lo.

### Constraints (invioláveis)

- NÃO alterar cores, tipografia, layout ou identidade visual
- NÃO modificar estrutura de componentes além do estritamente necessário para adicionar motion
- Respeitar o DESIGN.md e design.json como verdade de marca

## CRIT — Animation Critique

- [ ] **CRIT-01**: Rodar `impeccable critique` na homepage com foco em motion e produzir lista priorizada de gaps de animação (P0/P1/P2) que guie a implementação das fases seguintes

## ANIM — Animation Improvements

- [ ] **ANIM-01**: O Hero exibe uma sequência de entrada staggered — headline, lede e CTA aparecem um após o outro (100-150ms de delay entre elementos) na primeira visita
- [ ] **ANIM-02**: As seções de conteúdo principais (Método, Ementa, Testimoniais, Pricing, FAQ) têm scroll-triggered reveals com timing consistente (motion/react whileInView ou IntersectionObserver + CSS)
- [ ] **ANIM-03**: As curvas de easing de todas as animações são padronizadas com os cubic-bezier tokens do DESIGN.md (`ease-out-quart: 0.25 1 0.5 1`) em vez de `"easeOut"` genérico
- [ ] **ANIM-04**: O SettingsToggle tem transição animada ao alternar estado (spring no indicador, fade no label "Animações")
- [ ] **ANIM-05**: Grupos de itens em listas e cards dentro das seções usam stagger coordenado na entrada (bônus cards, feature list do pricing)

## QUAL — Quality Gate (impeccable audit)

- [ ] **QUAL-01**: Todas as animações novas mantêm 60fps — sem layout thrashing, `will-change` aplicado com escopo controlado
- [ ] **QUAL-02**: `prefers-reduced-motion` desativa ou simplifica 100% das animações adicionadas no v1.2
- [ ] **QUAL-03**: CLS permanece ≤ 0.1 após as adições de animação (verificado via Lighthouse CI)

## Future Requirements (deferred)

- Parallax depth no Hero (múltiplas camadas com velocidades diferentes) — requer teste de performance mais cuidadoso
- Page transition animations entre seções ao clicar nos links da NavBar
- Confetti / celebration animation no checkout CTA click
- Scroll progress indicator

## Out of Scope

- Alterações em cores, tipografia ou layout — design visual estabelecido não é tocado
- Novas features de UI/UX além das animações
- Mudança de biblioteca de animação (motion@12.38.0 permanece)
- Animações que exijam dados externos ou APIs

## Traceability

| REQ-ID | Phase | Plan | Status |
|--------|-------|------|--------|
| CRIT-01 | Phase 3 | — | pending |
| ANIM-01 | Phase 4 | — | pending |
| ANIM-02 | Phase 4 | — | pending |
| ANIM-03 | Phase 4 | — | pending |
| ANIM-04 | Phase 4 | — | pending |
| ANIM-05 | Phase 4 | — | pending |
| QUAL-01 | Phase 5 | — | pending |
| QUAL-02 | Phase 5 | — | pending |
| QUAL-03 | Phase 5 | — | pending |
