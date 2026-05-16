---
phase: 04-animation-implementation
reviewed: 2026-05-16T00:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - src/components/CarouselMotion.tsx
  - src/components/HeroMotion.tsx
  - src/components/layout/NavBar.astro
  - src/components/MobileMenuMotion.tsx
  - src/components/sections/Bonuses.astro
  - src/components/sections/Curriculum.astro
  - src/components/sections/Faq.astro
  - src/components/sections/ForWho.astro
  - src/components/sections/Mentor.astro
  - src/components/sections/Method.astro
  - src/components/sections/PainPoints.astro
  - src/components/sections/Pricing.astro
  - src/components/sections/Testimonials.astro
  - src/components/SettingsToggle.tsx
  - src/components/ui/Button.astro
  - src/layouts/Layout.astro
  - src/lib/motion-utils.ts
  - tests/unit/components/HeroMotion.test.tsx
  - tests/unit/components/SettingsToggle.test.ts
  - tests/unit/lib/motion-utils.test.ts
  - tests/unit/motion-utils.test.ts
findings:
  critical: 4
  warning: 9
  info: 3
  total: 16
status: issues_found
---

# Phase 04: Code Review Report

**Revisado:** 2026-05-16T00:00:00Z
**Profundidade:** standard
**Arquivos Revisados:** 21
**Status:** issues_found

## Resumo

Esta fase adicionou infraestrutura de animação completa: scroll-reveal via IntersectionObserver, tokens de easing CSS, animações spring no SettingsToggle, variantes de stagger no HeroMotion e stagger via `animation-delay` nos sections Bonuses e Pricing.

A implementação está funcionalmente coerente na maior parte. Foram identificados quatro problemas críticos: um crash garantido quando a seção `#top` não existe no DOM (sentinel nulo sem proteção de tipo), a ausência total de suporte a `prefers-reduced-motion` no mecanismo de stagger CSS dos sections Pricing (o `@media` de Bonuses mitiga apenas parcialmente porque Pricing não tem a sua própria regra), um race condition entre o handler de `toggle-menu` e o atributo `aria-expanded` do botão hambúrguer, e uma incompatibilidade silenciosa entre o caminho B do HeroMotion (single-child via `querySelectorAll`) e o `MotionConfig reducedMotion="user"` que não afeta animações CSS aplicadas diretamente via `el.style.animationDelay`. Há também nove avisos relevantes de qualidade/robustez e três itens informativos.

---

## Achados Críticos

### CR-01: `applyFallback` chamado sem guarda de SSR — crash em Node/Edge

**Arquivo:** `src/lib/motion-utils.ts:106`

**Problema:** A função `applyFallback` chama `window.matchMedia(...)` na linha 106 diretamente, sem verificar se `window` está definido. A função `isMotionSupported()` existe exatamente para essa finalidade, mas não é usada aqui. Em ambientes de SSR (Node, Astro SSR, workers), qualquer chamada a `applyFallback` — mesmo que condicionada externamente — causará `ReferenceError: window is not defined` se o bundler fizer tree-shaking conservador ou se o módulo for importado em contexto de servidor.

**Correção:**
```typescript
export function applyFallback(
  element: HTMLElement,
  properties: Partial<CSSStyleDeclaration>
): void {
  if (typeof window === "undefined") return; // guarda SSR
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  Object.assign(element.style, {
    ...(prefersReduced ? {} : { transition: "all 150ms cubic-bezier(0.0, 0.0, 0.2, 1)" }),
    ...properties,
  });
}
```

---

### CR-02: NavBar — sentinel `#top` pode ser `null`; `as HTMLElement | null` ignora o caso

**Arquivo:** `src/components/layout/NavBar.astro:172-187`

**Problema:** O código faz `const sentinel = document.getElementById("top")` e verifica `if (nav && sentinel)`, porém o elemento com `id="top"` não é declarado em nenhum dos arquivos revisados. Se a âncora não existir no HTML gerado (ex.: em páginas futuras, rotas SSR, testes E2E), `sentinel` será `null` e o observer nunca será registrado — sem qualquer mensagem de erro. Isso silencia um problema estrutural: o mecanismo de `data-scrolled` nunca dispara e a navbar permanece visualmente "não scrollada" mesmo quando a página está rolada. Adicionalmente, caso alguém remova o elemento `#top` acidentalmente, não há aviso.

Ao mesmo tempo, se `sentinel` existir mas a âncora estiver dentro do `<body>` como elemento real (não a tag `<a>` com `href="#top"`), o `IntersectionObserver` observará o elemento errado.

**Correção:**
```astro
<script>
  const nav = document.querySelector(".nav") as HTMLElement | null;
  const sentinel = document.getElementById("top");
  if (!nav) return;
  if (!sentinel) {
    // Fallback: verificar posição de scroll diretamente
    const onScroll = () => {
      nav.dataset.scrolled = String(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("astro:before-swap", () => {
      window.removeEventListener("scroll", onScroll);
    }, { once: true });
    return;
  }
  // ... resto do observer
</script>
```

---

### CR-03: MobileMenuMotion — `Escape` fecha o menu sem sincronizar `aria-expanded` no botão

**Arquivo:** `src/components/MobileMenuMotion.tsx:27-36`

**Problema:** O handler de `Escape` despacha um novo `CustomEvent("toggle-menu")` para fechar o menu. O botão hambúrguer em `NavBar.astro` escuta esse evento para **alternar** `menuOpen` local e atualizar `aria-expanded`. Porém, a variável `menuOpen` em `NavBar.astro:193` é local ao closure do script e não é compartilhada com `MobileMenuMotion`. Quando `Escape` dispara, `NavBar.astro` recebe o evento e togla `menuOpen` corretamente — **se e somente se** o estado interno do script da NavBar estiver em sincronia com o estado React de `MobileMenuMotion`.

O problema concreto: se o usuário abrir o menu (dispatch → `menuOpen=true` em NavBar, `isOpen=true` em React), então fechar via Escape (dispatch de volta → `menuOpen=false` em NavBar, `isOpen=false` em React), está correto. Mas se algum re-render React ou HMR resetar `isOpen` sem disparar o event, a NavBar ficará com `aria-expanded="true"` enquanto o menu está fechado. Este é um estado desincronizado garantido na primeira renderização em React StrictMode (double-invoke de effects).

Adicionalmente, ao pressionar Escape com o menu fechado (`isOpen=false`), o effect do handler de keydown não é registrado (condição `if (!isOpen) return` na linha 28), o que é correto. Mas se o menu for fechado via click no overlay ou outro mecanismo externo (não via dispatch), o handler continua ativo e pode disparar um toggle indesejado.

**Correção:** Usar um `CustomEvent` com `detail: { open: false }` para comunicar o estado desejado explicitamente, em vez de toggle cego:

```typescript
// Em MobileMenuMotion.tsx — fechar com estado explícito
window.dispatchEvent(new CustomEvent("set-menu", { detail: { open: false } }));

// Em NavBar.astro — ouvir estado explícito
btn.addEventListener("click", () => {
  menuOpen = !menuOpen;
  btn.setAttribute("aria-expanded", String(menuOpen));
  window.dispatchEvent(new CustomEvent("toggle-menu"));
});
window.addEventListener("set-menu", (e: Event) => {
  const { open } = (e as CustomEvent).detail;
  menuOpen = open;
  btn.setAttribute("aria-expanded", String(open));
});
```

---

### CR-04: HeroMotion caminho B — `MotionConfig reducedMotion="user"` não suprime animações CSS

**Arquivo:** `src/components/HeroMotion.tsx:60-89`

**Problema:** No caminho B (single-child), `HeroMotionSingle` adiciona `animationDelay` via `el.style.animationDelay` e a classe `hero-stagger-item` (linha 72-73) diretamente no DOM. O `MotionConfig reducedMotion="user"` envolve o componente, mas **esse mecanismo é exclusivo do runtime motion/react** e afeta apenas animações controladas por `motion.*` components. As animações CSS adicionadas diretamente via `classList.add("hero-stagger-item")` são completamente ignoradas pelo `MotionConfig`.

Consequência: se o usuário tiver `prefers-reduced-motion: reduce` ativado, o `MotionConfig` suprimirá animações do caminho A (multi-child com `motion.div`) corretamente, mas no caminho B as classes CSS `hero-stagger-item` ainda serão aplicadas com os `animationDelay` calculados. Se a folha de estilo global não incluir uma regra `@media (prefers-reduced-motion: reduce) { .hero-stagger-item { animation: none; } }`, os elementos **vão animar mesmo com reduced-motion ativo** — violando WCAG 2.3.3 (Animation from Interactions, AAA).

Nenhum dos arquivos revisados define um `@media (prefers-reduced-motion: reduce)` para `.hero-stagger-item`. A regra global em `Layout.astro:206-212` cobre `[data-reveal]` e `[data-stagger]`, mas não `.hero-stagger-item`.

**Correção:**
```typescript
// Em HeroMotionSingle — verificar a media query antes de aplicar
useEffect(() => {
  if (!containerRef.current) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return; // respeitar preferência do sistema

  const targets = containerRef.current.querySelectorAll<HTMLElement>(
    "h1, p.hero-sub, .hero-cta-row, .hero-points, .hero-meta, .eyebrow"
  );
  targets.forEach((el, i) => {
    el.style.animationDelay = `${i * 120}ms`;
    el.classList.add("hero-stagger-item");
  });
}, []);
```

E adicionar ao CSS global em `Layout.astro`:
```css
@media (prefers-reduced-motion: reduce) {
  .hero-stagger-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

---

## Avisos

### WR-01: `CarouselMotion` — keyboard navigation sobrescreve posição sem parar auto-scroll definitivamente

**Arquivo:** `src/components/CarouselMotion.tsx:85-92`

**Problema:** O handler de teclado pausa o auto-scroll (`animationRef.current.pause()`) ao navegar por teclado, mas nunca retoma nem descarta o loop de animação. O usuário que navega via teclado fica preso com o scroll pausado para sempre, sem indicação visual de que o auto-play pode ser retomado. Além disso, `animate(el, { x: targetX }, ...)` na linha 92 cria uma nova animação avulsa **concorrente** com `animationRef.current` (que continua existindo pausado). Quando o `CarouselMotion` receber um novo `motionEnabled` e o `useEffect` roda novamente, `.stop()` na linha 25 cancela o auto-scroll original, mas a animação avulsa de keyboard não é armazenada e não pode ser cancelada.

**Correção:** Armazenar a animação de keyboard em `animationRef.current`:
```typescript
animationRef.current = animate(el, { x: targetX }, { duration: 0.15, ease: [0.0, 0.0, 0.2, 1] });
```

---

### WR-02: `CarouselMotion` — `items.length === 0` causa divisão por zero implícita

**Arquivo:** `src/components/CarouselMotion.tsx:33`

**Problema:** A expressão `(items.length - 1) / items.length` retorna `NaN` quando `items.length === 0`. O valor `NaN` é serializado como `"NaN%"` na string do template, resultando em `x: ["0%", "NaN%"]` passado para `animate()`. O comportamento é indefinido e pode causar erros silenciosos ou animações quebradas.

**Correção:**
```typescript
if (items.length === 0) return; // adicionar antes do useEffect body
```

---

### WR-03: `MobileMenuMotion` — `navRef` tipado como `HTMLElement` mas atribuído a `motion.nav`

**Arquivo:** `src/components/MobileMenuMotion.tsx:9,40`

**Problema:** `navRef` é declarado como `useRef<HTMLElement>(null)`. O componente `motion.nav` da `motion/react` espera `React.Ref<HTMLElement>` — isso funciona — mas o componente `<nav>` nativo no caminho de fallback (linha 63) não sofre nenhuma animação via ref porque `applyFallback` já aplica o `transform` via `style` inline diretamente no elemento. A inconsistência não causa crash, mas o caminho de fallback do `useEffect` na linha 18-24 roda apenas quando `motionEnabled === false`; se o usuário alternar `motionEnabled` de `true` para `false` com o menu já aberto, o `applyFallback` é chamado somente depois que o componente re-renderiza — e o `motionEnabled && navRef.current` já pode ter perdido a referência DOM (porque o branch `motion.nav` foi desmontado e o `nav` nativo ainda não foi montado na mesma render frame). Resultado: um flash de menu sem animação de saída.

**Correção:** Consolidar a lógica de abertura/fechamento para não depender da ordem de montagem entre os dois branches.

---

### WR-04: `SettingsToggle` — `background` hardcoded `#fff` no menu móvel; não adaptável a tema

**Arquivo:** `src/components/MobileMenuMotion.tsx:53`

**Problema:** O estilo `background: "#fff"` está hardcoded no elemento `motion.nav`. Todo o resto da aplicação usa variáveis CSS (`--abismo-profundo`, `--sub-nivel`, etc.). Em modo dark/tema alternativo, o menu móvel aparecerá branco sobre fundo escuro, quebrando o design system.

**Correção:**
```typescript
style={{
  // ...
  background: "var(--sub-nivel, #1b293c)",
  // ...
}}
```

---

### WR-05: `NavBar.astro` — seção `sectionObserver` com `threshold: 0.3` falha em seções altas

**Arquivo:** `src/components/layout/NavBar.astro:239`

**Problema:** `threshold: 0.3` significa que a seção precisa ter 30% da sua altura visível para disparar o `aria-current`. Seções muito altas (como Curriculum com 6 módulos expandidos) nunca atingirão 30% de visibilidade durante rolagem normal — o `aria-current` nunca será aplicado a elas. Para seções que excedem a altura do viewport, qualquer threshold fixo acima de 0 falhará.

**Correção:** Usar `threshold: 0` com um `rootMargin` para controlar a zona de ativação:
```javascript
{ threshold: 0, rootMargin: "-20% 0px -70% 0px" }
```

---

### WR-06: `Layout.astro` — `[data-stagger]` sem contexto de ancestral `[data-revealed]` fica invisível permanentemente

**Arquivo:** `src/layouts/Layout.astro:229-235`

**Problema:** O CSS define que `[data-stagger]` tem `animation-play-state: paused` e só roda quando está dentro de `[data-revealed]`. Se qualquer elemento `data-stagger` for colocado fora de um ancestral com `data-reveal` (ou dentro de um container que não receba `data-revealed` pelo observer), ele ficará com `opacity: 0` e `transform: translateY(16px)` permanentemente — invisível para sempre.

Nos arquivos revisados, os elementos `data-stagger` em `Bonuses.astro` (linha 15, 28, 42) e `Pricing.astro` (linhas 39, 55, 72, etc.) estão dentro do `<section data-reveal>`, então estão cobertos. Mas não existe teste automatizado que verifique essa dependência estrutural — qualquer desenvolvedor que adicione um `data-stagger` fora de `data-reveal` criará conteúdo invisível sem aviso.

**Correção:** Documentar o requisito estrutural em comentário CSS ou adicionar um lint customizado. Considerar uma variante `data-stagger-standalone` que não depende do ancestral.

---

### WR-07: `Pricing.astro` — `will-change: transform` permanente no `.price-card`

**Arquivo:** `src/components/sections/Pricing.astro:282`

**Problema:** `.price-card` tem `will-change: transform` declarado no estado padrão (não apenas durante hover/animação). `will-change` quando aplicado permanentemente cria um novo stacking context e aloca recursos de compositing GPU para o elemento mesmo quando não há animação em andamento. Para um elemento estático como um card de preço, isso é desperdício de recurso. A regra `@media (prefers-reduced-motion: reduce)` (linha 295) corretamente remove a `transition`, mas não remove o `will-change`.

**Correção:**
```css
.price-card {
  /* remover will-change do estado base */
  transition: transform 0.15s var(--ease-micro), box-shadow 0.15s var(--ease-micro);
}

.price-card:hover {
  will-change: transform; /* aplicar apenas quando relevante */
  transform: translateY(-6px) scale(1.01);
}

@media (prefers-reduced-motion: reduce) {
  .price-card {
    transition: box-shadow 0.15s var(--ease-micro);
    will-change: auto; /* garantir limpeza */
  }
}
```

O mesmo padrão se aplica a `Button.astro:50` (`.btn { will-change: transform }`).

---

### WR-08: `HeroMotion.test.tsx` — mock de `motion.div` não inclui `motion.span`; teste de SettingsToggle usa mock separado

**Arquivo:** `tests/unit/components/HeroMotion.test.tsx:13-55`

**Problema:** O mock de `motion/react` em `HeroMotion.test.tsx` exporta apenas `motion: { div: ... }` e `MotionConfig`. Se `HeroMotion.tsx` vier a usar `motion.span` ou outro elemento no futuro, o teste quebrará com `TypeError: motion.span is not a function` em vez de um erro de asserção compreensível. Adicionalmente, `capturedProps` é um array de módulo com escopo de closure — se os testes rodarem em paralelo (Vitest workers), podem haver race conditions nos valores capturados (embora o `afterEach` limpe o array, a captura durante renderização pode cruzar entre testes concorrentes).

**Correção:** Usar `vi.fn()` com implementação para todos os sub-elementos de `motion` via `Proxy`:
```typescript
vi.mock("motion/react", () => ({
  motion: new Proxy({}, {
    get: (_, tag: string) => React.forwardRef((props: any, ref: any) => {
      capturedProps.push({ ...props });
      const { initial, animate, variants, transition, whileInView, viewport, ...rest } = props;
      return React.createElement(tag, { "data-testid": `motion-${tag}`, ref, ...rest });
    }),
  }),
  MotionConfig: ({ children }: any) => children,
}));
```

---

### WR-09: `motion-utils.test.ts` (raiz) e `lib/motion-utils.test.ts` — testes duplicados sem distinção clara

**Arquivo:** `tests/unit/motion-utils.test.ts` e `tests/unit/lib/motion-utils.test.ts`

**Problema:** Ambos os arquivos testam as mesmas funções (`MOTION_STORAGE_KEY`, `isMotionSupported`, `setMotionEnabled`, `applyFallback`, `useMotionEnabled`) com asserções quase idênticas. O arquivo na raiz (`motion-utils.test.ts`) parece ser o arquivo RED original da fase anterior; o arquivo em `lib/` é a versão atualizada. Manter ambos cria manutenção duplicada: qualquer mudança de comportamento precisa ser refletida em dois lugares. Testes duplicados também inflam a contagem de cobertura artificialmente.

**Correção:** Remover `tests/unit/motion-utils.test.ts` ou movê-lo para arquivo de referência histórica fora da suite de testes ativa. Manter apenas `tests/unit/lib/motion-utils.test.ts` como fonte de verdade.

---

## Itens Informativos

### IN-01: `Faq.astro` — animações CSS de `details[open]` não têm `@media prefers-reduced-motion`

**Arquivo:** `src/components/sections/Faq.astro:171-176, 218-221`

**Problema:** As transições `border-color 0.2s` e `background 0.2s` no elemento `details` e a rotação `transform: rotate(45deg)` no `.plus` não têm regra `@media (prefers-reduced-motion: reduce)` correspondente. A animação de rotação do ícone `+` → `×` é um motion effect que deveria ser suprimido. (Baixo impacto pois é sutil, mas tecnicamente incompleto.)

---

### IN-02: `Method.astro` — `.method-cell` com `transition: background 0.3s` sem `prefers-reduced-motion`

**Arquivo:** `src/components/sections/Method.astro:180`

**Problema:** A transição de hover `transition: background 0.3s` nas células do método não tem cobertura de `@media (prefers-reduced-motion: reduce)`. Embora seja uma transição muito sutil, é tecnicamente um motion effect não suprimido.

---

### IN-03: `HeroMotion.tsx` — uso de índice como `key` em `React.Children.map`

**Arquivo:** `src/components/HeroMotion.tsx:44`

**Problema:** `<motion.div key={i} variants={item}>` usa o índice do array como `key`. Se os children do Hero forem reordenados ou filtrados condicionalmente (improvável neste caso de landing page estática, mas possível se o Hero receber children dinâmicos), o React não identificará corretamente quais elementos foram alterados. Para children sem `key` própria, o índice é aceitável como último recurso, mas é um anti-padrão documentado pelo React quando há risco de reordenação.

---

_Revisado: 2026-05-16T00:00:00Z_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidade: standard_
