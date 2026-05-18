# Requirements: Python para Neurodivergentes LP (v1.4)

## Business Requirements

### Core Objective

Adicionar a landing page completa do curso **Python para Neurodivergentes** à plataforma
multi-LP, migrando o wireframe do Claude Design para Astro. O curso ficará disponível em
`/deep-dive-python-neurodivergentes/` e o hub em `/` terá seu card ativo com link direto.

### Constraints (invioláveis)

- NÃO alterar o conteúdo ou design da LP Deep Dive VM existente
- Fiel ao design system do projeto: tokens CSS (`--abismo-profundo`, `--nucleo-eletrico`, `--chama-primaria`, etc.), tipografia (Space Grotesk, JetBrains Mono, Chakra Petch), grid 1240px
- Sem novas dependências de runtime — usar apenas o stack existente
- CI/CD deve continuar verde após merge (Vitest + Playwright)
- URL do wireframe como fonte de verdade visual: `Python para Neurodivergentes - Standalone.html`

---

## PY — Landing Page Python para Neurodivergentes

- [ ] **PY-01**: A rota `/deep-dive-python-neurodivergentes/` existe e serve a landing page
  completa com todas as seções do wireframe: Hero (título + CTA), Público-alvo / Para quem é,
  Módulos / Currículo, e Pricing / Oferta — sem 404

- [ ] **PY-02**: O design é fiel ao wireframe Claude Design — mesmo design system do projeto
  (paleta de cores, tokens CSS, tipografia, layout grid, animações `[data-reveal]`)

- [x] **PY-03**: O hub em `mentoria.sertaoseracloud.com/` exibe card ativo para "Python para
  Neurodivergentes" com link direto para `/deep-dive-python-neurodivergentes/` — sem badge
  "Em breve"

- [x] **PY-04**: A LP possui meta tags Open Graph completas: `og:title`, `og:description`,
  `og:image` apontando para `python-neurodivergentes-og.png` (1200×630px gerado via sharp),
  `og:url = https://mentoria.sertaoseracloud.com/deep-dive-python-neurodivergentes/`

- [ ] **PY-05**: Suite de testes verde após a adição — E2E spec para a LP Python (HTTP 200,
  seções visíveis, CTA presente, back-link), teste SEO no Vitest (og:image no HTML compilado),
  sem regressão nas LPs existentes (deep-dive-vm, hub)

---

## Future Requirements (deferred)

- Conteúdo real das aulas (módulo-a-módulo detalhado) — após validação do formato com alunos
- og:image dinâmico via Satori — quando o curso tiver identidade visual definitiva
- Página de checkout integrada — fora do escopo static site
- Analytics por seção (scroll depth, CTA clicks) — próximo milestone

## Out of Scope

- Alterar o conteúdo da LP Deep Dive VM ou do hub Linktree
- Backend / formulário de matrícula — static site apenas
- A/B test de copy — fora do scope MVP
- Subdomínio dedicado para o curso — domínio único `mentoria.sertaoseracloud.com`

## Traceability

| REQ-ID | Phase | Plan | Status  |
|--------|-------|------|---------|
| PY-01  | 9     | —    | pending |
| PY-02  | 9     | —    | pending |
| PY-03  | 9     | —    | pending |
| PY-04  | 9     | —    | pending |
| PY-05  | 9     | —    | pending |
