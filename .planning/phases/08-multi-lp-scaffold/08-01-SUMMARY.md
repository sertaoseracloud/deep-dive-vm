---
phase: 08-multi-lp-scaffold
plan: "01"
subsystem: pages
tags: [astro, ssg, open-graph, sharp, lp-lite, ec2]
dependency_graph:
  requires:
    - src/layouts/Layout.astro (ogImage prop — fase 07)
    - src/assets/claudio1.png (source for OG image generation)
    - public/hub-og.png (analog reference — fase 07)
    - src/data/courses.ts (EC2 entry declared — fase 07)
    - astro.config.mjs (sitemap sem filtro — fase 07)
  provides:
    - public/ec2-og.png (OG placeholder 1200x630)
    - src/pages/deep-dive-ec2/index.astro (EC2 LP-lite page)
    - dist/deep-dive-ec2/index.html (built output)
    - dist/sitemap-0.xml entry for /deep-dive-ec2/
  affects:
    - dist/sitemap-0.xml (EC2 URL auto-added)
    - SEO indexation pipeline
tech_stack:
  added: []
  patterns:
    - LP-lite page usando Layout.astro sem NavBar/Footer
    - ogImage via prop de layout (leading slash obrigatório)
    - Sitemap auto-discovery via @astrojs/sitemap sem filtros
    - sharp para geração de OG placeholder 1200x630
key_files:
  created:
    - public/ec2-og.png
    - src/pages/deep-dive-ec2/index.astro
  modified:
    - src/layouts/Layout.astro (trazido da fase 07 — suporte a ogImage/jsonLd)
    - src/pages/index.astro (trazido da fase 07 — hub page)
    - src/pages/deep-dive-vm/index.astro (trazido da fase 07 — LP reorganizada)
    - src/data/courses.ts (trazido da fase 07 — EC2 entry)
    - src/data/social-links.ts (trazido da fase 07 — novo)
    - src/components/ui/SocialIcon.astro (trazido da fase 07 — novo)
    - public/hub-og.png (trazido da fase 07 — novo)
    - astro.config.mjs (trazido da fase 07 — sem base, sitemap sem filtro)
decisions:
  - "Trouxe artefatos da fase 07 (branch worktree-impeccable-teach) para o worktree baseado em main — necessário porque o worktree foi criado a partir de main que não tinha as mudanças das fases 06-07"
  - "EC2 page usa Layout.astro diretamente sem NavBar/Footer — padrão LP-lite conforme UI-SPEC"
  - "ogImage=/ec2-og.png com leading slash — Pitfall 3 do RESEARCH.md evitado"
  - "Nenhum filtro de sitemap adicionado — EC2 indexada automaticamente"
metrics:
  duration: "~15 minutos"
  completed: "2026-05-17"
  tasks_completed: 2
  files_created: 2
  files_modified: 8
---

# Phase 08 Plan 01: Multi-LP Scaffold (EC2 Page) Summary

**One-liner:** EC2 coming-soon LP-lite com OG placeholder 1200x630 gerado via sharp e rota `/deep-dive-ec2/` indexada pelo sitemap automaticamente.

## What Was Built

### Task 1: Generate public/ec2-og.png placeholder (1200x630)

Gerado `public/ec2-og.png` (1200x630 PNG) a partir de `src/assets/claudio1.png` usando sharp com `.resize(1200, 630, { fit: 'cover', position: 'top' })`. O script helper `gerar-ec2-og.mjs` foi criado, executado e deletado (nunca commitado). Dimensões verificadas com `sharp().metadata()`.

Adicionalmente, foram trazidos do branch `worktree-impeccable-teach` os artefatos pré-requisito da fase 07 que o worktree (baseado em main) não tinha: Layout.astro com suporte a ogImage/jsonLd, hub page, LP deep-dive-vm reorganizada, courses.ts com EC2 entry, social-links.ts, SocialIcon.astro, hub-og.png, e astro.config.mjs sem filtro de sitemap.

**Commit:** cf89e8f

### Task 2: Create src/pages/deep-dive-ec2/index.astro (LP-lite page)

Criada a página EC2 como LP-lite seguindo o padrão do hub:
- `import Layout from "../../layouts/Layout.astro"` (dois níveis acima)
- Props: `title`, `description`, `url`, `ogImage="/ec2-og.png"` (leading slash)
- Sem `noindex`, sem `jsonLd` — página indexada desde o deploy (D-01)
- Estrutura: skip-link + `<main id="conteudo-principal">` + `.ec2-container`
- Conteúdo: back-link `← Ver todos os cursos` → `/`, `<h1>Deep Dive EC2</h1>`, badge `EM BREVE`, parágrafo de descrição
- CSS: tokens de design system herdados via var(), responsivo 480px, reduced-motion compliant

`npm run build` gerou `dist/deep-dive-ec2/index.html` com og:image correto e sem noindex. Sitemap auto-incluiu `/deep-dive-ec2/`.

**Commit:** 6370881

## Verification Results

```
dist/deep-dive-ec2/index.html: EXISTS
og:image: ec2-og.png (presença confirmada)
noindex: AUSENTE (count = 0)
back-link href="/": PRESENTE
h1 "Deep Dive EC2": PRESENTE
badge "EM BREVE": PRESENTE
sitemap: https://mentoria.sertaoseracloud.com/deep-dive-ec2/ PRESENTE
npm run build: EXIT 0
public/ec2-og.png: 1200x630 PNG, 517925 bytes
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree baseado em main sem artefatos da fase 07**

- **Found during:** Task 1 (setup inicial)
- **Issue:** O worktree `worktree-agent-a029062bfe7036e7b` foi criado a partir de `main`, que não continha o trabalho das fases 06-07 (hub page, Layout.astro com ogImage, astro.config.mjs sem base, etc.). O plano 08-01 pressupõe esses artefatos como pré-requisito.
- **Fix:** Usou `git checkout worktree-impeccable-teach -- <files>` para trazer os 8 arquivos necessários das fases 06-07 para o worktree. Commitados junto com o ec2-og.png no Task 1 commit.
- **Files modified:** astro.config.mjs, src/layouts/Layout.astro, src/pages/index.astro, src/pages/deep-dive-vm/index.astro, src/data/courses.ts, src/data/social-links.ts, src/components/ui/SocialIcon.astro, public/hub-og.png
- **Commit:** cf89e8f

## Known Stubs

Nenhum. A página exibe conteúdo real (h1, badge, descrição). O `ec2-og.png` é um placeholder intencional (documentado no plano como "gerado de claudio1.png — usuário substitui antes do deploy real").

## Threat Surface Scan

Nenhuma nova surface de segurança introduzida além do previsto no threat model do plano:
- T-08-01: `gerar-ec2-og.mjs` foi deletado após execução, nunca commitado.
- T-08-02: `ogImage="/ec2-og.png"` é literal hardcoded — sem interpolação de input externo.

## Self-Check: PASSED

- `public/ec2-og.png`: EXISTS (517925 bytes, 1200x630 PNG)
- `src/pages/deep-dive-ec2/index.astro`: EXISTS
- `dist/deep-dive-ec2/index.html`: EXISTS (após build)
- Commit cf89e8f: EXISTS
- Commit 6370881: EXISTS
- `gerar-ec2-og.mjs`: DOES NOT EXIST (deletado)
- `noindex` no HTML: AUSENTE
- `ec2-og.png` no HTML: PRESENTE
- `/deep-dive-ec2/` no sitemap: PRESENTE
