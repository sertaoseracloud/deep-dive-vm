---
phase: 8
slug: multi-lp-scaffold
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-17
---

# Phase 8 — UI Design Contract: Multi-LP Scaffold (EC2 Coming Soon)

> Contrato visual e de interação para `src/pages/deep-dive-ec2/index.astro` — página LP-lite
> "em breve" para o curso AWS EC2. HOWTO-new-landing-page.md é documentação pura sem contrato
> de UI. Gerado por gsd-ui-researcher.

---

## Escopo desta UI-SPEC

Esta spec cobre **exclusivamente** a página `/deep-dive-ec2/`. O arquivo
`HOWTO-new-landing-page.md` é documentação de desenvolvedor (checklist Markdown) e não possui
contrato visual.

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | none — CSS custom properties globais herdadas | Layout.astro `<style is:global>` |
| Preset | not applicable | — |
| Component library | none (Astro components nativos) | 07-UI-SPEC.md / CONTEXT.md D-01 |
| Icon library | nenhum novo — sem ícones na página EC2 | CONTEXT.md D-01 |
| Font principal | Space Grotesk (body/heading), Chakra Petch (display), JetBrains Mono (badge) | Layout.astro linha 82 |

**Nota shadcn:** Projeto usa Astro (não React/Next.js/Vite). shadcn gate não se aplica.

**Herança:** Todos os tokens CSS são herdados de `Layout.astro :root` (Fase 7). O executor
NÃO deve criar novas variáveis CSS — usar apenas os tokens existentes.

---

## Spacing Scale

Escala de 8 pontos herdada do design system global (idêntica à Fase 7).

| Token | Value | Uso na página EC2 |
|-------|-------|-------------------|
| xs | 4px | Gap interno do badge (padding vertical) |
| sm | 8px | Padding horizontal do badge; margin entre elementos inline |
| md | 16px | Gap entre h1 e descrição; gap entre descrição e badge |
| lg | 24px | Gap entre badge e link de volta |
| xl | 32px | Padding lateral do container herdado |
| 2xl | 48px | Padding vertical do container (topo e base) |
| 3xl | 64px | Espaço mínimo entre último elemento e fim do viewport |

**Exceções:**
- Container: `max-width: 480px` (coluna única compacta — mesma regra do hub)
- Touch target do link de volta: mínimo `44px` de altura (WCAG 2.5.5)

---

## Typography

Apenas 3 papéis tipográficos são usados nesta página. Nenhum papel adicional deve ser criado.

| Role | Family | Size | Weight | Line Height | Uso na página EC2 |
|------|--------|------|--------|-------------|-------------------|
| Display | Chakra Petch | 28px | 700 | 1.1 | `<h1>` com o título do curso (`Deep Dive EC2`) |
| Body | Space Grotesk | 16px | 400 | 1.5 | Parágrafo de descrição do curso (2-3 linhas) |
| Label | JetBrains Mono | 11px | 400 | 1.4 | Badge "EM BREVE" — `text-transform: uppercase; letter-spacing: 0.18em` |

**Regra de peso:** Somente weight 400 (regular) e 700 (bold) são permitidos nesta página.
Weight 600 não é usado — não há headings secundários nem CTAs com semibold nesta página.

**Link de volta ao hub:**
- Family: Space Grotesk
- Size: 14px
- Weight: 400
- Color: `var(--texto-terciario)` em estado base; `var(--nucleo-eletrico)` em hover
- Conteúdo: `← Ver todos os cursos`

---

## Color

Tokens herdados de `Layout.astro :root`. O executor NÃO deve criar novas variáveis CSS.

| Role | Token | Hex | Distribuição | Uso na página EC2 |
|------|-------|-----|-------------|-------------------|
| Dominant (60%) | `--abismo-profundo` | `#0a0f1e` | Fundo global via `body` | Background de toda a página (herdado) |
| Secondary (30%) | `--sub-nivel` | `#1b293c` | Não aplicado diretamente | Sem card container nesta página |
| Accent (10%) | `--nucleo-eletrico` | `#00ffff` | Reservado — lista abaixo | Ver "Accent reservado para" |
| Alerta | `--alerta` | `#ffb547` | Badge "EM BREVE" | Único uso de cor semântica nesta página |
| Texto principal | `--texto-principal` | `#ffffff` | Título h1 | |
| Texto secundário | `--texto-secundario` | `#d1d9e6` | Parágrafo de descrição | |
| Texto terciário | `--texto-terciario` | `#8a99b5` | Link de volta ao hub (estado base) | |

**Accent reservado exclusivamente para:**
1. Hover state do link de volta ao hub (`color: var(--nucleo-eletrico)`)
2. Foco outline do skip-link (já implementado em `Layout.astro` — não recriar)

O accent NÃO deve ser usado em: texto de body, título h1, badge, decorações genéricas.

**Sem cor destrutiva:** Não há ações destrutivas nesta página.

---

## Component Inventory

Componentes que o executor deve criar. Nenhum componente externo novo.

| Componente | Ação | Arquivo | Notas |
|------------|------|---------|-------|
| `src/pages/deep-dive-ec2/index.astro` | Criar novo | `src/pages/deep-dive-ec2/index.astro` | Página LP-lite usando Layout.astro com props corretas |
| `public/ec2-og.png` | Criar placeholder | `public/ec2-og.png` | 1200×630px — mesmo script sharp usado para hub-og.png |

**Componentes reutilizados sem modificação:**
- `src/layouts/Layout.astro` — aceita `ogImage`, `url`, `title`, `description`; nenhuma alteração necessária
- `src/data/courses.ts` — EC2 já declarado; nenhuma alteração necessária

---

## Layout Structure

Estrutura visual da página EC2 (coluna única, mobile-first, sem NavBar nem Footer):

```
┌─────────────────────────────────┐
│  [ambient background herdado]   │
│                                 │
│  ┌─── ec2-container (max 480) ─┐│
│  │                             ││
│  │  ← Ver todos os cursos      ││  ← link de volta ao hub (topo)
│  │                             ││
│  │  Deep Dive EC2              ││  ← <h1> Chakra Petch 28px 700
│  │                             ││
│  │  [EM BREVE]                 ││  ← badge alerta, JetBrains Mono 11px
│  │                             ││
│  │  Formação técnica focada    ││  ← <p> Space Grotesk 16px 400
│  │  em AWS EC2 — domine        ││
│  │  instâncias, scaling e      ││
│  │  arquitetura na prática.    ││
│  │                             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Ordem dos elementos (coluna única, topo → base):**
1. Skip link (herdado de Layout.astro via slot)
2. `<a href="/">← Ver todos os cursos</a>` — link de volta (topo da página)
3. `<h1>Deep Dive EC2</h1>` — título do curso
4. `<span class="badge badge-coming-soon">EM BREVE</span>` — badge de status
5. `<p>` — descrição expandida do curso (2-3 linhas)

**Posição do link de volta:** topo da página — antes do h1. Justificativa: orienta o usuário
imediatamente ao chegar via URL direta, antes de consumir o conteúdo.

---

## Interaction Contract

### Link de Volta ao Hub

- Texto: `← Ver todos os cursos`
- Href: `/`
- Posição: topo do container, alinhado à esquerda
- Display: `inline-flex`, `align-items: center`, `gap: 4px`
- Estado base: `color: var(--texto-terciario)` (`#8a99b5`), `text-decoration: none`
- Estado hover: `color: var(--nucleo-eletrico)` (`#00ffff`), `text-decoration: none`
- Transition: `color 0.2s ease`
- Touch target: mínimo `44px` de altura (padding vertical `12px` para atingir 44px)
- Margin-bottom: `32px` (xl) entre o link e o h1

### Badge "EM BREVE"

- Aparência idêntica ao badge do card EC2 no hub (mesma classe `.badge .badge-coming-soon`)
- Font: JetBrains Mono 11px, weight 400, uppercase, letter-spacing 0.18em
- Color: `var(--alerta)` (`#ffb547`)
- Border: `1px solid var(--alerta)`
- Padding: `2px 8px`
- Border-radius: `2px`
- Margin: `16px` de gap acima (após h1), `16px` de gap abaixo (antes do parágrafo)
- Sem hover effect — elemento estático

### Ambient Background

- Herdado automaticamente de `Layout.astro` via `.ambient` div
- Nenhuma modificação necessária

### Acessibilidade

- `<main id="conteudo-principal" tabindex="-1">` — target do skip-link
- `aria-label` no main: `"Página do curso Deep Dive EC2"`
- Heading hierarchy: apenas `<h1>` nesta página — sem h2 ou h3
- Foco visível no link de volta ao hub (outline padrão do browser, não suprimir)
- `prefers-reduced-motion`: transition do link de volta deve ser desativada via:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .back-link { transition: none; }
  }
  ```

---

## Copywriting Contract

| Elemento | Copy | Fonte |
|----------|------|-------|
| `<title>` da página | `Deep Dive EC2 — Em breve · O Sertão será Cloud` | Padrão do projeto + status |
| `description` meta | `Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática. Em breve na plataforma.` | CONTEXT.md D-01 / courses.ts expandido |
| `<h1>` | `Deep Dive EC2` | courses.ts `title` |
| Parágrafo de descrição | `Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática. Em breve na plataforma.` | courses.ts expandido (discretion area CONTEXT.md) |
| Badge de status | `EM BREVE` | 07-UI-SPEC.md / CONTEXT.md D-01 |
| Link de volta | `← Ver todos os cursos` | CONTEXT.md D-01 |
| `og:title` | `Deep Dive EC2 — Em breve · O Sertão será Cloud` | Padrão consistente com hub-og |
| `og:description` | `Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática.` | Derivado da description meta |
| `og:image` alt | `Deep Dive EC2 — O Sertão será Cloud` | Padrão para social preview |

**Estado vazio:** Não há estado vazio — conteúdo é estático, hardcoded na página.

**Estado de erro:** Não há estados de erro de runtime — site estático sem fetch. Erros de
build são capturados pelo CI (Vitest + Playwright).

**Ações destrutivas:** Nenhuma — página é somente leitura.

---

## Open Graph Contract

Especificação completa das meta tags para a página EC2 passadas ao `Layout.astro`:

| Meta tag | Valor |
|----------|-------|
| `og:title` | `Deep Dive EC2 — Em breve · O Sertão será Cloud` |
| `og:description` | `Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática.` |
| `og:image` | `https://mentoria.sertaoseracloud.com/ec2-og.png` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `og:url` | `https://mentoria.sertaoseracloud.com/deep-dive-ec2/` |
| `og:type` | `website` |
| `twitter:card` | `summary_large_image` |
| `twitter:creator` | `@sertaoseracloud` |
| `noindex` | `false` (indexada desde o início — CONTEXT.md D-01) |

**Props que o executor deve passar ao Layout.astro:**
```astro
<Layout
  title="Deep Dive EC2 — Em breve · O Sertão será Cloud"
  description="Formação técnica focada em AWS EC2 — domine instâncias, auto scaling e arquitetura na prática. Em breve na plataforma."
  url="https://mentoria.sertaoseracloud.com/deep-dive-ec2/"
  ogImage="/ec2-og.png"
>
```

**Placeholder:** `public/ec2-og.png` deve existir como arquivo 1200×630px antes do build.
Usar o mesmo script sharp utilizado para `hub-og.png` (parâmetros de cor e texto diferentes).
O usuário deve substituir com a imagem final antes do deploy público.

---

## Registry Safety

| Registry | Blocks Usados | Safety Gate |
|----------|---------------|-------------|
| shadcn official | nenhum | not applicable — Astro, não React |
| third-party | nenhum | not applicable |

**Dependências de runtime novas:** nenhuma. CSS custom properties, Astro nativo. Conforme
constraint inviolável de REQUIREMENTS.md.

---

## Pre-Population Summary

| Fonte | Decisões utilizadas |
|-------|---------------------|
| 08-CONTEXT.md | 7 decisões (D-01 a D-04 + Claude's Discretion): estilo LP-lite, conteúdo h1+desc+badge, indexação, navegação back-link, OG completo, testes E2E |
| 07-UI-SPEC.md | Todos os tokens de design: spacing scale, tipografia (4 papéis), paleta de cores, padrão do badge "EM BREVE", padrão de acessibilidade |
| Layout.astro | Props interface confirmada (title, description, url, ogImage, noindex), tokens CSS :root, ambient background |
| src/data/courses.ts | Título "Deep Dive EC2", descrição base, url "/deep-dive-ec2/", status "coming-soon" |
| src/pages/index.astro | Padrão de uso do Layout.astro sem NavBar/Footer, estrutura do skip-link, classes do badge |
| REQUIREMENTS.md | SCAFF-01: rota existente + page "em breve" + demonstração do padrão |
| User input (esta sessão) | 0 — todas as decisões vieram de upstream |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
