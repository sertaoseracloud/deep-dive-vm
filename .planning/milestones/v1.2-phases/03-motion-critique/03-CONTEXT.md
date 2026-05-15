# Phase 3: Motion Critique - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

## Phase Boundary

Gerar um inventario priorizado de gaps de animacao (03-CRITIQUE.md) que guia 100% das decisoes da Phase 4. A phase entrega dois artefatos:
1. Contexto impeccable integrado ao main (PRODUCT.md, DESIGN.md, .impeccable/design.json)
2. 03-CRITIQUE.md com tabela P0/P1/P2 de gaps de motion, componente afetado e mapeamento para ANIM-XX

Nenhuma implementacao de animacao acontece nesta phase. O unico output executavel e o inventario de gaps.

## Implementation Decisions

### Migracao do Contexto Impeccable
- **D-01:** Usar git cherry-pick dos commits da branch impeccable-teach para trazer PRODUCT.md, DESIGN.md e .impeccable/design.json para o main. Preserva historico de autoria.
- **D-02:** Os 3 arquivos: PRODUCT.md (raiz), DESIGN.md (raiz), .impeccable/design.json.

### Execucao da Critique
- **D-03:** A impeccable critique e executada via browser Playwright em http://localhost:4321/deep-dive-vm/. O dev server esta rodando na porta 4321. Browser da acesso a overlays visuais e inspecao de runtime.
- **D-04:** Se o dev server nao estiver rodando no momento da execucao, iniciar com npm run dev antes de rodar a critique.

### Formato do Inventario de Gaps
- **D-05:** Output principal e 03-CRITIQUE.md com tabela estruturada: Severidade | Componente | Descricao do gap | ANIM-XX
- **D-06:** Severidades: P0 = ausencia de animacao onde ANIM-XX a exige; P1 = animacao existe mas com timing/easing incorreto; P2 = oportunidade de melhoria sem requirement direto.

### Filtro de Escopo -- Motion Only
- **D-07:** O executor da critique registra APENAS: timing/duracao, easing (generico vs customizado), ausencia de stagger, ausencia de scroll-triggered reveals, micro-interacoes faltando, sequenciamento de entrada.
- **D-08:** O executor IGNORA: tipografia, cores, layout, espacamento, contraste, icones, copy.
- **D-09:** Issues fora do escopo de motion NAO entram no 03-CRITIQUE.md.

### Claude Discretion
- Organizacao interna da tabela (por componente ou severidade) fica a criterio do executor.

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Contexto de Marca e Design
- .impeccable/design.json -- Tokens de design (disponivel apos cherry-pick)
- DESIGN.md (raiz, apos cherry-pick) -- Spec "A Forja do Arquiteto": paleta, tipografia, motion guidelines
- PRODUCT.md (raiz, apos cherry-pick) -- Contexto estrategico: publico, personalidade, anti-referencias

### Skill Impeccable
- .agents/skills/impeccable/reference/critique.md -- Protocolo de execucao da critique
- .agents/skills/impeccable/reference/animate.md -- Diretrizes de qualidade de animacao e timing
- .agents/skills/impeccable/reference/audit.md -- Protocolo de auditoria tecnica

### Requirements e Roadmap
- .planning/REQUIREMENTS.md -- 9 requirements do v1.2 (CRIT-01, ANIM-01..05, QUAL-01..03)
- .planning/ROADMAP.md -- Criterios de sucesso da Phase 3

### Estado Atual de Animacoes
- src/components/HeroMotion.tsx -- whileInView unico sem stagger (alvo: ANIM-01)
- src/components/ui/Button.astro -- CSS hover easing generico (alvo: ANIM-03)
- src/components/sections/Pricing.astro -- CSS hover easing generico (alvo: ANIM-03)
- Secoes SEM scroll reveals: Method.astro, Curriculum.astro, Bonuses.astro, Faq.astro, ForWho.astro, Mentor.astro, PainPoints.astro, Testimonials.astro (alvo: ANIM-02)

## Existing Code Insights

### Reusable Assets
- src/lib/motion-utils.ts -- useMotionEnabled, isMotionSupported, applyFallback. Todas as animacoes devem respeitar useMotionEnabled.
- src/components/HeroMotion.tsx -- Template: MotionConfig reducedMotion="user" + motion.div whileInView.
- motion@12.38.0 -- Instalado. motion/react para React islands, motion (vanilla) para scripts Astro.

### Established Patterns
- Pattern CSS+IO: IntersectionObserver seta data-* attribute, CSS reage via seletor de atributo.
- Pattern MotionConfig: Wrapper com reducedMotion="user" ao redor de motion.div.
- Pattern client:visible: Islands React hidratam quando entram no viewport (lazy). Padrao do HeroMotion.
- Easing atual: "easeOut" generico em todos os componentes. Alvo de padronizacao para cubic-bezier(0.25, 1, 0.5, 1).

### Integration Points
- src/pages/index.astro -- Ponto de composicao. Novas islands de motion sao importadas aqui com client:visible.
- src/components/SettingsToggle.tsx -- Controla motionEnabled. Todas as novas animacoes devem respeitar este toggle.

## Specific Ideas

- Dev server esta rodando na porta 4321 -- critique pode ser executada imediatamente.
- Cherry-pick deve ser o PRIMEIRO task do PLAN.md, antes de qualquer execucao da critique.
- 03-CRITIQUE.md serve como spec de input para a Phase 4 -- planner da Phase 4 deve le-lo antes de criar os plans.

## Deferred Ideas

- Parallax depth no Hero (multiplas camadas) -- Future Requirements do v1.2, nao escopo desta critique.
- Issues de tipografia, cores e layout detectados pela critique -- ignorados no inventario de motion.

---

Phase: 3-Motion Critique
Context gathered: 2026-05-15