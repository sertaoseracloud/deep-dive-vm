---
phase: 7
slug: hub-page
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-17
---

# Phase 7 — UI Design Contract: Hub Page

> Visual and interaction contract para o hub Linktree-style em `mentoria.sertaoseracloud.com/`.
> Gerado por gsd-ui-researcher. Verificado por gsd-ui-checker.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | none — CSS custom properties globais | Layout.astro `<style is:global>` |
| Preset | not applicable | — |
| Component library | none (Astro components nativos) | CONTEXT.md D-01 |
| Icon library | SVG inline via `SocialIcon.astro` (zero deps de runtime) | CONTEXT.md D-05 |
| Font principal | Space Grotesk (body), JetBrains Mono (labels/eyebrow), Chakra Petch (display/botoes) | Layout.astro linha 77 |

**Nota shadcn:** Projeto usa Astro (nao React/Next.js/Vite). shadcn gate nao se aplica.

---

## Spacing Scale

Escala de 8 pontos herdada do design system global. Multiplos de 4 apenas.

| Token | Value | Usage no Hub |
|-------|-------|--------------|
| xs | 4px | Gap entre ícone social e borda do touch target |
| sm | 8px | Padding interno de tags / eyebrow margin |
| md | 16px | Gap entre foto e nome; margin-bottom da bio |
| lg | 24px | Gap vertical entre cards de curso; padding interno dos cards |
| xl | 32px | Padding lateral do container no hub (`padding: 0 32px` herdado) |
| 2xl | 48px | Padding vertical do hub (topo e base do conteudo centralizado) |
| 3xl | 64px | Espaco total minimo entre ultima secao e fim do viewport |

**Excecoes declaradas:**

- Touch targets dos icones sociais: minimo `44px x 44px` (acessibilidade WCAG 2.5.5) — mesmo em icones de 24px, o elemento clicavel usa `padding: 10px` para atingir 44px total.
- Foto do mentor: diametro `128px` no desktop, `96px` em viewport < 480px. Nao segue a escala de spacing — e dimensao de imagem.
- Container do hub: `max-width: 480px` (coluna unica compacta, diferente do `1240px` da LP). Centralizado com `margin: 0 auto`.

---

## Typography

Apenas 4 papeis tipograficos sao declarados para este fase. Nenhum papel adicional deve ser criado pelo executor.

| Role | Family | Size | Weight | Line Height | Usage |
|------|--------|------|--------|-------------|-------|
| Display | Chakra Petch | 28px | 700 | 1.1 | Nome do mentor (`Cláudio Filipe Lima Raposo`) |
| Heading | Space Grotesk | 20px | 600 | 1.2 | Titulo do card de curso |
| Body | Space Grotesk | 16px | 400 | 1.5 | Bio tagline do mentor; descricao curta do curso |
| Label | JetBrains Mono | 11px | 400 | 1.4 | Eyebrow / badge de status (`EM BREVE`, `ATIVO`); letra-espacamento: 0.18em; `text-transform: uppercase` |

**Regra de peso:** Somente weight 400 (regular) e 600/700 (semibold/bold) sao permitidos. Nenhum intermediate (300, 500) deve ser introduzido no hub.

---

## Color

Tokens herdados de `Layout.astro :root`. O executor NAO deve criar novas variaveis CSS — usar apenas os tokens listados abaixo.

| Role | Token | Hex | Distribuicao | Usage |
|------|-------|-----|-------------|-------|
| Dominant (60%) | `--abismo-profundo` | `#0a0f1e` | Fundo global (herdado via `body`) | Background de toda a pagina, fundo dos cards |
| Secondary (30%) | `--sub-nivel` | `#1b293c` | Cards de curso, borda de separacao | Background do card (`background: rgba(27,41,60,0.6)`); borda `1px solid var(--hairline)` |
| Accent (10%) | `--nucleo-eletrico` | `#00ffff` | Reservado — lista abaixo | Ver "Accent reservado para" |
| Sucesso | `--sucesso` | `#00e5a8` | Badge "ATIVO" no card Deep Dive VM | Unico uso de cor de sucesso nesta fase |
| Alerta | `--alerta` | `#ffb547` | Badge "EM BREVE" no card Deep Dive EC2 | Unico uso de cor de alerta nesta fase |
| Texto principal | `--texto-principal` | `#ffffff` | Nome do mentor, titulo dos cards | |
| Texto secundario | `--texto-secundario` | `#d1d9e6` | Bio, descricao dos cards | |
| Texto terciario | `--texto-terciario` | `#8a99b5` | Subtitulo / credencial condensada | |

**Accent reservado exclusivamente para:**

1. Borda do circulo da foto do mentor (`border: 2px solid var(--nucleo-eletrico)`)
2. Hover state dos icones sociais (`color` / `filter: drop-shadow` ciano no hover)
3. Hover state dos cards de curso (borda `var(--hairline-strong): rgba(0,255,255,0.32)`)
4. Foco outline do skip-link (ja implementado em `Layout.astro`)
5. Separador decorativo entre secoes (linha horizontal com `var(--hairline-strong)`)

O accent NAO deve ser usado em: texto de body, fundo de cards em estado normal, decoracoes genericas.

**Sem cor destrutiva:** Nao ha acoes destrutivas nesta fase (hub e somente leitura/navegacao).

---

## Component Inventory

Componentes que o executor deve criar ou modificar. Nenhum componente externo novo.

| Componente | Acao | Arquivo | Notas |
|------------|------|---------|-------|
| `Layout.astro` | Modificar — adicionar prop `ogImage?: string` | `src/layouts/Layout.astro` | Fallback: `claudio1.png`. Hub passa `/hub-og.png` |
| `SocialIcon.astro` | Criar novo | `src/components/ui/SocialIcon.astro` | SVG inline, variantes: instagram / youtube / whatsapp / linkedin. Props: `{ name, ariaLabel }` |
| `src/pages/index.astro` | Reescrever | `src/pages/index.astro` | Remove noindex. Compoe hub com foto, bio, cursos, socials |
| `src/data/social-links.ts` | Criar novo | `src/data/social-links.ts` | Array tipado exportado |
| `src/data/courses.ts` | Criar novo | `src/data/courses.ts` | Array tipado exportado |
| `public/hub-og.png` | Criar placeholder | `public/hub-og.png` | 1200x630px. Executor pode copiar/redimensionar `claudio1.png` |

---

## Interaction Contract

### Foto do Mentor

- Shape: circulo perfeito via `border-radius: 50%`
- Tamanho: `128px` desktop / `96px` em `max-width: 480px`
- Borda: `2px solid var(--nucleo-eletrico)` com `box-shadow: 0 0 16px rgba(0,255,255,0.3)`
- Asset: `src/assets/claudio2.png` via `<Image>` do Astro (otimizado automaticamente)
- Alt text: `"Cláudio Filipe Lima Raposo — mentor"`
- Nenhum hover effect na foto

### Cards de Curso

Estado base:
- Background: `rgba(27, 41, 60, 0.6)`
- Borda: `1px solid var(--hairline)` (`rgba(209,217,230,0.12)`)
- Border-radius: `4px`
- Padding: `24px`
- Cursor: `pointer` (card inteiro e clicavel)

Estado hover (card `status: 'active'` apenas):
- Borda: `1px solid var(--hairline-strong)` (`rgba(0,255,255,0.32)`)
- Background: `rgba(27, 41, 60, 0.85)`
- Transition: `border-color 0.2s ease, background 0.2s ease`
- `transform: translateY(-2px)`

Estado "coming soon" (`status: 'coming-soon'`):
- Badge `EM BREVE` com `color: var(--alerta)` e `border: 1px solid var(--alerta)`
- `opacity: 0.7` no card inteiro
- `cursor: default` — card NAO e clicavel
- `pointer-events: none` no link interno

Badge de status ativo:
- Texto: `ATIVO` com `color: var(--sucesso)` e borda `1px solid var(--sucesso)`
- Font: JetBrains Mono 11px, uppercase, letter-spacing 0.18em

### Icones Sociais

- Tamanho do icone SVG: `24px x 24px`
- Touch target: `44px x 44px` (padding de `10px` ao redor do SVG)
- Layout: linha horizontal, `gap: 16px`, centralizado
- Estado base: `color: var(--texto-terciario)` (`#8a99b5`)
- Estado hover: `color: var(--nucleo-eletrico)` + `filter: drop-shadow(0 0 6px rgba(0,255,255,0.6))`
- Transition: `color 0.2s ease, filter 0.2s ease`
- `aria-label` obrigatorio em cada icone (ex: `"Seguir no Instagram"`, `"Assistir no YouTube"`, `"Contato via WhatsApp"`, `"Conectar no LinkedIn"`)
- Abrem em `target="_blank" rel="noopener noreferrer"`

### Skip Link

- Ja implementado em `Layout.astro` — NAO recriar
- Hub deve incluir `id="conteudo-principal"` no elemento `<main>` para o skip link funcionar

### Acessibilidade

- `<main>` com `id="conteudo-principal"` e `aria-label="Hub de cursos e redes sociais"`
- `<section>` para cada bloco logico (perfil, cursos, redes)
- Headings em ordem: `<h1>` para o nome do mentor, `<h2>` para "Cursos" e "Redes Sociais"
- `prefers-reduced-motion`: todos os transitions devem ser desativados (pattern de `Button.astro` ja resolve via `@media (prefers-reduced-motion: reduce)`)
- Foco visivel em todos os elementos interativos (cards, icones sociais)

---

## Copywriting Contract

| Elemento | Copy | Fonte |
|----------|------|-------|
| `<title>` da pagina | `Cláudio Rapôso — O Sertão será Cloud` | CONTEXT.md D-06 / padrao do projeto |
| `description` OG | `Formacao tecnica de alto impacto em cloud. Azure VM, EC2 e mais. Acesse os cursos e redes do mentor.` | Default (sem fonte upstream) |
| Nome do mentor (h1) | `Cláudio Filipe Lima Raposo` | Mentor.astro — nome completo |
| Bio tagline (1 linha) | `Systems Architect · 2× MVP Microsoft · Docker Captain` | Condensado de Mentor.astro |
| Subtitulo/credencial | `Formador de arquitetos de nuvem` | Default — pode ser ajustado pelo usuario |
| CTA primario (card ativo) | `Acessar curso` | Default — acao clara, verbo + substantivo |
| Badge curso ativo | `ATIVO` | CONTEXT.md D-04 |
| Badge curso em breve | `EM BREVE` | CONTEXT.md D-04 |
| Titulo secao cursos (h2) | `Cursos` | Default |
| Titulo secao social (h2) | `Redes Sociais` | Default — pode ser omitido visualmente (visualmente oculto com `sr-only`) |
| aria-label Instagram | `Seguir no Instagram` | CONTEXT.md D-05 |
| aria-label YouTube | `Assistir no YouTube` | CONTEXT.md D-05 |
| aria-label WhatsApp | `Contato via WhatsApp` | CONTEXT.md D-05 |
| aria-label LinkedIn | `Conectar no LinkedIn` | CONTEXT.md D-05 |
| og:image alt | `Cláudio Rapôso — O Sertão será Cloud` | Padrao para social preview |

**Estado vazio:** Nao ha estado vazio nesta fase — os dados sao estaticos (arrays tipados em `src/data/`). Se o array de cursos estiver vazio por erro, o hub exibe apenas o perfil e os links sociais sem mensagem de erro.

**Estado de erro:** Nao ha estados de erro de runtime nesta fase — site estatico sem fetch. Erros de build sao capturados pelo CI (Vitest + Playwright).

**Acoes destrutivas:** Nenhuma — hub e somente leitura.

---

## Open Graph Contract

Especificacao completa das meta tags que o `Layout.astro` (pos-modificacao) deve gerar para o hub:

| Meta tag | Valor |
|----------|-------|
| `og:title` | `Cláudio Rapôso — O Sertão será Cloud` |
| `og:description` | `Formacao tecnica de alto impacto em cloud. Azure VM, EC2 e mais.` |
| `og:image` | `https://mentoria.sertaoseracloud.com/hub-og.png` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `og:url` | `https://mentoria.sertaoseracloud.com/` |
| `og:type` | `website` |
| `twitter:card` | `summary_large_image` |
| `twitter:creator` | `@sertaoseracloud` |

**Placeholder:** `public/hub-og.png` deve existir como arquivo 1200x630px antes do build. O executor pode copiar e redimensionar `claudio1.png` como placeholder. O usuario deve substituir com a imagem final antes do deploy publico.

---

## Layout Structure

Estrutura visual do hub (coluna unica, mobile-first, sem NavBar nem Footer):

```
┌─────────────────────────────────┐
│  [ambient background herdado]   │
│                                 │
│  ┌─── hub-container (max 480) ─┐│
│  │                             ││
│  │    [foto circular 128px]    ││  ← <section class="hub-profile">
│  │    Cláudio Filipe Lima...   ││
│  │    Systems Architect · 2×   ││
│  │    MVP Microsoft · Docker   ││
│  │    Captain                  ││
│  │                             ││
│  │    [IG] [YT] [WA] [LI]     ││  ← icones sociais, 44px touch targets
│  │                             ││
│  │  ─────────────────────────  ││  ← divisor hairline
│  │                             ││
│  │  Cursos                     ││  ← <section class="hub-courses">
│  │  ┌─────────────────────┐   ││
│  │  │ Deep Dive Azure VM  │   ││  ← card ativo, clicavel
│  │  │ [ATIVO]             │   ││
│  │  │ Desc curta...       │   ││
│  │  │ [Acessar curso →]   │   ││
│  │  └─────────────────────┘   ││
│  │  ┌─────────────────────┐   ││
│  │  │ Deep Dive EC2       │   ││  ← card coming soon, opacity 0.7
│  │  │ [EM BREVE]          │   ││
│  │  │ Desc curta...       │   ││
│  │  └─────────────────────┘   ││
│  │                             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Ordem dos elementos (mobile-first, coluna unica):**
1. `<a class="skip-link" href="#conteudo-principal">` — skip link (herda de Layout.astro)
2. `<main id="conteudo-principal">`
3. Secao perfil: foto + nome + bio + icones sociais
4. Divisor decorativo (`<hr>` estilizado com `var(--hairline)`)
5. Secao cursos: h2 + cards

---

## Registry Safety

| Registry | Blocks Usados | Safety Gate |
|----------|---------------|-------------|
| shadcn official | nenhum | not applicable — Astro, nao React |
| third-party | nenhum | not applicable |

**Dependencias de runtime novas:** nenhuma. SVG inline, CSS custom properties, Astro Image. Conforme constraint inviolavel de REQUIREMENTS.md.

---

## Pre-Population Summary

| Fonte | Decisoes utilizadas |
|-------|---------------------|
| CONTEXT.md (07-CONTEXT.md) | 7 decisoes D-01 a D-07: layout, foto, dados, icones, OG, noindex, discretion areas |
| REQUIREMENTS.md | HUB-01, HUB-02, HUB-03, HUB-04 — criterios de sucesso extraidos |
| Layout.astro | Todos os tokens CSS (:root), escala de spacing, fontes, ambient background |
| Mentor.astro | Texto da bio (condensado), nome completo, credenciais de referencia |
| Button.astro | Padrao de hover, transition, touch target mobile (44px min-height) |
| User input (esta sessao) | 0 — todas as decisoes vieram de upstream |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
