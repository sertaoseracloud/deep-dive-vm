# Phase 4: Animation Implementation - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

## Phase Boundary

Implementar os 5 ANIM-XX gaps identificados em 03-CRITIQUE.md: stagger orchestrado no Hero (ANIM-01), scroll-triggered reveals em 8 seções via IntersectionObserver + CSS (ANIM-02), padronização de easing tokens (ANIM-03), spring no SettingsToggle (ANIM-04), e stagger coordenado em listas e cards (ANIM-05). Sem alteração em cores, tipografia, layout ou identidade visual.

## Implementation Decisions

### Scroll Reveals — ANIM-02

- **D-SCROLL-01:** Usar IntersectionObserver global + CSS `data-reveal`/`data-revealed` em Layout.astro. Script vanilla — zero custo de hidratação React. Segue o padrão já estabelecido do NavBar sticky (IntersectionObserver em Layout.astro:171). Quando a section entra no viewport, o IO adiciona `data-revealed` e se auto-desconecta (`unobserve`).
- **D-SCROLL-02:** Timing: `opacity` + `translateY(20px)` com `transition: 400ms cubic-bezier(0.25, 1, 0.5, 1)`. Threshold: 0.15 (15% da section visível).
- **D-SCROLL-03:** Fallback via `@media (prefers-reduced-motion: reduce)` no CSS: sections com `[data-reveal]` recebem `opacity: 1; transform: none` — sem sincronização com o toggle React do SettingsToggle. O toggle afeta apenas componentes React. Seções ainda não reveladas aparecerão instantaneamente se prefers-reduced-motion estiver ativo.
- **D-SCROLL-04:** Escopo: todas as 8 seções identificadas na critique — Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials. Adicionar `data-reveal` no `<section>` de cada uma. Com IO+CSS o custo de incluir todas as 8 é idêntico ao de incluir as 5 do ROADMAP success criteria.

### HeroMotion Stagger — ANIM-01

- **D-HERO-01:** Refatorar `HeroMotion.tsx` para usar `variants` com `staggerChildren: 0.12` (120ms). O componente container usa `initial="hidden" animate="visible"`. Cada filho é envolvido em `<motion.div key={i} variants={item}>` via `React.Children.map`. A API de `Hero.astro` não muda — HeroMotion ainda recebe `children` como nó opaco.
- **D-HERO-02:** O trigger muda de `whileInView` para `animate` (dispara no load). O Hero é sempre a primeira coisa visível — `whileInView` pode não disparar se o island hidratar após o scroll. `initial="hidden"` evita flash de conteúdo não-animado.
- **D-HERO-03:** Variants do item: `hidden: { opacity: 0, y: 20 }`, `visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } }`.

### Política de Easing — ANIM-03

- **D-EASE-01:** Dois tokens de easing:
  - **Entrances/reveals/stagger:** `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart — REQUIREMENTS.md ANIM-03). Usado em: scroll reveals, stagger de Hero, stagger de listas.
  - **Hover/toggle/micro-interações:** `cubic-bezier(0.0, 0.0, 0.2, 1)` (ease-out-standard — design.json). Usado em: hover de botões, NavBar links, Pricing card hover, SettingsToggle label fade.
- **D-EASE-02:** Distribuição via CSS custom properties em Layout.astro (global): `--ease-entrance: cubic-bezier(0.25, 1, 0.5, 1)` e `--ease-micro: cubic-bezier(0.0, 0.0, 0.2, 1)`. CSS usa `var(--ease-entrance)`, componentes motion/react usam o array numérico inline `[0.25, 1, 0.5, 1]`.
- **D-EASE-03:** Substituir TODAS as ocorrências de `ease-out` genérico (CSS) e `"easeOut"` (motion/react string) pelos tokens corretos. Componentes afetados: HeroMotion.tsx, MobileMenuMotion.tsx, CarouselMotion.tsx, Button.astro, NavBar.astro, Pricing.astro.

### SettingsToggle Spring — ANIM-04

- **D-TOGGLE-01:** Substituir o `<span>` do indicador por `<motion.span>`. Usar `animate={{ x: motionEnabled ? 16 : 0 }}` com `transition={{ type: 'spring', stiffness: 400, damping: 30 }}`. Troca CSS `left` por `transform: translateX` — mais performático (sem layout reflow).
- **D-TOGGLE-02:** Label "Animações" recebe `<motion.span animate={{ opacity: motionEnabled ? 1 : 0.4 }} transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}>`. Quando toggle off, texto dimmed (40% opacity); quando on, texto pleno.
- **D-TOGGLE-03:** Spring funciona apenas quando `motionEnabled = true`. Quando `motionEnabled = false` (prefers-reduced-motion ou toggle manual), o indicador pula instantaneamente — sem spring.

### Stagger em Listas e Cards — ANIM-05

- **D-STAGGER-01:** CSS `animation-delay: {i * 80}ms` inline nos templates Astro. Bônus cards (3 items): delays 0ms, 80ms, 160ms. Price-includes (8 itens): delays 0ms a 560ms. Calculado em build time — sem JS de runtime.
- **D-STAGGER-02:** Coordenação com IO reveal: itens `[data-stagger]` têm `animation-play-state: paused` por padrão. CSS `[data-revealed] [data-stagger] { animation-play-state: running }` dispara o stagger assim que a section pai é revelada.
- **D-STAGGER-03:** Keyframe `@keyframes fade-up`: `from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none }`. Duration: 400ms, ease: `var(--ease-entrance)`, fill-mode: `forwards`.
- **D-STAGGER-04:** Alvo: `[data-stagger]` em `.bonus-card` (Bonuses.astro) e `.price-includes li` (Pricing.astro).

### Claude's Discretion

- Ordem dos planos dentro da Phase 4 (se dividida em sub-planos por ANIM-XX).
- Threshold exato do IntersectionObserver além de 0.15 (pode ajustar por seção se uma seção for muito curta).
- Número exato de `staggerChildren` para o Hero se 0.12 parecer muito lento/rápido durante execução.

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Critique e Requisitos

- `.planning/milestones/v1.2-phases/03-motion-critique/03-CRITIQUE.md` — Inventário P0/P1/P2 de gaps de motion. **Input principal da Phase 4 — ler antes de criar qualquer plan.**
- `.planning/REQUIREMENTS.md` — ANIM-01..05 com critérios de aceitação. Define o que constitui done para cada animação.
- `.planning/ROADMAP.md` — Success criteria da Phase 4 (5 seções críticas, stagger 100-150ms entre elementos do Hero).

### Design System e Tokens

- `DESIGN.md` — Spec "A Forja do Arquiteto". Regras de motion e comportamento visual.
- `.impeccable/design.json` — Tokens: `ease-out-standard: cubic-bezier(0.0, 0.0, 0.2, 1)`, `ease-out-quart` (via REQUIREMENTS.md `cubic-bezier(0.25, 1, 0.5, 1)`), `duration-standard: 150ms`, `duration-motion-lib: 300ms`.

### Código Existente

- `src/lib/motion-utils.ts` — `useMotionEnabled`, `isMotionSupported`, `applyFallback`. Todas as animações devem respeitar `useMotionEnabled`.
- `src/components/HeroMotion.tsx` — Componente a refatorar para stagger (ANIM-01).
- `src/components/SettingsToggle.tsx` — Componente a refatorar para spring (ANIM-04).
- `src/components/sections/Bonuses.astro` — Stagger nos `.bonus-card` (ANIM-05).
- `src/components/sections/Pricing.astro` — Stagger nos `.price-includes li` (ANIM-05).
- `src/layouts/Layout.astro` — Ponto de adição do IO global e CSS custom properties.
- `src/pages/index.astro` — Composição das islands. Novos `client:visible` ou `client:load` vão aqui.

### Skill Impeccable

- `.agents/skills/impeccable/reference/animate.md` — Diretrizes de qualidade de animação (60fps, will-change, reduced-motion).

## Existing Code Insights

### Reusable Assets

- `src/lib/motion-utils.ts` — `useMotionEnabled()` hook: todas as animações React devem condicioná-las a este hook. `applyFallback()` para fallback CSS quando motion off.
- `src/components/HeroMotion.tsx` — Template atual `MotionConfig reducedMotion="user"` + `motion.div`. Base para refatorar o stagger.
- `motion@12.38.0` — Instalado. `motion/react` (HeroMotion, SettingsToggle) e `motion` vanilla (CarouselMotion) disponíveis.

### Established Patterns

- **Pattern IO+CSS:** IntersectionObserver seta `data-*` attribute, CSS reage via seletor. Já existe em NavBar.astro:171 para o `data-scrolled`. O mesmo mecanismo é a base de ANIM-02.
- **Pattern MotionConfig:** `<MotionConfig reducedMotion="user">` é o wrapper padrão para componentes React com motion. Preservar em HeroMotion e SettingsToggle.
- **Pattern client:visible:** Islands React hidratam quando entram no viewport. HeroMotion usa `client:load` (imediato) — manter assim para garantir que o stagger dispare na primeira visita.
- **Pattern `data-stagger` + `animation-play-state`:** Novo padrão para ANIM-05. CSS define a animação, IO+reveal controla quando ela começa.

### Integration Points

- `src/layouts/Layout.astro` — Adicionar CSS custom properties `--ease-entrance` e `--ease-micro` no `:root`. Adicionar script IO global para `[data-reveal]`.
- `src/pages/index.astro` — Cada section que recebe `data-reveal` é um elemento Astro existente. Sem novas islands necessárias para ANIM-02.
- `src/components/SettingsToggle.tsx` — Alterar inline styles do indicador e label para motion components. Sem mudança de props ou API externa.

## Specific Ideas

- Hero: `staggerChildren: 0.12` produz delays de 0ms, 120ms, 240ms entre headline/lede/CTA — dentro do target 100-150ms do ROADMAP.
- Scroll reveal transition: `400ms` escolhida por ser maior que `duration-motion-lib: 300ms` (entrada de seção deve ser ligeiramente mais longa que micro-interação).
- SettingsToggle: `stiffness: 400, damping: 30` produz spring rápido e sem bounce excessivo — adequado para um toggle de controle, não para decoração.
- CSS custom properties em `:root` permitem que DevTools mostre os valores de easing diretamente — facilita auditoria da Phase 5.

## Deferred Ideas

- Parallax depth no Hero (múltiplas camadas) — Future Requirements do v1.2.
- NavBar link ativo com indicador animado (P2 da critique) — fora do escopo ANIM-XX desta phase.
- Method.astro accordion com easing custom (P2 da critique) — coberto por D-EASE-03 se Method tiver transitions CSS.

---

*Phase: 4-Animation Implementation*
*Context gathered: 2026-05-15*