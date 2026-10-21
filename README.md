# O Sertão será Cloud — mentoria.sertaoseracloud.com

![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/sertaoseracloud/deep-dive-vm/badges/badges/coverage.json)

Site estático em [Astro](https://astro.build) com o hub de cursos e eventos do Cláudio Rapôso.

| Rota | Conteúdo |
| --- | --- |
| `/` | Hub: perfil do mentor, redes e cursos gratuitos (DivergePHP, DivergeTerraform, DivergePython e DivergeKubernetes), em abas **Cursos**, **Eventos** (`/#eventos`) e **Blog** (`/#blog`) |
| `/acessibilidade/` | Declaração de acessibilidade |
| `/blog/<slug>/` | Artigo do blog (texto do dev.to, com canonical para lá) |

Os cursos do hub vêm de [`src/data/courses.ts`](src/data/courses.ts). O banner de cada curso (1584×396, em [`src/assets/banners/`](src/assets/banners/)) aparece no carrossel do hub ([`BannerCarousel.astro`](src/components/ui/BannerCarousel.astro)): sem rotação automática, com botões, pontos, setas do teclado e arraste, e o Astro gera as versões WebP em 640, 960 e 1584 px. Os eventos vêm de [`src/data/events.ts`](src/data/events.ts) e cada link pode ter um banner em [`src/assets/eventos/`](src/assets/eventos/). As regras de exibição (agrupar por mês, "faltam N dias", esconder os encerrados) ficam em [`src/lib/eventos.ts`](src/lib/eventos.ts), com testes; elas rodam no build e no navegador, e o site é republicado todo dia à meia-noite (horário de Brasília) para os eventos encerrados saírem também do HTML e do sitemap.

O DivergeKubernetes oferece 261 exercícios de Kubernetes, AWS (EKS) e Azure (AKS) no navegador. Seu card tem acesso ao curso e ao repositório; como ainda não há banner cadastrado, ele não aparece no carrossel.

**Blog:** os artigos do [dev.to/sertaoseracloud](https://dev.to/sertaoseracloud) ficam dentro do site, em `/blog/<slug>/`, com o texto completo e a **URL canônica apontando para o dev.to** (`<link rel="canonical">` = `canonical_url` da API). Assim os buscadores tratam o dev.to como a origem e as páginas não contam como conteúdo duplicado; por isso elas também ficam fora do sitemap.

- [`scripts/buscar-devto.mjs`](scripts/buscar-devto.mjs) chama a API pública (`GET /api/articles?username=sertaoseracloud` e `GET /api/articles/:id`) e grava a lista em [`src/data/devto-artigos.json`](src/data/devto-artigos.json) e o corpo de cada artigo em `src/data/devto/<id>.html`. Só baixa os artigos novos ou editados, com 1 pedido por segundo e nova tentativa quando a API limita (429).
- A pipeline de publicação ([`deploy.yaml`](.github/workflows/deploy.yaml)) roda o script **todo dia à meia-noite de Brasília**, antes do build. Depois do build, roda os testes de SEO e do blog (`vitest run tests/seo tests/unit/lib`) sobre os artigos que acabaram de chegar; se falharem, nada é publicado. Se a API falhar, o site sai com o que está salvo no repositório. Para atualizar o que está salvo: `node scripts/buscar-devto.mjs` e commit.
- O HTML do dev.to passa por [`limparHtml`](src/lib/devto.js): saem botões e scripts que só funcionam lá, `<h1>` do texto vira `<h2>`, blocos de código e tabelas ficam roláveis pelo teclado e imagens carregam sob demanda.
- **Diagramas Mermaid** (blocos ` ```mermaid ` no dev.to, como fluxogramas e diagramas de sequência) viram desenho SVG na página do artigo, nas cores do tema do painel ♿ e redesenhados quando o tema muda. A biblioteca ([mermaid](https://mermaid.js.org) 12, `securityLevel: "strict"`) só é baixada quando um diagrama chega perto da tela, para não pesar na abertura da página. O desenho fica no tamanho real e rola na horizontal quando não cabe (com dica e foco pelo teclado); o código fica logo abaixo em "Ver o código do diagrama". Sem JavaScript, ou se a fonte tiver erro, o bloco aparece como código. Um `accTitle:` na fonte entra no rótulo acessível. Regras testáveis em [`src/lib/diagramas.ts`](src/lib/diagramas.ts).
- Na aba Blog do hub, cada card leva à página do artigo ("Ler artigo") e ao dev.to; há filtro por idioma e "Mostrar mais" (9 por vez). Artigos em inglês marcam `lang="en"`.

Estrutura do hub: a página ([`src/pages/index.astro`](src/pages/index.astro)) monta o perfil, as abas e os painéis; os cards ficam em [`src/components/hub/`](src/components/hub/) e os estilos em [`src/styles/hub.css`](src/styles/hub.css).

## Acessibilidade

O objetivo é WCAG 2.2 AA, com o mesmo padrão dos playgrounds DivergePHP, DivergeTerraform e DivergePython:

- **Painel ♿** em todas as páginas ([`AccessibilityPanel.astro`](src/components/ui/AccessibilityPanel.astro)): perfis rápidos, temas (padrão, claro, alto contraste, suave), tamanho do texto de 87,5% a 175%, fonte Atkinson Hyperlegible, espaçamento, linhas curtas, links sublinhados, reduzir animações e Libras com o VLibras (carregado só quando ligado).
- A escolha é salva no navegador e reaplicada por um script inline no `<head>`, antes da primeira pintura. Sem escolha salva, o site segue o sistema (`prefers-color-scheme`, `prefers-contrast`, `forced-colors` e `prefers-reduced-motion`).
- As fontes são hospedadas no próprio site pela API de fontes do Astro, com fallbacks de métricas ajustadas (CLS 0 e nenhuma requisição ao Google no navegador).
- Todas as fontes estão em `rem`, com mínimo de 0,75rem (12 px).
- Cores com transparência usam canais RGB por tema: `rgb(var(--rgb-ciano) / 0.3)`. Não use cores fixas em componentes; use os tokens do `Layout.astro`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm ci` | Instala as dependências do lockfile (Node 22.22 ou mais novo) |
| `npm run dev` | Servidor de desenvolvimento em `localhost:4321` |
| `npm run build` | Gera o site em `dist/` |
| `npm run check` | Checagem de tipos (`astro check`); roda na CI antes dos testes |
| `npm run preview` | Serve o `dist/` localmente |
| `npm run test:all` | Refaz o build e roda testes unitários e de integração, com cobertura mínima de 95% e resumo JSON para o badge |
| `npx playwright test --project=chromium` | Testes E2E, inclusive o axe WCAG 2.2 AA em todas as páginas e temas |
| `npm run test:perf` | Lighthouse CI sobre o `dist/` |
| `npm run lighthouse:ci` | Refaz o build e audita o `dist/` local, sem consultar produção |

## Publicação

A [`test.yml`](.github/workflows/test.yml) roda em cada push e PR: checagem de tipos, testes unitários (cobertura mínima de 95%), `npm audit` (barra vulnerabilidades altas), E2E e Lighthouse. Num push na `main`, o [`deploy.yaml`](.github/workflows/deploy.yaml) só publica no GitHub Pages depois que a `test.yml` termina com sucesso, e publica exatamente o commit testado. O deploy também roda todo dia à meia-noite de Brasília (blog e eventos) e pode ser disparado à mão. O Lighthouse também roda toda semana.

## Dependências e débito técnico

Revisão de 2026-10-21:

- Astro 7.4, Mermaid 12, Playwright 1.64, Vitest 5.0.5 e demais dependências diretas atualizados. TypeScript permanece em 6.0.3: o peer de `@astrojs/check` 0.9.12 aceita TypeScript 5/6, não 7. Não use `--force` ou `--legacy-peer-deps` para contornar esse contrato.
- `test:all` e `test:unit` refazem o build antes dos testes, evitando validar HTML antigo. Chamadas diretas a `vitest` continuam exigindo build atualizado quando os testes leem `dist/`.
- A cobertura gera `coverage-summary.json`, consumido pelo badge; relatório ausente ou inválido agora falha explicitamente, em vez de publicar `0%`.
- `lighthouse:ci` audita o build local com o servidor gerenciado pelo LHCI, sem `sleep`, processo de preview solto ou consulta acidental ao site de produção.
- O override de `uuid` é limitado ao LHCI (versão 11.1.1 ou superior na mesma major, compatível com seu `require`/`v4`). O LHCI usa a mesma versão de Lighthouse declarada no projeto, evitando manter um motor 12 separado do 13. Os overrides anteriores de Puppeteer, FTP e temporários foram preservados.
- **Pendente:** `@lhci/cli` 0.15.1 ainda usa `@lhci/utils → js-yaml 3 → argparse 1 → sprintf-js`, cadeia com cinco alertas moderados no `npm audit`. Não há correção publicada de `sprintf-js` na revisão. O downgrade sugerido por `audit fix --force` não foi aplicado, nem `js-yaml` foi forçado para uma major que remove `safeLoad`, usado pelo LHCI. São dependências de desenvolvimento; `npm audit --omit=dev` não apontou vulnerabilidades nesta revisão.
- E2E Firefox/WebKit/mobile continuam informativos na CI, não bloqueantes. A aprovação do Chromium não deve ser descrita como aprovação automática de todos os navegadores.
