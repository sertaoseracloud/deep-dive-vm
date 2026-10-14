# O Sertão será Cloud — mentoria.sertaoseracloud.com

![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/sertaoseracloud/deep-dive-vm/badges/badges/coverage.json)

Site estático em [Astro](https://astro.build) com o hub de cursos e as landing pages das formações.

| Rota | Conteúdo |
| --- | --- |
| `/` | Hub: perfil do mentor, redes e cursos gratuitos (DivergePHP, DivergeTerraform e DivergePython), em abas **Cursos** e **Eventos** (`/#eventos`), cada uma com carrossel de banners |
| `/deep-dive-vm/` | LP do Deep Dive Azure VM |
| `/deep-dive-python-neurodivergentes/` | LP do Deep Dive Python para Neurodivergentes |
| `/deep-dive-ec2/` | Página "em breve" do Deep Dive EC2 |
| `/acessibilidade/` | Declaração de acessibilidade |

Os cursos do hub vêm de [`src/data/courses.ts`](src/data/courses.ts). O banner de cada curso (1584×396, em [`src/assets/banners/`](src/assets/banners/)) aparece no carrossel do hub ([`CourseCarousel.astro`](src/components/ui/CourseCarousel.astro)): sem rotação automática, com botões, pontos, setas do teclado e arraste, e o Astro gera as versões WebP em 640, 960 e 1584 px. Os eventos vêm de [`src/data/events.ts`](src/data/events.ts): só aparecem os que ainda não terminaram (a filtragem acontece no build), e cada link pode ter um banner em [`src/assets/eventos/`](src/assets/eventos/). Para criar uma LP nova, siga o [HOWTO](HOWTO-new-landing-page.md).

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
| `npm install` | Instala as dependências (Node 22.18 ou mais novo) |
| `npm run dev` | Servidor de desenvolvimento em `localhost:4321` |
| `npm run build` | Gera o site em `dist/` |
| `npm run preview` | Serve o `dist/` localmente |
| `npm run test:all` | Testes unitários e de integração, com cobertura mínima de 95% (precisa do `build`) |
| `npx playwright test --project=chromium` | Testes E2E, inclusive o axe WCAG 2.2 AA em todas as páginas e temas |
| `npm run test:perf` | Lighthouse CI sobre o `dist/` |

## Publicação

Cada push na `main` publica no GitHub Pages ([`deploy.yaml`](.github/workflows/deploy.yaml)). A [`test.yml`](.github/workflows/test.yml) roda os testes, o `npm audit` das dependências de produção, o E2E e o Lighthouse. O Lighthouse também roda toda semana.
