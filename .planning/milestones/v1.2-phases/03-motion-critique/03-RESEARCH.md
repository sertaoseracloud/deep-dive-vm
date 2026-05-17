# Phase 3: Motion Critique — Research

**Pesquisado:** 2026-05-15
**Domínio:** Critique de animação com impeccable + migração de contexto via git worktree
**Confiança:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Usar git cherry-pick dos commits da branch impeccable-teach para trazer PRODUCT.md, DESIGN.md e .impeccable/design.json para o main. Preserva histórico de autoria.
- **D-02:** Os 3 arquivos: PRODUCT.md (raiz), DESIGN.md (raiz), .impeccable/design.json.
- **D-03:** A impeccable critique é executada via browser Playwright em http://localhost:4321/deep-dive-vm/. O dev server está rodando na porta 4321. Browser dá acesso a overlays visuais e inspeção de runtime.
- **D-04:** Se o dev server não estiver rodando no momento da execução, iniciar com npm run dev antes de rodar a critique.
- **D-05:** Output principal é 03-CRITIQUE.md com tabela estruturada: Severidade | Componente | Descrição do gap | ANIM-XX
- **D-06:** Severidades: P0 = ausência de animação onde ANIM-XX a exige; P1 = animação existe mas com timing/easing incorreto; P2 = oportunidade de melhoria sem requirement direto.
- **D-07:** O executor da critique registra APENAS: timing/duração, easing (genérico vs customizado), ausência de stagger, ausência de scroll-triggered reveals, micro-interações faltando, sequenciamento de entrada.
- **D-08:** O executor IGNORA: tipografia, cores, layout, espaçamento, contraste, ícones, copy.
- **D-09:** Issues fora do escopo de motion NÃO entram no 03-CRITIQUE.md.

### Claude's Discretion

- Organização interna da tabela (por componente ou severidade) fica a critério do executor.

### Deferred Ideas (OUT OF SCOPE)

- Parallax depth no Hero (múltiplas camadas) — Future Requirements do v1.2, não escopo desta critique.
- Issues de tipografia, cores e layout detectados pela critique — ignorados no inventário de motion.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| CRIT-01 | Rodar impeccable critique na homepage com foco em motion e produzir lista priorizada de gaps de animação (P0/P1/P2) que guie a implementação das fases seguintes | Cherry-pick integra o contexto impeccable; protocolo de critique usa Assessment A (LLM review) + Assessment B (detector); output filtrado para motion-only vai para 03-CRITIQUE.md |
</phase_requirements>

---

## Sumário

Esta phase tem **dois entregáveis sequenciais**: primeiro a migração de contexto (PRODUCT.md, DESIGN.md, .impeccable/design.json do worktree impeccable-teach para main), e depois a execução da critique de motion usando o skill impeccable. A critique gera um inventário P0/P1/P2 que se torna a spec de entrada da Phase 4.

**Descoberta crítica sobre cherry-pick:** Os arquivos PRODUCT.md, DESIGN.md e .impeccable/design.json existem no worktree `worktree-impeccable-teach` como **arquivos untracked** — nunca foram commitados na branch. Isso invalida D-01 (cherry-pick): não existe nenhum commit para cherry-pegar. O planner precisa usar `git add` + `git commit` no worktree, ou copiar os arquivos diretamente para main.

**Estratégia correta de migração:** Copiar os 3 arquivos do worktree para o working directory de main, depois criar um commit em main. Isso preserva os arquivos e é equivalente em resultado ao cherry-pick que o usuário imaginou.

**O protocolo de critique** usa dois assessments independentes: Assessment A (LLM revisando code + página ao vivo via Playwright) e Assessment B (detector automático via `npx impeccable detect --json`). Para esta phase, o executor deve filtrar os resultados de ambos os assessments mantendo apenas issues de motion (D-07).

**Recomendação primária:** Task 1 = migrar arquivos com `git commit` em main. Task 2 = executar critique com filtro motion-only. Task 3 = escrever 03-CRITIQUE.md com tabela P0/P1/P2.

---

## Architectural Responsibility Map

| Capability | Tier Primário | Tier Secundário | Racional |
|------------|--------------|-----------------|---------|
| Migração de contexto impeccable | CLI/Git | — | Operação de file system + git, sem servidor |
| Execução da critique (Assessment A) | LLM + Browser | Playwright | LLM lê código-fonte e visualiza página ao vivo |
| Execução da critique (Assessment B) | CLI | Browser overlay | `npx impeccable detect` analisa markup; browser mostra overlay visual |
| Geração do inventário 03-CRITIQUE.md | LLM | — | Síntese e priorização dos dois assessments, filtrada para motion |
| Dev server | Astro | — | `npm run dev` na porta 4321 serve a página para inspeção |

---

## Standard Stack

### Core

| Ferramenta | Versão | Propósito | Por que padrão |
|-----------|--------|-----------|----------------|
| impeccable (npx) | 2.1.9 | CLI detector de anti-patterns e overlays visuais | Skill do projeto — `npx impeccable detect --json` está documentado no protocolo de critique |
| Playwright | 1.59.1 | Automação de browser para Assessment A (visual inspection) | Já instalado no projeto, configurado em `playwright.config.ts` |
| motion@12.38.0 | 12.38.0 | Biblioteca de animação cujas APIs serão referenciadas na critique | Já instalado; critique identifica onde as APIs deveriam estar sendo usadas mas não estão |

### Descoberta de Versão

- `npx impeccable --version` retornou `2.1.9` [VERIFIED: npm registry via npx]
- `@playwright/test` em package.json: `^1.59.1` [VERIFIED: package.json]
- `motion` em package.json: `^12.38.0` [VERIFIED: package.json]

**Instalação adicional necessária:** Nenhuma. Todas as ferramentas já estão disponíveis.

---

## Package Legitimacy Audit

Não há novos pacotes a instalar nesta phase. `impeccable` é acessado via `npx` (sem instalação local) e já estava registrado no npm com versão 2.1.9.

| Pacote | Registry | Verificação | Disposição |
|--------|----------|-------------|------------|
| impeccable | npm | `npx impeccable --version` → 2.1.9 (ok) | Aprovado — executado via npx sem instalação permanente |

**Pacotes removidos por slopcheck:** nenhum
**Pacotes flagged como suspeitos:** nenhum

---

## Architecture Patterns

### Diagrama do Fluxo da Phase

```
worktree: impeccable-teach          main working dir
├─ PRODUCT.md (untracked)   ──cp──> PRODUCT.md
├─ DESIGN.md (untracked)    ──cp──> DESIGN.md
└─ .impeccable/design.json  ──cp──> .impeccable/design.json
                                          │
                                    git add + git commit
                                          │
                              IMPECCABLE_CONTEXT_DIR=.
                              node .agents/skills/impeccable/scripts/load-context.mjs
                                          │
                                   ┌──────┴──────┐
                              Assessment A    Assessment B
                              (LLM + Playwright) (npx detect)
                                   └──────┬──────┘
                                          │
                                   filtro: motion-only
                                          │
                                   03-CRITIQUE.md
                                   (tabela P0/P1/P2)
```

### Estrutura de Arquivos Criados

```
(raiz do projeto)
├── PRODUCT.md          ← copiado do worktree
├── DESIGN.md           ← copiado do worktree
├── .impeccable/
│   └── design.json     ← copiado do worktree
└── .planning/milestones/v1.2-phases/03-motion-critique/
    └── 03-CRITIQUE.md  ← gerado pela critique
```

### Padrão 1: Migração de Arquivos Não-Commitados (Worktree para Main)

**O quê:** Copiar arquivos untracked de um worktree para o working directory de main e commitar.
**Quando usar:** Sempre que o cherry-pick não é possível por ausência de commit de origem.
**Comandos exatos:**

```bash
# Verificar que os arquivos existem no worktree
ls "C:\Repo\landing-page\deep-dive-vm\.claude\worktrees\impeccable-teach\PRODUCT.md"
ls "C:\Repo\landing-page\deep-dive-vm\.claude\worktrees\impeccable-teach\DESIGN.md"
ls "C:\Repo\landing-page\deep-dive-vm\.claude\worktrees\impeccable-teach\.impeccable\design.json"

# Copiar para o working directory de main
cp "C:\Repo\landing-page\deep-dive-vm\.claude\worktrees\impeccable-teach\PRODUCT.md" \
   "C:\Repo\landing-page\deep-dive-vm\PRODUCT.md"

cp "C:\Repo\landing-page\deep-dive-vm\.claude\worktrees\impeccable-teach\DESIGN.md" \
   "C:\Repo\landing-page\deep-dive-vm\DESIGN.md"

mkdir -p "C:\Repo\landing-page\deep-dive-vm\.impeccable"
cp "C:\Repo\landing-page\deep-dive-vm\.claude\worktrees\impeccable-teach\.impeccable\design.json" \
   "C:\Repo\landing-page\deep-dive-vm\.impeccable\design.json"

# Commitar em main
cd "C:\Repo\landing-page\deep-dive-vm"
git add PRODUCT.md DESIGN.md .impeccable/design.json
git commit -m "feat(03): add impeccable context — PRODUCT.md, DESIGN.md, design.json"
```

**Nota:** `[ASSUMED]` que os arquivos no worktree não têm variações não-salvas (o `git status` do worktree mostrou `? Untracked` sem `M Modified`). A cópia direta é segura.

### Padrão 2: Execução da Critique com Filtro Motion-Only

**O quê:** Rodar o protocolo impeccable critique mas filtrar o output para apenas issues de motion.
**Quando usar:** D-07/D-08/D-09 exigem que apenas gaps de motion entrem em 03-CRITIQUE.md.

```bash
# Assessment B: CLI scan
npx impeccable detect --json src/

# Assessment B: Browser overlay (requer Playwright)
npx impeccable live &
# [anotar porta impressa]

# Para Assessment A: carregar contexto impeccable após migração
IMPECCABLE_CONTEXT_DIR="." node .agents/skills/impeccable/scripts/load-context.mjs
```

**Checklist de filtro motion-only (incluir no inventário):**
- timing/duração incorretos ou ausentes
- easing genérico ("easeOut") onde deveria ser `cubic-bezier(0.25, 1, 0.5, 1)`
- ausência de stagger em listas/cards
- ausência de scroll-triggered reveals (whileInView ou IntersectionObserver)
- micro-interações faltando (button hover, toggle spring)
- sequenciamento de entrada (hero stagger)

**Checklist de filtro motion-only (excluir do inventário):**
- tipografia, cores, espaçamento, contraste, ícones, copy — mesmo que o detector os reporte

### Anti-Patterns a Evitar

- **Cherry-pick em arquivos untracked:** O git cherry-pick opera em commits, não em arquivos de trabalho não-commitados. Tentar cherry-pick de um commit que não contém esses arquivos produz erro silencioso ou não-op. [VERIFIED: verificação do git status do worktree]
- **Rodar critique sem contexto impeccable:** O `load-context.mjs` não encontra PRODUCT.md/DESIGN.md no main atual. A critique sem contexto produz avaliação genérica que ignora a spec "A Forja do Arquiteto". PRODUCT.md e DESIGN.md devem estar em main ANTES de executar a critique.
- **Incluir issues não-motion no 03-CRITIQUE.md:** O detector vai reportar cores, tipografia, etc. Incluir esses no inventário polui a spec de entrada da Phase 4 com trabalho fora de escopo.
- **Usar `npx impeccable live` como webServer:** O dev server do Astro (`npm run dev`) deve já estar rodando. O `impeccable live` é apenas um servidor de injeção de overlay — é diferente do dev server da aplicação.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar Ao Invés | Por quê |
|----------|---------------|--------------|---------|
| Detecção de anti-patterns | Script grep manual em JSX | `npx impeccable detect --json src/` | O detector tem 27 padrões determinísticos, incluindo easing genérico e ausência de motion tokens |
| Overlay visual de issues | Screenshot comparison manual | `npx impeccable live` + injeção via Playwright | Overlay renderiza diretamente na página ao vivo — feedback imediato sem código extra |
| Classificação de severidade | Heurística ad-hoc | Protocolo D-06 (P0/P1/P2) + heuristics-scoring.md | Critérios de severidade já estão definidos e alinham com a Phase 4 |

---

## Estado Atual de Animações (Input da Critique)

Esta seção documenta o que o executor da critique vai encontrar ao avaliar o código-fonte.

### Componentes COM animação

| Componente | Arquivo | Animação Atual | Gap Identificado |
|-----------|---------|----------------|-----------------|
| HeroMotion | src/components/HeroMotion.tsx | `whileInView` único, `duration: 0.15`, `ease: "easeOut"` | Sem stagger (ANIM-01); easing genérico (ANIM-03) |
| NavBar | src/components/layout/NavBar.astro | CSS `transition` nos links hover | Easing genérico (ANIM-03); sem spring no mobile menu trigger |
| Button | src/components/ui/Button.astro | CSS hover (`background-color`, `box-shadow`) | Easing genérico (ANIM-03); arrow translate 4px sem easing custom |
| Pricing | src/components/sections/Pricing.astro | CSS hover no card | Easing genérico (ANIM-03) |
| MobileMenuMotion | src/components/MobileMenuMotion.tsx | motion/react — menu slide | Verificar se easing é custom ou genérico |
| CarouselMotion | src/components/CarouselMotion.tsx | motion/react — carrossel | Verificar timing e easing |
| SettingsToggle | src/components/SettingsToggle.tsx | Sem animação no toggle em si | Ausência de spring (ANIM-04) |

### Seções SEM animação (alvo ANIM-02)

| Seção | Arquivo | Status |
|-------|---------|--------|
| Method | src/components/sections/Method.astro | Nenhuma animação |
| Curriculum | src/components/sections/Curriculum.astro | Nenhuma animação |
| Bonuses | src/components/sections/Bonuses.astro | Nenhuma animação (alvo ANIM-05 também) |
| Faq | src/components/sections/Faq.astro | Nenhuma animação |
| ForWho | src/components/sections/ForWho.astro | Nenhuma animação |
| Mentor | src/components/sections/Mentor.astro | Nenhuma animação |
| PainPoints | src/components/sections/PainPoints.astro | Nenhuma animação |
| Testimonials (via CarouselMotion) | src/components/CarouselMotion.tsx | Carrossel tem motion, mas testimonials individuais sem stagger |

---

## Tokens de Motion do DESIGN.md

O executor da critique deve referenciar estes tokens ao avaliar gaps de easing:

| Token | Valor | Propósito |
|-------|-------|-----------|
| `duration-standard` | `150ms` | Duração máxima para transições de estado. Budget WCAG motion. |
| `ease-out-standard` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Easing padrão para transições de estado — ease-out sem bounce. |
| `duration-button` | `250ms` | Transições de botão (hover, arrow translate). |
| `duration-motion-lib` | `300ms` | Animações de entrada via motion/react (CarouselMotion, MobileMenuMotion). |

**Easing de referência do REQUIREMENTS.md (ANIM-03):** `ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)`

**Nota:** Existe uma ligeira discrepância entre o token `ease-out-standard` do design.json (`cubic-bezier(0.0, 0.0, 0.2, 1)`) e o `ease-out-quart` dos REQUIREMENTS (`cubic-bezier(0.25, 1, 0.5, 1)`). O executor da critique deve reportar ambos como referência. A decisão de qual usar é da Phase 4 (Claude's Discretion). [ASSUMED — não foi explicitamente resolvido no CONTEXT.md]

---

## Pitfalls Comuns

### Pitfall 1: Cherry-pick em Arquivos Não-Commitados

**O que vai errado:** D-01 assume que os arquivos estão em um commit da branch `worktree-impeccable-teach`. Mas `git status` no worktree mostra `? Untracked: 3 files — .impeccable/, DESIGN.md, PRODUCT.md`. Não existe nenhum commit contendo esses arquivos.
**Por que acontece:** O worktree foi criado para desenvolvimento local; os arquivos foram criados mas nunca commitados.
**Como evitar:** Usar cópia de arquivos (`cp`) seguida de `git add` + `git commit` no main. Não tentar `git cherry-pick`.
**Sinais de alerta:** `git log worktree-impeccable-teach -- DESIGN.md PRODUCT.md` retorna vazio.
[VERIFIED: git status do worktree confirmou arquivos untracked]

### Pitfall 2: Critique sem Contexto impeccable

**O que vai errado:** `load-context.mjs` retorna `hasProduct: false, hasDesign: false` quando executado no main atual. A critique roda sem contexto de marca e produz avaliações genéricas que ignoram "A Forja do Arquiteto".
**Por que acontece:** PRODUCT.md e DESIGN.md ainda não existem em main — só no worktree.
**Como evitar:** Task de migração (copiar + commitar) DEVE ser executada ANTES da critique.
**Sinais de alerta:** `load-context.mjs` retorna `contextDir` apontando para cwd mas `hasProduct: false`.
[VERIFIED: execução de `node .agents/skills/impeccable/scripts/load-context.mjs` retornou hasProduct: false]

### Pitfall 3: Escopo da Critique Contaminado com Issues Não-Motion

**O que vai errado:** O detector `npx impeccable detect` e o Assessment A reportam issues de tipografia, cores e layout. Se incluídos no 03-CRITIQUE.md, a Phase 4 teria trabalho fora de escopo em seu backlog.
**Por que acontece:** O protocolo de critique é full-spectrum por design — o filtro é responsabilidade do executor nesta phase específica.
**Como evitar:** Aplicar o filtro D-07 explicitamente: revisar CADA issue reportado e descartar tudo que não seja motion (timing, easing, stagger, scroll-trigger, micro-interação, sequenciamento).
**Sinais de alerta:** 03-CRITIQUE.md contém linhas sobre `color`, `typography`, `contrast`, `spacing`.

### Pitfall 4: `npx impeccable live` vs Dev Server Confundidos

**O que vai errado:** O executor tenta usar `npx impeccable live` como servidor da aplicação, ou esquece de iniciar o Astro dev server antes de rodar a critique.
**Por que acontece:** Dois servidores diferentes com propósitos diferentes.
**Como evitar:** `npm run dev` inicia o Astro (porta 4321). `npx impeccable live` inicia o servidor de overlay (porta auto-atribuída). Ambos precisam estar rodando simultaneamente para o Assessment B com browser.
**Sinais de alerta:** Playwright não consegue navegar para `http://localhost:4321/deep-dive-vm/`.

### Pitfall 5: Playwright Config usa `npm run preview` como webServer

**O que vai errado:** `playwright.config.ts` usa `npm run preview` como `webServer.command` — isso roda o build de produção, não o dev server. A critique deve usar `npm run dev` para ter acesso ao código-fonte não-minificado.
**Por que acontece:** A config do Playwright foi escrita para testes de CI, não para critique de desenvolvimento.
**Como evitar:** Iniciar o dev server manualmente (`npm run dev`) antes de rodar qualquer teste Playwright da critique. O `reuseExistingServer: true` (fora de CI) permite que o Playwright reutilize o servidor já rodando.

---

## Exemplos de Código

### Formato da Tabela 03-CRITIQUE.md

```markdown
# Motion Critique: Deep Dive Azure VM

**Data:** 2026-05-15
**Alvo:** http://localhost:4321/deep-dive-vm/
**Escopo:** Motion-only (timing, easing, stagger, scroll-triggers, micro-interações)

## Inventário de Gaps

| Severidade | Componente | Gap de Motion | ANIM-XX |
|-----------|-----------|---------------|---------|
| P0 | HeroMotion | Sem stagger: headline, lede e CTA aparecem simultaneamente em vez de sequenciados (100-150ms de delay entre elementos) | ANIM-01 |
| P0 | Method, Curriculum, Bonuses, Faq, ForWho, Mentor, PainPoints, Testimonials | 8 seções sem scroll-triggered reveal — conteúdo aparece instantaneamente sem transição de entrada | ANIM-02 |
| P1 | HeroMotion | Easing genérico "easeOut" — deve usar cubic-bezier(0.25, 1, 0.5, 1) (ease-out-quart) | ANIM-03 |
| P1 | Button.astro | Easing genérico nas transições hover — deve usar token ease-out-standard | ANIM-03 |
| P1 | Pricing.astro | Easing genérico no hover do card — deve usar token ease-out-standard | ANIM-03 |
| P0 | SettingsToggle | Toggle sem animação de estado — ausência de spring no indicador e fade no label | ANIM-04 |
| P0 | Bonuses, Pricing (feature list) | Cards e itens de lista sem stagger coordenado na entrada | ANIM-05 |
| P2 | NavBar | Links hover sem easing customizado — transição de cor usa ease CSS padrão | ANIM-03 |
```

*Este é um exemplo ilustrativo com base no estado atual do código. O executor vai ajustar após a critique real.*

### Verificação do Estado do Dev Server via Playwright

```typescript
// Verificar que a página responde antes da critique
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4321/deep-dive-vm/');
const title = await page.title();
console.log('Dev server OK:', title);
await browser.close();
```

### Detecção de Easing Genérico

O detector identifica `easeOut` string (formato Framer Motion legacy) versus cubic-bezier customizado. O executor deve buscar no código-fonte:

```bash
# Buscar easing genérico em componentes de motion
grep -r "ease.*:" src/components --include="*.tsx" --include="*.ts"
grep -r "easeOut\|easeIn\|linear" src/components --include="*.tsx"
grep -r "ease:" src/components --include="*.astro"
```

---

## Estado da Arte: Protocolo Impeccable Critique

| Abordagem Antiga | Abordagem Atual | Impacto |
|-----------------|-----------------|---------|
| Critique manual via code review | Assessment A (LLM) + Assessment B (detector automático) em paralelo | Dois sinais independentes; detector pega o que o LLM ignora |
| Output full-spectrum | Filtro de escopo por phase (D-07) | Inventário focado, sem contaminação de issues fora de escopo |
| Severidades ad-hoc | P0/P1/P2 com critérios explícitos (D-06) | Planner da Phase 4 pode mapear diretamente para prioridade de implementação |

---

## Assumptions Log

| # | Claim | Seção | Risco se Errado |
|---|-------|-------|-----------------|
| A1 | Os arquivos PRODUCT.md, DESIGN.md, .impeccable/design.json no worktree `impeccable-teach` são a versão correta e final (não um rascunho) | Padrão 1: Migração | Contexto impeccable incorreto contamina a critique e o design system da Phase 4 |
| A2 | O dev server Astro está rodando na porta 4321 conforme D-03 | Pitfall 4, Environment | A critique falha com timeout se o servidor não estiver disponível |
| A3 | A discrepância entre `ease-out-standard` do design.json (`cubic-bezier(0.0, 0.0, 0.2, 1)`) e `ease-out-quart` dos REQUIREMENTS (`cubic-bezier(0.25, 1, 0.5, 1)`) será resolvida na Phase 4 | Tokens de Motion | O executor da critique deve reportar ambos sem tomar decisão; se resolver agora, pode estar errado |
| A4 | O `reuseExistingServer: !process.env.CI` no playwright.config.ts permite que Playwright reutilize o dev server manualmente iniciado | Pitfall 5 | Se não reutilizar, o Playwright tentará iniciar `npm run preview` e conflitará com o dev server |

---

## Open Questions (RESOLVED)

1. **Discrepância de easing entre design.json e REQUIREMENTS.md**
   - O que sabemos: design.json tem `ease-out-standard: cubic-bezier(0.0, 0.0, 0.2, 1)` (Material Design ease-out). REQUIREMENTS.md ANIM-03 especifica `ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)`.
   - O que está obscuro: qual é o valor canônico a ser adotado em Phase 4?
   - Recomendação: Reportar ambos no 03-CRITIQUE.md como P1. A Phase 4 resolve. Não bloqueia esta phase.

2. **Commit da branch impeccable-teach**
   - O que sabemos: os arquivos são untracked — sem commit para cherry-pick.
   - O que está obscuro: o usuário pretendia commitar antes de criar o CONTEXT.md?
   - Recomendação: Usar cópia direta + commit em main. Mais simples e equivalente em resultado.

---

## Environment Availability

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| Node.js | Scripts impeccable | ✓ | v24.14.1 | — |
| npx | `npx impeccable detect` | ✓ | 11.11.0 | — |
| impeccable (npm) | Assessment B | ✓ (via npx) | 2.1.9 | — |
| Playwright | Assessment A (browser automation) | ✓ | 1.59.1 | Critique sem inspeção visual (Assessment A somente code-review) |
| Dev server Astro (porta 4321) | D-03 — critique ao vivo | [ASSUMED ✓] | Astro 6.3.1 | `npm run dev` antes da critique |
| git worktree `impeccable-teach` | Migração de contexto | ✓ | — | Arquivos confirmados como untracked no worktree |

**Dependências ausentes sem fallback:** nenhuma.

**Dependências ausentes com fallback:** Dev server Astro — iniciar com `npm run dev` se não estiver ativo.

---

## Validation Architecture

> Nyquist validation: não configurado explicitamente; tdd: true em config → incluir seção.

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Playwright 1.59.1 (e2e) + Vitest 3.2.4 (unit) |
| Config | playwright.config.ts / vitest.config.ts |
| Comando rápido | `npx playwright test --project=chromium -g "motion"` |
| Suite completa | `npm run test:visual` |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando Automatizado | Arquivo Existe? |
|--------|--------------|---------------|---------------------|-----------------|
| CRIT-01 | 03-CRITIQUE.md existe com tabela P0/P1/P2 | Smoke (verificação de arquivo) | `test -f .planning/milestones/v1.2-phases/03-motion-critique/03-CRITIQUE.md` | ❌ Wave 0 |
| CRIT-01 | PRODUCT.md existe na raiz do projeto | Smoke | `test -f PRODUCT.md` | ❌ Wave 0 |
| CRIT-01 | DESIGN.md existe na raiz do projeto | Smoke | `test -f DESIGN.md` | ❌ Wave 0 |
| CRIT-01 | .impeccable/design.json existe | Smoke | `test -f .impeccable/design.json` | ❌ Wave 0 |

> Nota: CRIT-01 é um processo de análise humana/LLM — não tem testes de comportamento de UI automáticos. As verificações acima confirmam que os artefatos foram gerados.

### Wave 0 Gaps

- [ ] Verificações de existência de arquivo (bash scripts, não vitest) — cobre CRIT-01

---

## Security Domain

> Esta phase não instala dependências de rede nem processa dados de usuário. Nenhuma categoria ASVS se aplica.

ASVS: Não aplicável — phase de análise e geração de artefato de planejamento (03-CRITIQUE.md). Sem autenticação, sem inputs de usuário, sem criptografia.

---

## Fontes

### Primary (HIGH confidence)

- Verificação direta via git: `git status` no worktree `impeccable-teach` confirmou arquivos untracked
- `.agents/skills/impeccable/reference/critique.md` — protocolo completo de Assessment A e B
- `.agents/skills/impeccable/reference/animate.md` — tokens de easing e timing
- `.agents/skills/impeccable/reference/audit.md` — categorias de severidade P0-P3
- `.agents/skills/impeccable/reference/motion-design.md` — regras de easing e duração
- `.claude\worktrees\impeccable-teach\.impeccable\design.json` — tokens de motion do design system
- `.claude\worktrees\impeccable-teach\DESIGN.md` — spec "A Forja do Arquiteto" completa
- `.claude\worktrees\impeccable-teach\PRODUCT.md` — contexto de produto e brand personality
- `src/components/HeroMotion.tsx` — estado atual de animação verificado
- `src/pages/index.astro` — composição de seções verificada
- `playwright.config.ts` — configuração de webServer verificada
- `package.json` — versões de dependências verificadas

### Secondary (MEDIUM confidence)

- `npx impeccable --version` → 2.1.9 (verificado no ambiente)
- `node .agents/skills/impeccable/scripts/load-context.mjs` → confirmou ausência de PRODUCT.md/DESIGN.md em main

### Tertiary (LOW confidence)

- Nenhuma claim de confiança baixa nesta pesquisa.

---

## Metadata

**Breakdown de confiança:**
- Migração git: HIGH — verificado que os arquivos são untracked (git status direto)
- Protocolo de critique: HIGH — lido de `.agents/skills/impeccable/reference/critique.md`
- Estado atual de animações: HIGH — lido do código-fonte real
- Tokens de motion: HIGH — lido de design.json e DESIGN.md no worktree
- Disponibilidade do dev server: ASSUMED — não verificado se está rodando agora

**Data da pesquisa:** 2026-05-15
**Válido até:** 2026-06-15 (dependências estáveis, worktree não muda)
