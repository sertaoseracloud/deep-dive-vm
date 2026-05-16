# Phase 6: Route Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 6-route-migration
**Areas discussed:** Testes Unitários, Hub Placeholder (Fase 6), Layout.astro

---

## Testes Unitários

### dist/index.html em 10+ component tests

| Option | Description | Selected |
|--------|-------------|----------|
| Atualizar todos para dist/deep-dive-vm/index.html | Direto ao ponto. Cada test.ts muda uma linha. 10+ mudanças, mas simples e explícitas. | ✓ |
| Criar constante compartilhada DIST_VM_INDEX | Uma constante em test-helpers.ts, todos os testes importam de lá. Mais DRY. | |
| Separar em dois projetos Vitest | vitest.config.ts com dois projetos: 'hub' e 'vm-landing'. | |

**User's choice:** Atualizar todos para `dist/deep-dive-vm/index.html`
**Notes:** Decisão direta. A simplicidade é priorizada sobre abstração.

---

### SEO tests (seo-meta.test.ts)

| Option | Description | Selected |
|--------|-------------|----------|
| Atualizar path para dist/deep-dive-vm/index.html também | Mesmos assertions, outro arquivo. | ✓ |
| Criar suite separada para hub (Fase 7) e manter VM suite | Hub tests adicionados na Fase 7. | |

**User's choice:** Atualizar path — mesma abordagem dos component tests.

---

### Playwright baseURL após migração

| Option | Description | Selected |
|--------|-------------|----------|
| http://localhost:4321/ (raiz — aponta para o hub) | Base é o hub. Testes E2E da VM navegam para ./deep-dive-vm/ relativo. | ✓ |
| http://localhost:4321/deep-dive-vm/ (mantém tudo igual) | Nenhum teste E2E existente quebra. Hub sem cobertura por enquanto. | |

**User's choice:** `http://localhost:4321/` — conceptualmente correto, o hub é a raiz.
**Notes:** Os testes E2E existentes precisarão atualizar suas navegações de `./` para `./deep-dive-vm/`.

---

## Hub Placeholder (Fase 6)

### Nível mínimo do hub para CI passar

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder mínimo: title + description + meta robots noindex | Coming Soon com SEO correto. Design definitivo fica para Fase 7. | ✓ |
| Hub completo na Fase 6 | Colapsa Fase 6 e 7. Mais rápido para produção. | |
| Ajustar LHCI para ignorar o hub temporariamente | Hub sem cobertura até Fase 7. | |

**User's choice:** Placeholder mínimo com `noindex`.
**Notes:** Isola corretamente a migração (Fase 6) do design do hub (Fase 7).

---

### Layout do hub placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Mesmo Layout.astro com props diferentes | Reusa layout existente. | ✓ |
| Layout novo e simples (HubLayout.astro) | Sem dependências de motion/JSON-LD. Mais limpo. | |

**User's choice:** Mesmo Layout.astro com props diferentes.
**Notes:** Pragmático para o placeholder. O design definitivo do hub (Fase 7) pode criar um layout próprio se necessário.

---

## Layout.astro

### Favicon hardcoded na linha 48

| Option | Description | Selected |
|--------|-------------|----------|
| Mover favicon para public/ e usar /favicon.svg | Path absoluto funciona em qualquer rota. | |
| Usar import.meta.env.BASE_URL + favicon.svg | Dinâmico mas desnecessário. | |
| Usar /favicon.ico | Convenção universal; public/favicon.ico já existe. | ✓ |

**User's choice:** `/favicon.ico` — `public/favicon.ico` já existe no projeto.
**Notes:** Melhor que `/favicon.svg` por ser a convenção universal de browsers. Ambos existem em `public/`.

---

### offersUrl hardcoded na linha 16

| Option | Description | Selected |
|--------|-------------|----------|
| Tornar prop opcional — hub passa undefined, VM passa a URL correta | JSON-LD só renderiza se offersUrl for passado. | ✓ |
| Hardcode só na VM page via frontmatter | Equivalente mas mais explícito. | |

**User's choice:** Prop opcional. Hub passa `undefined`, JSON-LD não renderiza.

---

## Claude's Discretion

- Sem itens de discretion — todas as decisões foram feitas pelo usuário.

## Deferred Ideas

- Design definitivo do hub (foto, bio, cards, links sociais) → Fase 7
- Testes E2E do hub → Fase 7
- SEO meta tags completos com og:image → Fase 7
- Analytics (Plausible) → pós-v1.3
