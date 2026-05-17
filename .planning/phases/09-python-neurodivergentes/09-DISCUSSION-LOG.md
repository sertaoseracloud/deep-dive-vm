# Phase 9: Python para Neurodivergentes LP - Discussion Log

**Session:** 2026-05-17
**Phase:** 9 — Python para Neurodivergentes LP

---

## Areas Discussed

### 1. Rota e estrutura de arquivo

**Question:** Qual será a rota da landing page no site?
**Options presented:** /deep-dive-python-neurodivergentes/, /python-para-neurodivergentes/, /deep-dive-python-neurodivergentes/
**User selected:** /deep-dive-python-neurodivergentes/

**Question:** Status do curso (LP completa vs coming-soon)?
**User selected:** LP completa com preço e CTA

**Question:** Quais seções o wireframe tem?
**User selected:** Hero, Para quem é, Módulos/Currículo, Pricing/Oferta

---

### 2. Hub card

**Question:** Hub card ativo ou coming-soon?
**User selected:** Ativo com link para /deep-dive-python-neurodivergentes/

---

### 3. OG Image

**Question:** OG image pronta ou gerar placeholder via sharp?
**User selected:** Gerar placeholder via sharp (mesmo padrão hub-og / ec2-og)

---

### 4. Componentização

**Question:** Componentes separados ou arquivo único?
**User selected:** Componentes separados por seção (Recomendado)

**Question:** Estrutura de reuso (refactor data-driven vs duplicar vs Python-specific)?
**User selected:** Refatorar para data-driven via props

**Key clarification from user:** "é pegar os textos e integrar e migrar para os componentes já existentes, somente Pricing que tem um modelo novo com mais opções de compras e deve ser a base para todos os cursos"

---

### 5. CTA / Checkout

**Question:** Para onde aponta o CTA?
**User selected:** Hotmart (link direto)

---

### 6. Módulos / Currículo

**Question:** Conteúdo dos módulos está pronto?
**User selected:** "Tenho o currículo real para colocar agora"
**Note:** Conteúdo completo extraído do wireframe — 6 módulos, 60h, 30 projetos

---

### 7. Pricing — Modelo Novo

**User feedback:** "Pricing deve seguir o modelo novo" — wireframe define o modelo de referência que deve se tornar base data-driven para todos os cursos.

**Wireframe Pricing extracted:**
- Single card design (same visual as VM)
- 12× R$ 78,92 ou R$ 947 PIX
- 7 includes list
- Hotmart CTA
- 7-day guarantee
- Payment badges (Hotmart, Cartão/PIX/Boleto, Acesso Imediato)

---

### 8. Wireframe analysis (automated)

Wireframe extracted via Node.js from bundled HTML template. Full content available in `09-CONTEXT.md §D-06`.

Key finding: wireframe has SAME section structure as VM LP — TrustBand, PainPoints, Method, Curriculum, Mentor, ForWho, Bonuses, Pricing, FAQ. Plus 2 additions: FinalCTA section + no Testimonials.

---

## Claude's Discretion Items

- Espaçamento entre seções
- Hover states e transições
- Brackets decorativos na foto do mentor
- Módulos M.02-M.06 inicialmente fechados (M.01 open)

---

## Deferred Ideas

- Testimonials para Python LP (sem alunos ainda)
- URL Hotmart real (placeholder)
- og:image definitivo
- Analytics por seção
