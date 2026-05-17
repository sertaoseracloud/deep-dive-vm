# Phase 9: Python para Neurodivergentes LP - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrar o wireframe Claude Design "Python para Neurodivergentes" para uma landing page Astro completa em `/deep-dive-python-neurodivergentes/`, refatorando os componentes de seção existentes para data-driven (props-based) — começando por `Pricing.astro` que se torna o modelo padrão para todos os cursos. O hub recebe card ativo (3º curso). CI deve continuar verde.

</domain>

<decisions>
## Implementation Decisions

### D-01 — Rota e Hub Card
- **Rota:** `/deep-dive-python-neurodivergentes/` → `src/pages/deep-dive-python-neurodivergentes/index.astro`
- **Hub card:** status `'active'` em `src/data/courses.ts` (3º item do array) com link direto para a LP — sem badge "Em breve"
- **courses.ts entry:** `{ title: 'Python para Neurodivergentes', description: '...', url: '/deep-dive-python-neurodivergentes/', status: 'active' }`

### D-02 — Arquitetura: Componentes Data-Driven
- **Abordagem aprovada:** refatorar componentes de seção existentes para aceitar content via props. VM LP e Python LP compartilham os MESMOS arquivos de componente.
- **Ordem de prioridade:** `Pricing.astro` é PRIMEIRO (modelo novo, base para todos os cursos). Demais componentes (Hero, TrustBand, PainPoints, Method, Curriculum, Mentor, ForWho, Bonuses, Faq) refatorados em sequência.
- **Planner deve decidir:** se refatora todos os 11 componentes nesta fase ou apenas cria Python-specific content objects que passam props para os componentes (abordagem mais conservadora — manter VM funcionando durante refactor).

### D-03 — Pricing: Novo Modelo (Base para Todos os Cursos)
- **Pricing.astro** deve ser refatorado para aceitar props typed com todos os dados do pricing card.
- Interface esperada (a ser finalizada no plano):
  ```ts
  interface PricingProps {
    eyebrow: string;       // "INVESTIMENTO"
    title: string;         // HTML with <span class="flame">
    lede: string;
    ribbon: string;        // "⟡ ACESSO COMPLETO · ECONOMIA DE R$ X"
    tierLabel: string;     // "DEEP DIVE · PYTHON"
    courseName: string;    // "Curso Architecture Think · Acesso Completo"
    originalPrice: string; // "R$ 1.997"
    installments: { count: number; value: string; cents: string };
    pixPrice: string;      // "R$ 947"
    includes: string[];    // array of items (HTML allowed)
    ctaHref: string;       // Hotmart URL
    ctaText: string;
    guarantee: { days: number; text: string };
  }
  ```
- Após refactor, VM LP passa seus dados via props (não quebra comportamento atual).
- Python LP passa os dados do wireframe via props.

### D-04 — CTA e Hotmart
- **CTA principal:** Hotmart — `href="https://pay.hotmart.com/"` (placeholder — URL real a ser configurada pelo usuário antes do deploy)
- **Texto CTA:** "Quero começar agora"
- **Sticky CTA mobile:** "DESDE 12× R$ 78,92" · "Quero começar →"

### D-05 — OG Image
- Gerar `public/python-neurodivergentes-og.png` via sharp script inline (mesmo padrão de hub-og.png e ec2-og.png)
- Dimensões: 1200×630, `fit: 'cover'`, `position: 'top'`
- Usar `src/assets/claudio2.png` como base (mesma foto do hub)
- Layout prop: `ogImage="/python-neurodivergentes-og.png"`

### D-06 — Conteúdo: Wireframe é a Fonte de Verdade
O conteúdo completo foi extraído do wireframe `Python para Neurodivergentes - Standalone.html` (na raiz do repo). Seções identificadas:

**Hero:**
- H1: "Pare de começar 10 cursos de Python e abandonar todos. Aprenda do jeito que seu cérebro pede."
- Sub: "Um Deep Dive em Python desenhado para devs neurodivergentes (TDAH, autismo, dislexia, ansiedade)..."
- 4 bullets: 60h micro-aulas, 5 frentes, professor ND-friendly, 30 projetos reais
- CTA primário → `#investimento` · "Quero aprender Python do meu jeito"
- CTA ghost → `#ementa` · "Ver Ementa Completa"
- Meta badges: 60H · MICRO-AULAS, 6 MÓDULOS · 30 PROJETOS, BODY DOUBLING SEMANAL, ACESSO 12 MESES

**TrustBand:**
- Label: "DESENHADO COM E PARA PESSOAS"
- Badges: TDAH, AUTISMO, DISLEXIA, ANSIEDADE

**PainPoints (5 cards):**
- 01: Começa curso, vai bem 2 semanas, trava e nunca volta
- 02: Tutoriais de 3h geram fadiga sensorial, zero retenção
- 03: Documentação como muralha de texto
- 04: Vergonha de pedir ajuda em comunidades hostis
- 05: Programa em rajadas de hiperfoco, cursos rígidos não aceitam

**Method (5 frentes):**
- Visual, Hands-on, Repetição, Projeto, Body Doubling
- Tag: "O MÉTODO · ARCHITECTURE THINK"

**Curriculum (6 módulos, 60h, 30 projetos):**
- M.01 (8h): Fundamentos sem Tédio — variáveis, tipos, fluxo, funções
- M.02 (10h): Estruturas de Dados na Prática — listas, dicts, sets, compreensões
- M.03 (10h): Orientação a Objetos sem Fórmula — classes, instâncias, métodos
- M.04 (10h): Automação do Mundo Real — web scraping, arquivos, agendamento, planilhas
- M.05 (12h): Web e APIs com FastAPI — construir API, consumir API, deploy
- M.06 (10h): Dados, Análise e Pequena IA — pandas, plots, requests a LLMs

**Mentor:**
- Mesmo Cláudio F. L. Raposo (claudio2.png)
- Bio específica: "entende neurodivergência por dentro", stack poliglota Python/Go/Java/.NET, 10× MSFT + 7× AWS

**ForWho (2 cards):**
- É para você: neurodivergente (com/sem diagnóstico), já começou Python e nunca terminou, quer automatizar/freela/trocar carreira
- Não é para você: quer "Python em 10 dias" ultra-rápido, não quer projeto prático, espera atalho mágico

**Bonuses (3 bônus):**
- Bônus 01: Cookbook Python — 50+ scripts production-ready
- Bônus 02: 6 sessões 1:1 de 60 min com o professor
- Bônus 03: Body Doubling semanal ao vivo por 12 meses

**Testimonials:** AUSENTE no wireframe — deferred para próxima iteração do curso

**Pricing:**
- Ribbon: "⟡ ACESSO COMPLETO · ECONOMIA DE R$ 1.050"
- Tier: "DEEP DIVE · PYTHON"
- Nome: "Curso Architecture Think · Acesso Completo"
- De: R$ 1.997 · 12× R$ 78,92 ou R$ 947 PIX
- 7 includes: 60h micro-aulas, 6 módulos/30 projetos/5 frentes, Cookbook, 6 sessões 1:1, Body Doubling, Certificado, Acesso 12 meses
- Garantia: 7 dias incondicional
- Payment badges: HOTMART · COMPRA SEGURA, CARTÃO · PIX · BOLETO, ACESSO IMEDIATO

**FAQ (8 perguntas):**
1. Funciona se nunca programei na vida?
2. Não tenho diagnóstico oficial · ainda serve?
3. Quanto tempo dedico por semana?
4. As sessões 1:1 são adaptáveis à minha rotina?
5. Recebo certificado?
6. Posso parcelar? Quais formas de pagamento?
7. E se eu travar e não conseguir continuar?
8. O curso usa qual IDE/setup?

**Final CTA section:** (nova — não existe na VM LP)
- "Python do jeito que seu cérebro pede."
- Repetição do CTA principal → `#investimento`

**Sticky CTA mobile:**
- "DESDE 12× R$ 78,92" · botão "Quero começar →"

### Claude's Discretion
- Espaçamento interno entre seções: seguir padrão do projeto (96px desktop, 64px mobile via `section` global CSS)
- Expandable details dos módulos (M.01 open, M.02-M.06 fechados): manter comportamento do wireframe
- Hover states e transições: seguir padrão existente (cyan on hover, transition 0.2s ease)
- Ordem das seções: fiel ao wireframe (Hero → Trust → Pain → Method → Curriculum → Mentor → ForWho → Bonuses → Pricing → FAQ → FinalCTA → Footer)
- Brackets decorativos na foto do mentor: mesmo padrão da página do hub (4 spans `.brackets`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Wireframe (fonte de verdade visual e de conteúdo)
- `Python para Neurodivergentes - Standalone.html` — wireframe Claude Design na raiz do repo; conteúdo extraível via `node -e` com `JSON.parse(templateMatch[1])`. É a fonte de verdade para todo o conteúdo e CSS de seções novas.

### Roadmap e Requisitos
- `.planning/ROADMAP.md` §Phase 9 — Goal, Success Criteria, Requirements (PY-01 a PY-05)
- `.planning/REQUIREMENTS.md` §PY — Requisitos PY-01 a PY-05 com critérios exatos

### Componentes existentes (todos precisam ser lidos antes de refatorar)
- `src/pages/deep-dive-vm/index.astro` — LP atual que usa todos os section components
- `src/layouts/Layout.astro` — wrapper universal com props (title, description, url, ogImage, noindex, jsonLd)
- `src/components/sections/Pricing.astro` — PRIMEIRO componente a refatorar (modelo atual hardcoded)
- `src/components/sections/Hero.astro` — seção hero atual (hardcoded VM)
- `src/components/sections/TrustBand.astro` — trust band atual
- `src/components/sections/PainPoints.astro` — pain points atual
- `src/components/sections/Method.astro` — método atual
- `src/components/sections/Curriculum.astro` — currículo atual
- `src/components/sections/Mentor.astro` — mentor atual (mesmo Cláudio, bio diferente)
- `src/components/sections/ForWho.astro` — para quem é atual
- `src/components/sections/Bonuses.astro` — bônus atual
- `src/components/sections/Faq.astro` — FAQ atual
- `src/components/ui/Button.astro` — botão reutilizável
- `src/components/ui/SectionHead.astro` — eyebrow + title heading

### Dados existentes
- `src/data/courses.ts` — array de cursos; adicionar Python como 3º item, status: 'active'
- `src/data/social-links.ts` — referência de padrão para arquivos de dados tipados

### Testes de referência (para criar os da LP Python)
- `tests/e2e/hub.spec.ts` — padrão de E2E spec para hub (referência para python-lp.spec.ts)
- `tests/e2e/ec2-coming-soon.spec.ts` — padrão de E2E spec para LP simples
- `tests/seo/seo-meta.test.ts` — onde adicionar teste SEO para python og:image (teste 17)
- `HOWTO-new-landing-page.md` — checklist de 7 passos para adicionar LP (este é o caso de uso real)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/assets/claudio2.png` — foto do mentor (circular no hub, portrait na seção Mentor)
- `src/components/ui/Button.astro` — botão primário e ghost (já tem variantes)
- `src/components/ui/SectionHead.astro` — eyebrow + titleHtml + lede (parametrizado)
- Design tokens em `Layout.astro <style is:global>`: --chama-primaria, --nucleo-eletrico, --abismo-profundo, etc.
- Animações: `[data-reveal]`, `[data-stagger]`, `--ease-entrance` — já declaradas globalmente

### Established Patterns
- Todos os section components atuais são HARDCODED para VM — refactor necessário para props
- `Layout.astro` aceita `ogImage?: string` para OG image por-página
- OG image gerado via sharp script inline (ver `hub-og.png` e `ec2-og.png` como referência)
- `src/data/courses.ts` é o padrão de data file tipado — Python segue mesmo padrão
- Rota file-based: `src/pages/[slug]/index.astro` (sem base config)

### Integration Points
- `src/data/courses.ts` → adicionar entrada Python (hub renderiza automaticamente)
- `src/pages/deep-dive-python-neurodivergentes/index.astro` → nova rota (arquivo a criar)
- `src/components/sections/Pricing.astro` → refatorar para data-driven (afeta VM LP também)
- `tests/seo/seo-meta.test.ts` → adicionar `it()` block (teste 17) para python og:image
- `astro.config.mjs` → sitemap deve incluir a nova rota automaticamente (verificar)
- `public/python-neurodivergentes-og.png` → gerar antes do primeiro build

### Sections absent in wireframe vs VM LP
- `Testimonials.astro` — AUSENTE no wireframe Python (skip ou placeholder vazio)
- `StickyCta.astro` — Presente no wireframe Python (sticky CTA mobile — mesma estrutura)
- `UrgencyBar.astro` — Presente no wireframe Python como "value bar" (60h + 6 sessões + Body Doubling + 12 meses)
- **FinalCTA** — NOVA seção no Python wireframe (não existe na VM LP) — small section antes do footer

</code_context>

<specifics>
## Specific Ideas

- O wireframe tem a foto do mentor com `.brackets` decorativos (4 spans) — manter exatamente como no hub atual
- `TrustBand` no Python mostra condições neurodivergentes (TDAH/Autismo/Dislexia/Ansiedade) em vez de logos de empresas/certs — componente precisará de variante de conteúdo
- Módulos usam `<details>` expandíveis com 5 tracks internos — estrutura diferente da VM que usa cards fechados
- Pricing é EXATAMENTE o mesmo design visual da VM — só o conteúdo muda. Refatorar sem alterar CSS.
- FinalCTA: seção pequena de reforço antes do footer, com headline resumo + botão primário → `#investimento`
- Wireframe usa `href="https://pay.hotmart.com/"` como placeholder — planner deve deixar como constante configurável em `src/data/python-course.ts` ou similar

</specifics>

<deferred>
## Deferred Ideas

- **Testimonials para Python LP** — ausente no wireframe, deferred para após primeiros alunos
- **URL Hotmart real** — `https://pay.hotmart.com/` é placeholder; usuário configura antes do deploy
- **og:image definitivo** — placeholder via sharp; substituir quando identidade visual final do curso estiver pronta
- **Analytics por seção** — scroll depth, CTA click rate — futuro milestone
- **SSR / formulário de pré-cadastro** — static site apenas por ora

</deferred>

---

*Phase: 9-python-neurodivergentes*
*Context gathered: 2026-05-17*
