# Phase 4: Animation Implementation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 4-Animation Implementation
**Areas discussed:** Scroll reveal (ANIM-02), HeroMotion stagger (ANIM-01), Política de easing (ANIM-03), Escopo de seções (ANIM-02), SettingsToggle spring (ANIM-04), Stagger em listas/cards (ANIM-05)

---

## Scroll Reveal Mechanism (ANIM-02)

| Option | Description | Selected |
|--------|-------------|----------|
| IntersectionObserver global + CSS | Script vanilla em Layout.astro, data-reveal/data-revealed, zero hidratação React | ✓ |
| React island por seção (SectionReveal) | motion.div whileInView por seção, client:visible, mais consistente com HeroMotion | |

**User's choice:** IntersectionObserver global + CSS
**Notes:** Padrão já existe no NavBar. Custo zero de hidratação.

---

## Scroll Reveal Timing

| Option | Description | Selected |
|--------|-------------|----------|
| 400ms / translateY(20px) | Sutil e rápido | ✓ |
| 500ms / translateY(30px) | Mais lento e pronunciado | |

**User's choice:** 400ms / translateY(20px)

---

## Scroll Reveal Fallback (motionEnabled=false)

| Option | Description | Selected |
|--------|-------------|----------|
| prefers-reduced-motion via CSS | @media reduce → opacity:1, transform:none | ✓ |
| Sincronizar IO com motionEnabled via CustomEvent | Adiciona data-revealed a todas imediatamente | |

**User's choice:** prefers-reduced-motion via CSS é suficiente

---

## HeroMotion Stagger Architecture (ANIM-01)

| Option | Description | Selected |
|--------|-------------|----------|
| staggerChildren via Framer variants | variants container/item, React.Children.map, API de Hero.astro não muda | ✓ |
| Props nomeados em HeroMotion | headline/lede/cta como props individuais, delays explícitos, refatorar Hero.astro | |

**User's choice:** staggerChildren via Framer variants (staggerChildren: 0.12)

---

## HeroMotion Trigger (animate vs whileInView)

| Option | Description | Selected |
|--------|-------------|----------|
| animate (dispara no load) | Hero sempre visível, whileInView pode falhar antes da hidratação | ✓ |
| whileInView (como está hoje) | Mantém padrão atual, pode não disparar se scroll passou | |

**User's choice:** animate (dispara no load)

---

## Política de Easing (ANIM-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Dois tokens: quart para entrances, standard para hover | cubic-bezier(0.25,1,0.5,1) + cubic-bezier(0.0,0.0,0.2,1) | ✓ |
| Um token único: quart em tudo | Seguimento literal do ROADMAP | |
| Um token único: standard em tudo | Segue design.json mas contradiz ROADMAP | |

**User's choice:** Dois tokens

---

## Distribuição dos Tokens de Easing

| Option | Description | Selected |
|--------|-------------|----------|
| CSS custom properties em Layout.astro | --ease-entrance e --ease-micro em :root | ✓ |
| Constantes TypeScript em motion-utils.ts | export const EASE_ENTRANCE, EASE_MICRO | |

**User's choice:** CSS custom properties em Layout.astro

---

## Escopo de Seções para ANIM-02

| Option | Description | Selected |
|--------|-------------|----------|
| Todas as 8 da critique | Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials | ✓ |
| As 5 do ROADMAP success criteria | Método, Ementa, Testimonials, Pricing, FAQ | |

**User's choice:** Todas as 8 da critique
**Notes:** Com IO+CSS o custo é idêntico para 5 ou 8 seções.

---

## SettingsToggle Indicador (ANIM-04)

| Option | Description | Selected |
|--------|-------------|----------|
| motion.span com spring physics | animate={{ x: motionEnabled ? 16 : 0 }}, stiffness: 400, damping: 30 | ✓ |
| AnimatePresence com fade no label | Fade no texto, combinável com spring | |

**User's choice:** motion.span com spring physics

---

## SettingsToggle Label Fade

| Option | Description | Selected |
|--------|-------------|----------|
| Sim — fade sutil via motion.span | opacity: motionEnabled ? 1 : 0.4, duration: 0.2s | ✓ |
| Não — apenas o indicador anima | Mais simples | |

**User's choice:** Sim — fade sutil via motion.span

---

## Stagger em Listas e Cards (ANIM-05)

| Option | Description | Selected |
|--------|-------------|----------|
| CSS animation-delay via inline style | {i * 80}ms no template Astro, animation-play-state | ✓ |
| Script vanilla com querySelectorAll | Adiciona delay via JS após data-revealed | |

**User's choice:** CSS animation-delay via inline style

---

## Intervalo de Stagger

| Option | Description | Selected |
|--------|-------------|----------|
| 80ms entre itens | Bônus cards: 0/80/160ms, price-includes: 0 a 560ms | ✓ |
| 50ms entre itens | Mais rápido, menos perceptível | |
| 100ms entre itens | Mais lento, pricing leva 800ms | |

**User's choice:** 80ms entre itens

---

## Claude's Discretion

- Ordem dos planos dentro da Phase 4 (se dividida por ANIM-XX)
- Threshold exato do IO por seção (se 0.15 precisar de ajuste em seções muito curtas)
- Número exato de staggerChildren (0.12 é ponto de partida, pode ajustar durante execução)

## Deferred Ideas

- Parallax depth no Hero — Future Requirements v1.2
- NavBar link ativo com indicador animado (P2 critique) — fora do escopo ANIM-XX
- Method.astro accordion com easing custom (P2) — coberto por D-EASE-03 indiretamente