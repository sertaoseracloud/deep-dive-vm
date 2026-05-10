# Especificação Técnica de Desenvolvimento: Landing Page Astro

## 1. Arquitetura de Software e Fluxo de Dados

A aplicação segue o padrão de **Arquitetura de Ilhas (Islands Architecture)**, onde o HTML é estático por padrão e o JavaScript é injetado apenas onde a interatividade é indispensável.

* **Padrão de Dados:** A página `index.astro` atua como o Controller, injetando dados via `props` para os componentes de `/sections/`.
* **Controle de Estado:** Interatividades leves (como o FAQ ou Navbar) devem preferir CSS puro ou a diretiva `client:visible`.

---

## 2. Especificação dos Componentes (`src/components/`)

### 2.1. Layout (`/layout/`)

Responsável pela moldura persistente e elementos de conversão global.

* **UrgencyBar.astro**
  * **SEO:** Não indexável (conteúdo promocional temporal).
  * **A11y:** Usar `role="alert"` ou `aria-live="assertive"` para atualizações de cronômetro.
* **Navbar.astro**
  * **Responsividade:** Implementar menu hambúrguer com `aria-expanded` controlado por script mínimo.
  * **Semântica:** Uso obrigatório de `<nav>` e listas `<ul>` para links de ancoragem.
* **Footer.astro**
  * **SEO:** Incluir informações da empresa (CNPJ, Endereço) para sinais de confiança (E-E-A-T).
  * **Semântica:** Uso de `<footer>` e `Copyright`.
* **StickyCta.astro**
  * **Performance:** Carregar via `client:idle`. Não deve competir com o LCP (Hero).

### 2.2. Seções (`/sections/`)

Cada seção é uma unidade de conteúdo autônoma.

* **Hero.astro**
  * **SEO:** Deve conter o único `<h1>` da página.
  * **Performance:** Imagem de fundo ou principal com `loading="eager"` e `fetchpriority="high"`.
* **TrustBand.astro**
  * **Performance:** Logos em formato SVG ou WebP otimizado com `aspect-ratio` fixo para evitar CLS.
* **Method.astro & Curriculum.astro**
  * **A11y:** Uso de `<details>` e `<summary>` para o currículo, ou listas semânticas.
  * **SEO:** Palavras-chave semânticas relacionadas ao nicho do curso.
* **Testimonials.astro**
  * **Semântica:** Uso de `<figure>` e `<blockquote>` para citações de alunos.
* **Pricing.astro**
  * **A11y:** Tabelas ou cards com contraste de cores validado (WCAG AA).
* **FAQ.astro**
  * **SEO:** Implementar Schema `FAQPage` via JSON-LD dinamicamente.

### 2.3. UI Kit (`/ui/`)

Componentes atômicos e reutilizáveis.

* **Button.astro:** Deve aceitar variantes (primary, secondary) e ser flexível para `<a>` (âncoras) ou `<button>`.
* **SectionHead.astro:** Padronização de `<h2>` e parágrafos de introdução de seção para consistência de design.

---

## 3. Diretrizes de SEO e Meta-Informação

O arquivo `src/layouts/Layout.astro` deve gerenciar o `<head>` global:

1. **Título e Meta:** Dinâmicos via Props (Título < 60 chars, Descrição < 155 chars).
2. **Open Graph:** Inclusão de imagem de compartilhamento (1200x630px) e `og:type="website"`.
3. **Canonical:** Tag `<link rel="canonical" href={Astro.url} />` obrigatória em todas as rotas.
4. **Sitemap:** Integrar `@astrojs/sitemap` no arquivo `astro.config.mjs`.

---

## 4. Performance e Core Web Vitals (CWV)

| Métrica | Meta | Estratégia Astro |
| :--- | :--- | :--- |
| **LCP** | < 2.0s | Otimizar imagens do Hero e evitar JS bloqueante no topo. |
| **FID/INP** | < 100ms | Minimizar a hidratação e usar `client:visible`. |
| **CLS** | 0.0 | Definir `width` e `height` em todas as imagens e slots de altura no StickyCta. |

---

## 5. Checklist de Responsividade e Acessibilidade

### Responsividade

* **Breakpoints:** Priorizar 320px (mobile), 768px (tablet) e 1280px+ (desktop).
* **Touch Targets:** Botões e links com área mínima de clique de 44x44px.
* **Imagens:** Uso de `srcset` via componente `<Image />` do Astro para servir tamanhos proporcionais.

### Acessibilidade (A11y)

* **Contraste:** Texto/Fundo com razão mínima de 4.5:1.
* **Teclado:** Foco visível (`:focus-visible`) em todos os elementos de UI.
* **Alt Text:** Descrições claras em todas as imagens de `/sections/` que não forem meramente decorativas.

---

## 6. Configurações Recomendadas (astro.config.mjs)

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind'; // Opcional, se usar Tailwind

export default defineConfig({
  site: '[https://seusite.com.br](https://seusite.com.br)',
  integrations: [sitemap(), tailwind()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'always'
  }
});
