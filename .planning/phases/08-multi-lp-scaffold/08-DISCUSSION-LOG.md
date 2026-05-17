# Phase 8: Multi-LP Scaffold - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 8-multi-lp-scaffold
**Areas discussed:** Página coming-soon do EC2, OG / compartilhamento do EC2, Cobertura de testes, Formato do HOWTO

---

## Página coming-soon do EC2

| Option | Description | Selected |
|--------|-------------|----------|
| Minimalista hub-consistent | Dark theme, sem NavBar/Footer, heading "Em breve", link de volta ao hub | |
| LP-lite com conteúdo teaser | Esboço da futura LP: hero com título, parágrafo breve sobre o curso EC2, badge "Em breve" | ✓ |
| Redirect para hub | Rota EC2 redireciona para / em vez de renderizar uma página própria | |

**User's choice:** LP-lite com conteúdo teaser

**Conteúdo:**

| Option | Description | Selected |
|--------|-------------|----------|
| Título + descrição curta + badge "Em breve" | h1, parágrafo 2-3 linhas, badge visual | ✓ |
| Título + lista de tópicos + badge "Em breve" | Lista de 4-6 tópicos previstos | |
| Título + badge + link de volta ao hub | Minimal sem descrição | |

**Indexação:**

| Option | Description | Selected |
|--------|-------------|----------|
| noindex por enquanto | Meta tag robots=noindex enquanto não está pronta para venda | |
| Indexada desde o início | Aparece no sitemap, rastreada pelo Google desde o deploy | ✓ |

**Navegação de volta ao hub:**

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, link de volta ao hub | Ancoragem interna para descoberta de outros cursos | ✓ |
| Não, sem link (auto-contida) | Visitante usa o botão voltar do browser | |

**Notes:** Usuário quer que a página demonstre claramente o padrão de LP, não apenas uma página de espaço reservado.

---

## OG / compartilhamento do EC2

**og:image:**

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder dedicado public/ec2-og.png | 1200×630px próprio, demonstra o padrão do HOWTO | ✓ |
| Reutilizar hub-og.png | Funcional mas confuso ao compartilhar | |
| Sem og:image | Usa fallback claudio1.png da LP — inconsistente | |

**Tags OG:**

| Option | Description | Selected |
|--------|-------------|----------|
| OG completo (og:title, description, image, url) | Mesmo padrão do hub e da LP, documentável no HOWTO | ✓ |
| OG mínimo (só og:title e og:image) | Suficiente para WhatsApp mas não é template completo | |

**Notes:** Decisão de usar OG completo é guiada pelo objetivo de que EC2 seja o exemplo do HOWTO.

---

## Cobertura de testes

**E2E:**

| Option | Description | Selected |
|--------|-------------|----------|
| E2E dedicado: ec2-coming-soon.spec.ts | Spec Playwright próprio seguindo padrão hub.spec.ts | ✓ |
| Assertion em spec existente | Adicionar em homepage.spec.ts ou journeys.spec.ts | |
| Apenas build verde (sem E2E) | Sem asserções Playwright | |

**SEO test:**

| Option | Description | Selected |
|--------|-------------|----------|
| Sim — adicionar asserção no seo-meta.test.ts | Teste 16, padrão do teste 15 (hub) | ✓ |
| Não — E2E já cobre | Evitar redundância | |

**Notes:** Usuário quer spec dedicado porque é o padrão demonstrável no HOWTO.

---

## Formato do HOWTO

**Formato:**

| Option | Description | Selected |
|--------|-------------|----------|
| Checklist numérico com trechos de código | Sequencial, objetivo, snippets nos passos | ✓ |
| Tutorial narrativo | Educativo, mais longo, mais difícil de manter | |
| Template comentado | Template + HOWTO curto apontando para ele | |

**Escopo:**

| Option | Description | Selected |
|--------|-------------|----------|
| Escopo completo: arquivos + testes + deploy checklist | Do zero ao vivo, 7 passos | ✓ |
| Só código local: arquivos + testes | Sem seção de deploy | |

**Exemplo:**

| Option | Description | Selected |
|--------|-------------|----------|
| Sim — EC2 é o exemplo vivo do HOWTO | HOWTO referencia os diffs reais da fase | ✓ |
| Exemplo genérico /deep-dive-xyz/ | Placeholder sem exemplo real | |

**Notes:** HOWTO deve ser verificável — leitor pode ver exatamente o que foi feito para EC2.

---

## Claude's Discretion

- Texto exato da descrição do curso EC2 no teaser — expandir o que está em courses.ts
- Estilo visual do badge "Em breve" e link de volta ao hub — tokens existentes
- Localização do link de volta ao hub (topo ou rodapé)

## Deferred Ideas

- **Feature toggle para liberar o acesso às rotas pelo deploy** — mencionado pelo usuário como requisito adicional. Capacidade nova não coberta pelo escopo do scaffold. Anotado para fase futura de "Platform Config" (ex: variáveis de ambiente ou config JSON que habilita/desabilita rotas no build).
