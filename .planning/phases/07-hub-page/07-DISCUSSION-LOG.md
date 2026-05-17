# Phase 7: Hub Page - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 7-hub-page
**Areas discussed:** Layout do hub, Social links data source, Ícones das redes sociais, OG image do hub

---

## Layout do hub

| Option | Description | Selected |
|--------|-------------|----------|
| Linktree-compact | Coluna única centralizada, sem NavBar/Footer, dark theme, foco nos links | ✓ |
| Full-site com NavBar/Footer | Herda estrutura da LP: NavBar + Footer + ambient. Mais coeso visualmente mas mais pesado para um hub | |

**User's choice:** Linktree-compact

---

| Option | Description | Selected |
|--------|-------------|----------|
| Reutiliza Layout.astro | Zero componentes novos de estrutura. Hub renderiza no `<slot />` | ✓ |
| HubLayout.astro separado | Layout dedicado sem ambient/dependências da LP. Mais controle mas duplica lógica SEO | |

**User's choice:** Reutiliza Layout.astro

---

| Option | Description | Selected |
|--------|-------------|----------|
| claudio2.png | Retrato 3/4, já asset Astro em Mentor.astro. Circular ~128px | ✓ |
| claudio1.png | Foto usada na OG da LP. Fundo branco, mais formal | |
| Nova imagem dedicada | Requer criar/colocar novo asset. Mais flexibilidade | |

**User's choice:** claudio2.png

---

| Option | Description | Selected |
|--------|-------------|----------|
| Mantém ambient background | Herdado automaticamente do Layout.astro. Zero CSS extra | ✓ |
| Fundo escuro liso | Suprime .ambient via CSS. Mais clean, foco nos links. Precisa de regra para esconder div | |

**User's choice:** Mantém ambient background

---

## Social links data source

| Option | Description | Selected |
|--------|-------------|----------|
| src/data/social-links.ts | Array exportado com { name, url, icon }. Padrão Astro. Zero nova dep | ✓ |
| Front-matter do index.astro | Props no front-matter da página. Acopla dado ao componente de página | |

**User's choice:** src/data/social-links.ts

---

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder por enquanto | Executor coloca wa.me/PLACEHOLDER. Usuário edita social-links.ts antes do deploy | ✓ |
| Link para grupo/canal | WhatsApp com link de grupo/canal (chat.whatsapp.com/...) | |

**User's choice:** Placeholder por enquanto (wa.me/PLACEHOLDER)

---

| Option | Description | Selected |
|--------|-------------|----------|
| src/data/courses.ts | Array { title, description, url, status }. Extensível para Fase 8 | ✓ |
| Hardcoded no index.astro | Mais simples agora, mas cada nova LP requer editar o HTML do hub | |

**User's choice:** src/data/courses.ts

---

## Ícones das redes sociais

| Option | Description | Selected |
|--------|-------------|----------|
| SVG inline em componente Astro | SocialIcon.astro com SVG inline. Zero deps, tree-shakeable | ✓ |
| SVG sprite em public/icons.svg | Arquivo sprite único com `<use>`. Sem dep, mas requer criar manualmente | |
| astro-icon (nova dep) | Biblioteca Astro para Iconify. Mais simples mas viola constraint 'sem novas deps' | |

**User's choice:** SVG inline em SocialIcon.astro

---

| Option | Description | Selected |
|--------|-------------|----------|
| Só ícone + aria-label | Padrão linktree. Visual limpo. aria-label garante acessibilidade | ✓ |
| Ícone + label de texto visível | Mais explícito mas ocupa mais espaço horizontal no mobile | |

**User's choice:** Só ícone + aria-label

---

## OG image do hub

| Option | Description | Selected |
|--------|-------------|----------|
| claudio1.png (existente) | Já usada como OG da LP. Zero asset novo. Preview hub = preview LP | |
| Nova imagem hub-og.png em public/ | 1200×630px, preview dedicado para o hub | ✓ |
| Gerar via Satori (build-time) | Adiado em REQUIREMENTS.md como 'Future Requirement' | |

**User's choice:** Nova imagem hub-og.png em public/ (placeholder por enquanto)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder por enquanto | Executor cria public/hub-og.png como placeholder. Usuário substitui antes do deploy | ✓ |
| Eu fornecerei o arquivo | Usuário coloca public/hub-og.png manualmente antes de executar a fase | |

**User's choice:** Placeholder por enquanto

---

| Option | Description | Selected |
|--------|-------------|----------|
| Prop ogImage?: string no Layout (Recomendado) | Layout usa ogImage ?? claudio1.png. Hub passa ogImage='/hub-og.png' | ✓ |
| Hub usa `<meta slot="head">` para sobrescrever | Pode conflitar com og:image do astro-seo no Layout | |

**User's choice:** Prop ogImage?: string no Layout.astro

---

## Claude's Discretion

- Espaçamento interno do hub, tamanho de fonte da bio, gap entre cards
- Bio text condensada (1-2 linhas baseado em Mentor.astro como referência)
- Hover states dos ícones sociais e cards (manter padrão do projeto: transition/cyan)

## Deferred Ideas

- OG image dinâmico via Satori — Future Requirement no REQUIREMENTS.md
- Analytics cookieless (Plausible) — fase posterior
- Entrance animations no hub — após hub validado em produção
- Bio completa do mentor no hub — condensada no hub, extendida pertence à LP
