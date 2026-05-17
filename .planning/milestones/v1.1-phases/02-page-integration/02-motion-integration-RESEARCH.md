# Phase 02: Page Integration & Remaining Animations - Pesquisa

**Pesquisado:** 2026-05-15
**Domínio:** Integração de animações em componentes Astro + React (motion/react, Intersection Observer, estado cross-framework)
**Confiança:** HIGH

---

<user_constraints>
## Restrições do Usuário (de 02-CONTEXT.md)

### Decisões Bloqueadas

**D-SCOPE-02-A — Escopo desta fase (LOCKED)**
- Wiring do trigger hamburger para `MobileMenuMotion` (botão no NavBar)
- Substituir itens de teste do `CarouselMotion` pelos depoimentos reais de `Testimonials.astro`
- Estilizar `SettingsToggle` de forma visualmente proeminente
- Hero Section: fade-in no scroll, hover nos botões CTA
- Pricing Cards: hover com elevação sutil, indicadores de foco acessíveis
- Navigation Bar: sticky behavior com transição suave, indicadores de estado ativo nos links

**D-SCOPE-02-B — Parallax fora de escopo (LOCKED)**
Parallax removido. Substituído por fade-in via Intersection Observer ou `whileInView`.

**D-SCOPE-02-C — Biblioteca de animação (LOCKED)**
`motion` npm package (v12.38.0). React via `motion/react`. Imperativo via `motion`. Sem framer-motion, sem @motionone/dom.

**D-SCOPE-02-D — Constraints de performance e acessibilidade (LOCKED)**
- Animações ≤ 150 ms, easing "ease-out" (exceto loops contínuos = "linear")
- `prefers-reduced-motion` sempre sobrescreve localStorage
- CLS ≤ 0.1, TBT < 50 ms (Lighthouse CI)
- WCAG 2.1 AA obrigatório

**D-SCOPE-02-E — Dados reais para CarouselMotion (LOCKED)**
Depoimentos reais de `Testimonials.astro` devem ser passados como prop `items` para `CarouselMotion`. O componente estático deve ser substituído ou complementado.

### Perguntas Abertas
- Sticky NavBar: CSS `position: sticky` (preferido) ou JS-driven?
- Depoimentos: hardcoded em `Testimonials.astro` ou de content collections?
- Visual do SettingsToggle: ícone, posição, visibilidade em mobile.
</user_constraints>

---

## Resumo

Esta pesquisa cobre os cinco problemas de integração da Phase 02: estado cross-framework (NavBar Astro ↔ MobileMenuMotion React), animações de scroll via `motion/react`, sticky NavBar, hover em Pricing Cards, e integração do CarouselMotion com dados reais.

**Descoberta principal:** `@nanostores/react` NÃO é necessário para este caso. O padrão `CustomEvent` via `<script>` no NavBar.astro é a abordagem mais simples e sem dependência adicional para o toggle do menu — e é suportado nativamente pela arquitetura Astro + React. Para scroll animations, o `motion/react` fornece `whileInView` e `MotionConfig reducedMotion="user"` que automaticamente respeitam `prefers-reduced-motion`. Para sticky NavBar e hover em Pricing Cards, CSS puro é a solução correta — motion/react não adiciona valor e introduziria overhead de hidratação desnecessário.

**Recomendação primária:** CustomEvent para state cross-framework, `whileInView` + `MotionConfig` para scroll animations, CSS para sticky/hover, dados hardcoded em `index.astro` para o CarouselMotion.

---

## Mapa de Responsabilidade Arquitetural

| Capacidade | Tier Primário | Tier Secundário | Racional |
|---|---|---|---|
| Toggle do menu hamburger | Browser / Client (`<script>` Astro) | React Island (listener) | Astro server component não pode disparar eventos reativos; `<script>` roda no cliente |
| Animações de scroll (fade-in) | Frontend Client (React Island) | — | `motion/react` roda no browser; `whileInView` via IntersectionObserver nativo |
| Sticky NavBar + shadow transition | Browser / CSS | — | `position: sticky` é nativo do browser; sem JS necessário |
| Hover em Pricing Cards | Browser / CSS | — | CSS `transform` e `box-shadow` rodam na GPU sem bundle JS |
| Carousel com dados reais | Frontend Client (React Island) | Astro page (props) | Dados são passados como props estáticas em build-time pelo `index.astro` |
| Reduced motion enforcement | Frontend Client (React Island) | CSS `@media` | `useMotionEnabled` em `motion-utils.ts` já cobre; `MotionConfig` adiciona cobertura declarativa |

---

## Stack Padrão

### Core (já instalado)
| Biblioteca | Versão | Propósito | Por que padrão |
|---|---|---|---|
| `motion` | 12.38.0 [VERIFIED: npm registry] | API de animação unificada | Já instalado; entry React via `motion/react`; substitui framer-motion |
| `react` | 19.2.6 [VERIFIED: npm registry] | UI library | Instalado; Motion React integra sem overhead adicional |
| `@astrojs/react` | 5.0.5 [VERIFIED: npm registry] | Bridge Astro-React | Já configurado; permite `client:load` islands |

### Dependência Nova Avaliada: @nanostores/react

Após análise (ver Tópico 1 abaixo), **@nanostores/react NÃO deve ser instalado** para este caso de uso. O CustomEvent pattern é suficiente e evita dependência extra.

### Alternativas Consideradas
| Em vez de | Poderia usar | Trade-off |
|---|---|---|
| CustomEvent (sem deps) | `@nanostores/react` | Nanostores adiciona ~1 KB e requer arquivo de store separado; para UM boolean, CustomEvent é mais simples |
| CSS sticky + IntersectionObserver | `motion/react` scroll-linked | motion scroll-linked exige `client:load` na NavBar inteira, introduz hidratação e risco de CLS |
| CSS hover transitions | `motion.div whileHover` | `whileHover` requer converter Pricing.astro em componente React; CSS é suficiente e zero-JS |

---

## Auditoria de Legitimidade de Pacotes

> Nenhum pacote novo será instalado nesta fase. `motion`, `react`, `@astrojs/react` já estão no `package.json`.

Se `@nanostores/react` fosse adotado (decisão: NÃO), o resultado do slopcheck foi:

| Pacote | Registry | Criado | slopcheck | Disposição |
|---|---|---|---|---|
| `nanostores` | npm | Jun 2021 | [OK] | Aprovado (mas não necessário) |
| `@nanostores/react` | npm | Out 2021 | [OK] | Aprovado (mas não necessário) |

**Pacotes removidos por [SLOP]:** nenhum
**Pacotes suspeitos [SUS]:** nenhum

---

## Padrões de Arquitetura

### Diagrama de Fluxo de Dados (Phase 02)

```
NavBar.astro <script>
    └── hamburger click
           │
           ▼  window.dispatchEvent(CustomEvent "toggle-menu")
           │
    MobileMenuMotion (React, client:load)
           └── useEffect window.addEventListener("toggle-menu")
                  └── setIsOpen(prev => !prev)
                         └── motion.nav animate x: 0% / -100%

index.astro (build time)
    └── testimonialItems: Item[]  (dados hardcoded de Testimonials.astro)
           │
           ▼  <CarouselMotion client:load items={testimonialItems} />
           │
    CarouselMotion (React)
           └── animate(track, { x }, { repeat: Infinity })

Hero.astro / Pricing.astro  (Astro static, SEM hidratação React)
    └── elementos com class "animate-on-scroll"
           │
           ▼  <script> IntersectionObserver (ou)
           │   motion/react HeroMotion island wrapper
           │
    Fade-in: opacity 0→1, translateY 20px→0

NavBar.astro (CSS only)
    └── position: sticky; top: 0
    └── .nav[data-scrolled] { box-shadow: ...; background: rgba(..., 0.95) }
           │
           ▼  <script> IntersectionObserver no #top sentinel
           └── document.querySelector('.nav').dataset.scrolled = "true"
```

### Estrutura de Projeto Recomendada

```
src/
├── components/
│   ├── layout/
│   │   └── NavBar.astro          # Adicionar botão hamburger + <script> CustomEvent
│   ├── sections/
│   │   ├── Hero.astro            # Adicionar class animate-on-scroll nos elementos
│   │   ├── Pricing.astro         # Adicionar CSS hover transitions
│   │   └── Testimonials.astro    # Substituído por CarouselMotion em index.astro
│   ├── CarouselMotion.tsx        # Recebe testimonialItems como prop
│   ├── MobileMenuMotion.tsx      # Adicionar listener CustomEvent para isOpen
│   └── SettingsToggle.tsx        # Estilizar (posição, cor, ícone)
├── lib/
│   └── motion-utils.ts           # Já contém useMotionEnabled, sem alteração necessária
└── pages/
    └── index.astro               # Passa testimonialItems, remove isOpen={false} hardcoded
```

---

## Decisões por Tópico

### Tópico 1: Estado Cross-Framework (NavBar ↔ MobileMenuMotion)

**Decisão: CustomEvent via `<script>` no NavBar.astro**

**Racional:**

A documentação oficial do Astro afirma explicitamente: *"Writing to a store from a `.astro` file or non-hydrated component will not affect the value received by client-side components."* [CITED: docs.astro.build/en/recipes/sharing-state-islands/]. Portanto, nanostores só funciona entre **dois islands hidratados** — não entre um componente Astro server-side e um React island.

As três opções avaliadas:

| Opção | Pros | Cons | Decisão |
|---|---|---|---|
| `@nanostores/react` + store atom | Idiomático Astro, reativo, synced | Requer 2o island hidratado para o botão; o NavBar Astro não re-renderiza | DESCARTADO — não resolve o problema |
| `CustomEvent` via `<script>` no NavBar | Zero dependências, funciona Astro→React, padrão nativo Web | Não é tipado; listener deve ser limpo no unmount | ESCOLHIDO |
| Converter NavBar para React | Estado compartilhado nativo React | Perde SSR da NavBar; hidratação completa; risco CLS; sem ganho visual | DESCARTADO — overkill |

**Mecanismo correto:** O `<script>` do NavBar.astro roda no cliente após hydration. O `MobileMenuMotion` (já `client:load`) adiciona um listener via `useEffect`. O timing é seguro porque `client:load` garante que o React island está montado antes que qualquer clique do usuário ocorra.

**Cuidados:**
- O listener no `useEffect` precisa retornar cleanup (`removeEventListener`) para evitar memory leak.
- O `isOpen` deve ser estado local React (`useState`) dentro do `MobileMenuMotion`, NÃO mais uma prop de `index.astro`. O `index.astro` deixa de passar `isOpen`.
- O `MobileMenuMotion` existente já aceita `isOpen` como prop — será refatorado para gerenciar o estado internamente, ouvindo o CustomEvent. [ASSUMED: que esta mudança de API (prop→estado interno) não quebra outros consumers; verificar se MobileMenuMotion é usado em outros lugares antes de alterar]

**Pattern verificado:** [CITED: docs.astro.build/en/guides/client-side-scripts/] — Astro suporta script tags que interagem com o DOM cliente; o CustomEvent pattern é validado por múltiplas fontes da comunidade Astro.

---

### Tópico 2: Animações de Scroll (Hero + Pricing)

**Decisão: `motion/react` com `whileInView` + `MotionConfig reducedMotion="user"`**

**APIs verificadas:**

**`whileInView` prop** [CITED: motion.dev/docs/react-motion-component]:
```tsx
// Import correto: from "motion/react"
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
  viewport={{ once: true, amount: 0.3 }}
/>
```

`viewport={{ once: true }}` impede re-trigger ao sair/entrar do viewport. `amount: 0.3` significa "30% do elemento visível antes de disparar". [CITED: motion.dev/docs/react-scroll-animations]

**`MotionConfig reducedMotion="user"`** [CITED: motion.dev/docs/react-accessibility]:
```tsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">
  {/* Todos os filhos respeitam prefers-reduced-motion automaticamente */}
  {/* Desabilita transforms/layouts mas preserva opacity e color */}
</MotionConfig>
```

Quando `reducedMotion="user"`, o Motion automaticamente desabilita animações de transform/layout para usuários com `prefers-reduced-motion: reduce`, sem necessidade de verificação manual em cada componente. [CITED: motion.dev/docs/react-accessibility]

**Relação com `useMotionEnabled` existente:**
- `useMotionEnabled` em `motion-utils.ts` já lida com a preferência do usuário via localStorage + `useReducedMotion()`.
- `MotionConfig reducedMotion="user"` no `index.astro` adiciona cobertura declarativa como segunda camada de segurança para componentes que usam `whileInView` sem consultar `useMotionEnabled`.
- As duas abordagens são complementares, não conflitantes.

**Approach para Hero e Pricing:**
- Criar componentes React wrapper mínimos (e.g., `HeroFadeIn.tsx`, ou diretamente inlinear o `motion.div` em um island wrapper) para os elementos que precisam de fade-in.
- Alternativamente: usar um `<script>` com `IntersectionObserver` nativo + classe CSS para manter Hero e Pricing como Astro puro. [ASSUMED: que os requisitos de animação do Hero são suficientemente simples (opacity + translateY) para que ambas as abordagens funcionem; verificar se há animações encadeadas/stagger]

**Recomendação:** Para fade-in simples (opacity + translateY), um island React wrapper é mais limpo e reutilizável. Para Pricing Cards (hover), CSS puro é melhor (ver Tópico 4).

**Import correto verificado:** `from "motion/react"` para componentes React. `from "motion"` para animações imperativas (como já usado no `CarouselMotion`). [CITED: motion.dev/docs/react-animation]

---

### Tópico 3: Sticky NavBar

**Decisão: CSS `position: sticky` + IntersectionObserver para toggle de classe (zero motion/react)**

**Racional:**

O NavBar já usa `position: sticky; top: 0` com `background: rgba(10, 15, 30, 0.85)`. O que falta é a transição suave quando o usuário rola além do Hero.

**Pattern correto (zero JS, preferido):**

O NavBar já tem `position: sticky` via CSS. Para adicionar shadow/background mais opaco ao rolar:

```css
/* NavBar.astro <style> */
.nav {
  transition: background 0.2s ease-out, box-shadow 0.2s ease-out;
}
.nav[data-scrolled="true"] {
  background: rgba(10, 15, 30, 0.97);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
```

```js
/* NavBar.astro <script> */
// Sentinel invisível no topo da página (ou usar o #top do Hero)
const sentinel = document.getElementById("top");
const nav = document.querySelector(".nav");
const io = new IntersectionObserver(
  ([entry]) => {
    nav.dataset.scrolled = String(!entry.isIntersecting);
  },
  { threshold: 0 }
);
if (sentinel) io.observe(sentinel);
```

**Por que NÃO usar motion/react aqui:**
1. NavBar.astro é um componente Astro server-rendered — convertê-lo a React adiciona hidratação desnecessária e risco de CLS.
2. CSS `transition` + `position: sticky` é GPU-accelerated e não bloqueia o main thread.
3. IntersectionObserver tem overhead mínimo versus scroll listener. [CITED: taylor.callsen.me/modern-navigation-menus — IntersectionObserver padrão para sticky nav]

**Impacto em CLS:** `position: sticky` não causa CLS porque o elemento já ocupa espaço no layout. A transição de cor/sombra afeta apenas paint, não layout. CLS = 0 para este approach. [ASSUMED: que a transition de `box-shadow` e `background` não causa reflow — confirmado por MDN e Tobias Ahlin; animações que afetam apenas paint são seguras]

**Estado ativo nos links de navegação:** Usar `aria-current="page"` ou classe CSS baseada em `Astro.url.pathname` (build-time) + CSS para indicador visual. Não requer JS.

---

### Tópico 4: Hover em Pricing Cards

**Decisão: CSS `transition` puro — sem motion/react**

**Racional:**

`Pricing.astro` é um componente Astro estático com um único card de preço. Para hover com elevação sutil:

```css
/* Pricing.astro <style> */
.price-card {
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
  will-change: transform;
}

.price-card:hover {
  transform: translateY(-4px) scale(1.01);
  /* Animando box-shadow diretamente causa repaint; preferir pseudo-element trick */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--nucleo-eletrico);
}

/* Indicador de foco acessível (WCAG 2.1 AA) */
.price-card:focus-within {
  outline: 2px solid var(--nucleo-eletrico);
  outline-offset: 4px;
}
```

**Comparação de performance:**
| Approach | Bundle adicionado | TBT impact | CLS risk | GPU-accelerated |
|---|---|---|---|---|
| CSS `transform` + `box-shadow` | 0 KB | 0 ms | 0 | Sim (transform) |
| `motion.div whileHover` | Requer React hydration de Pricing.astro | +JS parse time | Potencial (hidratação) | Sim |

CSS puro com `transform` e `opacity` é GPU-accelerated e não bloqueia o main thread. [CITED: tobiasahlin.com/blog/how-to-animate-box-shadow — pattern de pseudo-element para box-shadow performático]

**Indicadores de foco acessíveis:** `:focus-within` no `.price-card` e `:focus-visible` nos links/botões internos cobrem WCAG 2.1 AA. Não requer JS.

**`prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  .price-card {
    transition: none;
  }
  .price-card:hover {
    transform: none;
    /* Manter apenas mudança de cor/borda para sinalizar estado */
    box-shadow: 0 0 0 2px var(--nucleo-eletrico);
  }
}
```

---

### Tópico 5: CarouselMotion com Depoimentos Reais

**Decisão: Dados hardcoded em `index.astro`, passados como prop `items`. `Testimonials.astro` substituído.**

**Estrutura dos dados reais** (extraída de `Testimonials.astro`):

```tsx
// Em index.astro (frontmatter TypeScript)
const testimonialItems = [
  {
    id: "rafael-m",
    content: /* JSX com o card completo */
  },
  {
    id: "juliana-s",
    content: /* JSX */
  },
  {
    id: "diego-a",
    content: /* JSX */
  }
];
```

**Problema de tipo:** `CarouselMotion` aceita `items: Item[]` onde `Item.content: React.ReactNode`. Passar JSX como `content` em `index.astro` funciona porque `index.astro` pode usar sintaxe JSX com `client:load`. [ASSUMED: que o Astro 6.x permite JSX como valor de variável no frontmatter quando React está configurado — verificar se é necessário usar `.tsx` wrapper em vez de `.astro`]

**Alternativa mais segura:** Definir os dados como objetos literais (strings + arrays) e criar um componente `TestimonialCard.tsx` separado que recebe os dados estruturados e renderiza o JSX. O `CarouselMotion` receberia `items` com `content: <TestimonialCard data={item} />`.

```tsx
// src/components/TestimonialCard.tsx
interface TestimonialData {
  initials: string;
  quote: string;
  name: string;
  role: string;
}

export const TestimonialCard: React.FC<{ data: TestimonialData }> = ({ data }) => (
  // replica o HTML do .quote em Testimonials.astro
);
```

Esta abordagem é preferida: separa dados de apresentação, é tipada, e mantém o `CarouselMotion` genérico. [CITED: princípio geral de separação de concerns — dados estruturados são mais fáceis de serializar em Astro props]

**Substituir vs. complementar `Testimonials.astro`:**
- Substituir: remover `<Testimonials />` do `index.astro` e usar apenas `<CarouselMotion client:load items={testimonialItems} />`.
- Complementar: manter `<Testimonials />` como fallback SSR + `<CarouselMotion />` sobreposto. Complexidade desnecessária.
- **Decisão: Substituir.** O `CarouselMotion` renderiza os cards completos; `Testimonials.astro` deixa de ser usado na página principal. [ASSUMED: que não há outra página que importe `Testimonials.astro`]

**Pattern de passagem de dados Astro → React:** Props são serializadas em build-time. Objetos simples (strings, números, arrays de objetos planos) funcionam diretamente. React.ReactNode NÃO pode ser passado como prop Astro — usar dados estruturados + componente React para renderizar. [CITED: docs.astro.build — props de componentes UI framework devem ser serializáveis]

---

## Não Construir do Zero

| Problema | Não construir | Usar em vez disso | Por que |
|---|---|---|---|
| Scroll-triggered animations | IntersectionObserver manual com state React | `motion/react` `whileInView` | Pool de IntersectionObserver nativo, API declarativa, integração com MotionConfig |
| Reduced motion detection | `window.matchMedia("(prefers-reduced-motion)")` manual | `useReducedMotion()` de `motion/react` + `MotionConfig` | Já encapsulado em `motion-utils.ts`; duplicação desnecessária |
| Sticky NavBar com JS | scroll listener | `IntersectionObserver` + CSS | Scroll listener roda no main thread a cada pixel; IO tem threshold-based calls |
| CSS hover com repaint pesado | `box-shadow` transition direta | `transform: translateY + scale` + `filter` | GPU-composited, sem layout reflow |

---

## Armadilhas Comuns

### Armadilha 1: MobileMenuMotion com `isOpen` como prop de index.astro
**O que dá errado:** O `index.astro` atual passa `isOpen={false}` como prop hardcoded. Se a lógica de toggle ficar em `index.astro`, o componente não terá como re-renderizar com o novo estado — Astro não re-renderiza componentes no cliente.
**Causa raiz:** Confundir props de build-time com estado reativo.
**Como evitar:** Mover `isOpen` para `useState` dentro do `MobileMenuMotion`. O CustomEvent é ouvido dentro do componente, não passado como prop.
**Sinal de alerta:** `isOpen` vindo como prop de `.astro` file é sempre um bug em potencial.

### Armadilha 2: Timing do CustomEvent vs. Hydration
**O que dá errado:** O `<script>` do NavBar.astro dispara o evento antes do React island estar montado (ex: se o usuário clicasse no hamburger antes do JS carregar).
**Causa raiz:** `client:load` não é instantâneo — há um pequeno delay de hydration.
**Como evitar:** O `<script>` só é acessível após a página carregar; um click do usuário sempre ocorre após a hydration no `client:load`. O risco real é zero em prática, mas o listener deve usar `{ once: false }` para persistir. O `MobileMenuMotion` deve adicionar o listener em `useEffect` com cleanup.
**Sinal de alerta:** Não fazer cleanup do listener em `useEffect` = memory leak em SPA navigation.

### Armadilha 3: `whileInView` em componentes Astro server-rendered
**O que dá errado:** Tentar usar `<motion.div whileInView>` diretamente em `Hero.astro` ou `Pricing.astro`.
**Causa raiz:** `motion/react` requer um React environment (window, hydration). Não existe em componentes Astro puros.
**Como evitar:** Criar wrapper React island (`client:load` ou `client:visible`) para os elementos animados. Ou usar `<script>` com IntersectionObserver + CSS class toggle.
**Sinal de alerta:** Importar `from "motion/react"` em arquivo `.astro` vai quebrar o build.

### Armadilha 4: `box-shadow` transition causa CLS
**O que dá errado:** Animar `box-shadow` em elementos que afetam o layout pode causar repaint de toda a página em navegadores antigos.
**Causa raiz:** `box-shadow` não é completamente composited em todos os browsers.
**Como evitar:** Usar `transform: translateY()` para o efeito de elevação (composited) e `filter: drop-shadow()` para sombra em SVGs. Para cards, o `box-shadow` em hover-state (não animado continuamente) tem impacto mínimo — o risco real é no NavBar scrolled onde a transição é contínua.
**Sinal de alerta:** LCP ou CLS piorando após adicionar NavBar scrolled transition — verificar com Lighthouse CI.

### Armadilha 5: JSX como prop de `index.astro` para `CarouselMotion`
**O que dá errado:** Tentar passar `content: <div>...</div>` como prop em `.astro` frontmatter — o Astro não serializa React elements como props.
**Causa raiz:** Props de componentes React em Astro são serializadas para JSON durante build. React elements não são JSON-serializáveis.
**Como evitar:** Usar dados estruturados (objetos planos) + componente React `TestimonialCard` para renderizar o JSX dentro do island.
**Sinal de alerta:** Build error "cannot serialize React element" ou tipo `React.ReactNode` em prop de `.astro`.

### Armadilha 6: `MotionConfig` fora do React tree
**O que dá errado:** Colocar `<MotionConfig>` em `Layout.astro` (server-rendered) — não tem efeito.
**Causa raiz:** `MotionConfig` usa React Context; só funciona dentro de um React tree hidratado.
**Como evitar:** Colocar `<MotionConfig reducedMotion="user">` como wrapper no `index.astro` envolvendo apenas os islands React, ou dentro de cada island que usa `whileInView`.
**Sinal de alerta:** `reducedMotion="user"` não respeitado — animações ainda rodam com reduced motion habilitado.

---

## Exemplos de Código

### Padrão 1: CustomEvent hamburger → MobileMenuMotion

```tsx
// MobileMenuMotion.tsx — isOpen como estado interno
// Source: pattern CustomEvent + useEffect cleanup (docs.astro.build/guides/client-side-scripts)
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useMotionEnabled, applyFallback } from "../lib/motion-utils";

export const MobileMenuMotion: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [motionEnabled] = useMotionEnabled();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-menu", handler);
    return () => window.removeEventListener("toggle-menu", handler);
  }, []);

  // ... resto do componente inalterado
};
```

```astro
<!-- NavBar.astro — botão hamburger + script -->
<!-- Source: docs.astro.build/guides/client-side-scripts -->
<button
  class="hamburger"
  aria-label="Abrir menu de navegação"
  aria-expanded="false"
  id="hamburger-btn"
>
  <!-- ícone SVG -->
</button>

<script>
  const btn = document.getElementById("hamburger-btn");
  let menuOpen = false;

  btn?.addEventListener("click", () => {
    menuOpen = !menuOpen;
    btn.setAttribute("aria-expanded", String(menuOpen));
    window.dispatchEvent(new CustomEvent("toggle-menu"));
  });
</script>
```

### Padrão 2: whileInView com MotionConfig

```tsx
// Exemplo de uso em island React wrapper para Hero
// Source: motion.dev/docs/react-motion-component, motion.dev/docs/react-accessibility
import { motion, MotionConfig } from "motion/react";

export const HeroFadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="user">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  </MotionConfig>
);
```

```astro
<!-- index.astro — uso do wrapper -->
<HeroFadeIn client:visible>
  <!-- conteúdo do hero que anima ao entrar no viewport -->
</HeroFadeIn>
```

**Nota sobre `client:visible`:** Preferir `client:visible` sobre `client:load` para islands de animação de scroll — só hidrata quando o elemento está próximo do viewport, reduzindo TBT na carga inicial. [CITED: docs.astro.build/en/reference/directives-reference/#clientvisible]

### Padrão 3: Sticky NavBar com IntersectionObserver

```astro
<!-- NavBar.astro -->
<script>
  // Observa o elemento #top (já existe no Hero.astro como <header id="top">)
  const nav = document.querySelector(".nav") as HTMLElement | null;
  const sentinel = document.getElementById("top");

  if (nav && sentinel) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        nav.dataset.scrolled = String(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
  }
</script>
```

```css
/* NavBar.astro <style> — adicionar ao bloco existente */
.nav {
  transition: background 0.2s ease-out, box-shadow 0.2s ease-out;
}

.nav[data-scrolled="true"] {
  background: rgba(10, 15, 30, 0.97);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
}

@media (prefers-reduced-motion: reduce) {
  .nav {
    transition: none;
  }
}
```

### Padrão 4: Hover em Pricing Cards — CSS puro

```css
/* Pricing.astro <style> */
.price-card {
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
  will-change: transform;
}

.price-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px var(--nucleo-eletrico);
}

.price-card:focus-within {
  outline: 2px solid var(--nucleo-eletrico);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .price-card {
    transition: box-shadow 0.15s ease-out; /* apenas cor/sombra, sem transform */
  }
  .price-card:hover {
    transform: none;
    box-shadow: 0 0 0 2px var(--nucleo-eletrico);
  }
}
```

### Padrão 5: Dados de Depoimentos para CarouselMotion

```tsx
// src/components/TestimonialCard.tsx
// Source: princípio de separação dados/apresentação
export interface TestimonialData {
  id: string;
  initials: string;
  quote: string;
  name: string;
  role: string;
}

export const TestimonialCard: React.FC<{ data: TestimonialData }> = ({ data }) => (
  <div className="quote">
    {/* stars SVG */}
    <blockquote>{data.quote}</blockquote>
    <div className="quote-author">
      <div className="avatar">{data.initials}</div>
      <div className="who">
        <b>{data.name}</b>
        <small>{data.role}</small>
      </div>
    </div>
  </div>
);
```

```tsx
// index.astro frontmatter (TypeScript)
import { TestimonialCard, type TestimonialData } from "../components/TestimonialCard";

const testimonials: TestimonialData[] = [
  {
    id: "rafael-m",
    initials: "RM",
    quote: "O módulo de Zero Trust e Bastion sozinho já pagou a mentoria...",
    name: "Rafael M.",
    role: "SR. CLOUD ENGINEER · FINTECH",
  },
  {
    id: "juliana-s",
    initials: "JS",
    quote: "Eu já era Senior, mas não conseguia explicar arquitetura para diretoria...",
    name: "Juliana S.",
    role: "CLOUD ARCHITECT · SAAS B2B",
  },
  {
    id: "diego-a",
    initials: "DA",
    quote: "Spot VMs + Reserved + auto-shutdown via CLI cortou 38% do meu billing mensal...",
    name: "Diego A.",
    role: "DEVOPS LEAD · CONSULTORIA",
  },
];

const carouselItems = testimonials.map((t) => ({
  id: t.id,
  content: <TestimonialCard data={t} />,
}));
```

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual | Desde | Impacto |
|---|---|---|---|
| `framer-motion` import | `motion/react` import | Motion 10.x | Nome do pacote mudou; `motion` é o upstream oficial |
| `scroll` listener para sticky nav | `IntersectionObserver` | 2019 (browsers) | Performance significativamente melhor; sem throttling manual |
| Parallax via transform no scroll | `whileInView` fade-in | WCAG 2.1 (2018) | Acessibilidade; parallax causa motion sickness |
| Estado global React Context entre islands | nanostores ou CustomEvent | Astro 2.x+ | Context não atravessa island boundaries em Astro |

**Deprecado/Obsoleto:**
- `@motionone/dom`: substituído por `motion` (imperativo). O projeto já migrou.
- `framer-motion`: substituído por `motion/react`. O projeto já usa o correto.
- Scroll listeners para sticky: IntersectionObserver é o padrão moderno.

---

## Log de Hipóteses

| # | Afirmação | Seção | Risco se errado |
|---|---|---|---|
| A1 | `MobileMenuMotion` não é usado em outras páginas além de `index.astro` | Tópico 1 | Mudança de API `isOpen` prop → estado interno quebraria outros usos |
| A2 | Astro 6.x permite JSX inline em frontmatter `.astro` quando React está configurado | Tópico 5 | Necessário verificar; solução alternativa: `TestimonialCard` + dados planos já cobre este risco |
| A3 | `client:visible` tem suporte adequado nos browsers-alvo (sem polyfill) | Tópico 2 | IntersectionObserver tem 97%+ suporte global; risco baixo |
| A4 | A `transition` de `box-shadow` no NavBar scrolled não causa degradação de CLS mensurável | Tópico 3 | Verificar com Lighthouse CI após implementação; fallback é `transition: none` |

---

## Disponibilidade de Ambiente

| Dependência | Requerida por | Disponível | Versão | Fallback |
|---|---|---|---|---|
| `motion` (npm) | whileInView, motion.nav | Sim (no package.json) | 12.38.0 | — |
| `IntersectionObserver` (browser API) | Sticky NavBar, client:visible | Sim (97%+ suporte global) | — | CSS-only sticky (já existe) |
| `CustomEvent` (browser API) | hamburger toggle | Sim (suporte universal) | — | — |
| `@nanostores/react` | — | Não instalado | — | NÃO NECESSÁRIO — CustomEvent usado |
| Vitest + happy-dom | unit tests | Sim (devDependencies) | vitest 3.2.4 | — |
| Playwright | e2e tests | Sim (devDependencies) | 1.59.1 | — |

---

## Arquitetura de Validação

> `workflow.nyquist_validation` não está explicitamente definido no `.planning/config.json` — tratado como habilitado.

### Framework de Testes
| Propriedade | Valor |
|---|---|
| Framework unit | Vitest 3.2.4 |
| Framework e2e | Playwright 1.59.1 |
| Config unit | `vitest.config.ts` (implícito pelo package.json scripts) |
| Comando rápido | `npm run test:unit` |
| Suite completa | `npm run test:all` |
| e2e | `npm run test:axe` / `npx playwright test` |

### Mapa Requisito → Teste

| Req ID | Comportamento | Tipo de Teste | Comando automatizado | Arquivo existe? |
|---|---|---|---|---|
| MOB-01 | hamburger toggle abre/fecha menu | unit | `vitest run tests/unit/components/MobileMenuMotion.test.tsx` | ❌ Wave 0 |
| MOB-02 | CustomEvent "toggle-menu" dispara o handler | unit | `vitest run tests/unit/components/MobileMenuMotion.test.tsx` | ❌ Wave 0 |
| MOB-03 | aria-expanded atualiza no botão | e2e | `playwright test tests/e2e/homepage.spec.ts -g "hamburger"` | ❌ Wave 0 (adicionar ao existente) |
| SCR-01 | fade-in dispara ao entrar no viewport | unit (mock IO) | `vitest run tests/unit/components/HeroFadeIn.test.tsx` | ❌ Wave 0 |
| SCR-02 | whileInView não anima com reduced-motion | unit | `vitest run tests/unit/components/HeroFadeIn.test.tsx` | ❌ Wave 0 |
| NAV-01 | data-scrolled="true" adicionado ao rolar | unit (mock IO) | `vitest run tests/unit/components/NavBar.test.ts` | ❌ Wave 0 |
| CAR-01 | CarouselMotion recebe 3 items reais | unit | `vitest run tests/unit/components/CarouselMotion.test.tsx` | ❌ Wave 0 (atualizar existente) |
| CAR-02 | cada depoimento real renderiza nome e quote | unit | `vitest run tests/unit/components/TestimonialCard.test.tsx` | ❌ Wave 0 |
| HOV-01 | price-card hover tem transform (visual) | e2e | `playwright test tests/e2e/homepage.spec.ts -g "pricing hover"` | ❌ Wave 0 |
| A11Y-01 | foco em price-card visível (outline) | e2e axe | `npm run test:axe` | Parcial (motion-accessibility.spec.ts existe) |

### Taxa de Amostragem
- **Por commit de task:** `npm run test:unit`
- **Por merge de wave:** `npm run test:all`
- **Phase gate:** Suite completa verde antes de `/gsd:verify-work`

### Gaps de Wave 0
- [ ] `tests/unit/components/MobileMenuMotion.test.tsx` — cobre MOB-01, MOB-02
- [ ] `tests/unit/components/HeroFadeIn.test.tsx` — cobre SCR-01, SCR-02
- [ ] `tests/unit/components/NavBar.test.ts` — cobre NAV-01 (mock IntersectionObserver)
- [ ] `tests/unit/components/TestimonialCard.test.tsx` — cobre CAR-02
- [ ] Atualizar `tests/unit/components/CarouselMotion.test.*` (se existir) para dados reais — cobre CAR-01
- [ ] Adicionar cenário "hamburger" em `tests/e2e/homepage.spec.ts` — cobre MOB-03, HOV-01

---

## Domínio de Segurança

> `security_enforcement` não está explicitamente definido no config — tratado como habilitado.

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|---|---|---|
| V2 Autenticação | Não | — (landing page pública) |
| V3 Sessão | Não | — |
| V4 Controle de Acesso | Não | — |
| V5 Validação de Input | Sim (limitado) | CustomEvent não carrega dados do usuário; sem input validation necessária |
| V6 Criptografia | Não | — |

### Padrões de Ameaça Conhecidos para Esta Stack

| Padrão | STRIDE | Mitigação Padrão |
|---|---|---|
| XSS via `innerHTML` em CustomEvent detail | Tampering | NÃO usar `event.detail` para renderizar HTML; o CustomEvent apenas sinaliza toggle boolean |
| Prototype pollution via `Object.assign` em props | Tampering | Dados de depoimentos são literais TypeScript hardcoded; sem input do usuário |
| clickjacking via iframe | Spoofing | `X-Frame-Options` / `Content-Security-Policy` no servidor (fora do escopo desta fase) |

**Nota de segurança específica:** O CustomEvent `"toggle-menu"` não deve carregar dados no `detail` — apenas dispara o toggle. Evitar `event.detail.isOpen` porque qualquer script malicioso na página poderia despachar o evento. O estado é mantido dentro do React component. [CITED: princípio de não confiar em dados externos via eventos DOM]

---

## Fontes

### Primárias (confiança HIGH)
- [motion.dev/docs/react-motion-component](https://motion.dev/docs/react-motion-component) — `whileInView`, import correto, viewport prop
- [motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations) — scroll-triggered animations
- [motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility) — `MotionConfig reducedMotion="user"`, `useReducedMotion`
- [motion.dev/docs/react-use-in-view](https://motion.dev/docs/react-use-in-view) — `useInView` hook API
- [docs.astro.build/en/recipes/sharing-state-islands/](https://docs.astro.build/en/recipes/sharing-state-islands/) — nanostores limitation com Astro server components
- [docs.astro.build/en/guides/client-side-scripts/](https://docs.astro.build/en/guides/client-side-scripts/) — script tags e CustomEvent no Astro
- npm registry — versões verificadas: `motion@12.38.0`, `nanostores@1.3.0`, `@nanostores/react@1.1.0`

### Secundárias (confiança MEDIUM)
- [taylor.callsen.me — sticky nav com IntersectionObserver](https://taylor.callsen.me/modern-navigation-menus-with-css-position-sticky-and-intersectionobservers/) — padrão sticky + IO
- [tobiasahlin.com/blog/how-to-animate-box-shadow](https://tobiasahlin.com/blog/how-to-animate-box-shadow/) — performance de box-shadow
- Codebase: `src/components/MobileMenuMotion.tsx`, `src/components/CarouselMotion.tsx`, `src/lib/motion-utils.ts`, `src/components/sections/Testimonials.astro` — lidos diretamente

### Terciárias (confiança LOW — marcadas para validação)
- WebSearch resultados sobre CustomEvent + React useEffect pattern — corroborado por docs oficiais Astro

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: HIGH — motion já instalado e verificado no registry; nanostores verificado como desnecessário via docs oficiais Astro
- Arquitetura: HIGH — padrão CustomEvent verificado via docs.astro.build; whileInView verificado via motion.dev
- Armadilhas: HIGH — derivadas de leitura direta do código existente + docs oficiais
- Dados de depoimentos: HIGH — lidos diretamente de `Testimonials.astro`

**Data da pesquisa:** 2026-05-15
**Válido até:** 2026-06-15 (30 dias — stack estável; Motion 12.x em desenvolvimento ativo mas API de scroll stable)
