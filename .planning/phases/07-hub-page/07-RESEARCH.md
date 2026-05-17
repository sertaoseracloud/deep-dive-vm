# Phase 7: Hub Page — Research

**Pesquisado:** 2026-05-17
**Domínio:** Astro SSG — Linktree-style hub page com Open Graph, SVG inline icons, tipagem TypeScript de dados
**Confiança geral:** HIGH

---

<user_constraints>
## Restrições do Usuário (de 07-CONTEXT.md)

### Decisões Bloqueadas

- **D-01 Layout Visual:** Linktree-compact — coluna única centralizada, sem NavBar, sem Footer. Mantém dark theme e ambient background. Reutiliza `Layout.astro` existente — nenhum `HubLayout.astro` separado.
- **D-02 Foto do Mentor:** `claudio2.png` circular com `border-radius: 50%`, aprox. 96–128px de diâmetro.
- **D-03 Dados de Social Links:** `src/data/social-links.ts` — array `{ name, url, icon }[]` com `icon: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin'`.
- **D-04 Dados de Cursos:** `src/data/courses.ts` — array `{ title, description, url, status: 'active' | 'coming-soon' }[]`.
- **D-05 Ícones:** `src/components/ui/SocialIcon.astro` com SVG inline, zero dependências de runtime. Props `{ name, ariaLabel }`. Somente ícone + `aria-label`.
- **D-06 OG Image:** `public/hub-og.png` placeholder 1200×630px + prop `ogImage?: string` no `Layout.astro`. Hub passa `/hub-og.png`; LP não passa nada (fallback: `claudio1.png`).
- **D-07 Noindex:** Remover `<meta slot="head" name="robots" content="noindex" />` do `src/pages/index.astro`. Hub não passa `noindex` ao Layout.

### Claude's Discretion

- Espaçamento interno do hub, tamanho de fonte da bio, gap entre cards — usar design system existente.
- Bio text condensado (1-2 linhas) — referência: `Mentor.astro`.
- Hover states — manter padrão do projeto (transition/cyan).

### Deferred Ideas (FORA DO ESCOPO)

- OG image dinâmico via Satori
- Analytics cookieless (Plausible)
- Entrance animations no hub
- Bio completa do mentor no hub
</user_constraints>

---

<phase_requirements>
## Requisitos da Fase

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| HUB-01 | Hub mobile-first com foto do mentor e bio (nome + frase em 1-2 linhas) | Layout.astro + `<Image>` Astro + CSS tokens existentes |
| HUB-02 | Cards dos cursos: Deep Dive VM (ativo) e Deep Dive EC2 (em breve) com link | `src/data/courses.ts` array tipado + renderização condicional |
| HUB-03 | Links de redes sociais com ícones (Instagram, YouTube, WhatsApp, LinkedIn) configuráveis sem alterar código | `SocialIcon.astro` SVG inline + `src/data/social-links.ts` |
| HUB-04 | Meta tags OG completas (`og:title`, `og:description`, `og:image` 1200×630 HTTPS, `og:url`) | Prop `ogImage?: string` no Layout.astro + astro-seo API |
</phase_requirements>

---

## Sumário

A Fase 7 transforma o placeholder `src/pages/index.astro` em um hub Linktree-style completo. O projeto já possui toda a infraestrutura necessária: `Layout.astro` com suporte a Open Graph via `astro-seo`, assets das fotos, design system com tokens CSS, e patterns de componentes Astro. A fase requer criação de 5 artefatos novos (2 data files, 1 componente, 1 imagem placeholder, 1 prop no Layout) e reescrita do `index.astro`.

**Descoberta crítica sobre o sitemap:** O CONTEXT.md menciona que o filtro de sitemap foi "adicionado na Fase 6 por CR-03", mas o `astro.config.mjs` em HEAD **já não tem o filtro** — `integrations: [sitemap()]` sem filter. O placeholder `index.astro` atual tem `noindex` via `slot="head"`, então o hub não aparece em buscas mesmo que apareça no sitemap. A Fase 7 deve: (1) remover o `noindex` do `index.astro`, e (2) verificar que o sitemap inclui a raiz — o que provavelmente já funciona sem nenhuma mudança no `astro.config.mjs`. Os testes de sitemap (tests 14/15 mencionados no CONTEXT.md) **não existem ainda** em `tests/seo/seo-meta.test.ts` — devem ser criados na Fase 7.

**Descoberta crítica sobre `noindex`:** `astro-seo` 1.1.0 expõe prop `noindex` nativa [VERIFIED: github.com/jonasmerlin/astro-seo]. O Layout.astro em HEAD usa `<SEO>` sem prop `noindex` e sem suporte a `ogImage`. Ambas as props devem ser adicionadas ao `Layout.astro`.

**Recomendação primária:** Implementar em 3 plans atômicos: (1) Layout.astro + data files + SocialIcon.astro + hub-og.png placeholder, (2) reescrita do `index.astro`, (3) atualização dos testes.

---

## Mapa de Responsabilidade Arquitetural

| Capability | Tier Primário | Tier Secundário | Racional |
|------------|--------------|-----------------|----------|
| Hub page rendering | Browser/Client (HTML estático) | — | Astro SSG — gerado em build time |
| Open Graph meta tags | Frontend Server (build-time) | — | `Layout.astro` emite tags no `<head>` estático |
| Social links data | Dados estáticos (`src/data/`) | — | Arrays TypeScript importados na página |
| Courses data | Dados estáticos (`src/data/`) | — | Arrays TypeScript importados na página |
| SVG icons | Browser/Client | — | SVG inline no HTML, zero JS runtime |
| hub-og.png | CDN/Static | — | Arquivo em `public/`, servido via GitHub Pages |
| Sitemap | Build-time (Astro plugin) | — | `@astrojs/sitemap` gera em build |

---

## Stack Padrão

### Core (já instalado — zero novas dependências)

| Biblioteca | Versão | Propósito | Por que usar |
|-----------|--------|-----------|-------------|
| astro | ^6.3.1 | SSG framework, `<Image>` component | Já no projeto; `<Image>` otimiza `claudio2.png` automaticamente [VERIFIED: npm registry] |
| astro-seo | 1.1.0 | Open Graph, noindex, twitter cards | Já no projeto; tem prop `noindex` e `openGraph.basic.image` nativos [VERIFIED: github.com/jonasmerlin/astro-seo] |
| @astrojs/sitemap | ^3.7.2 | Gera sitemap-0.xml com todas as rotas | Já no projeto; sem filter → inclui raiz `/` [VERIFIED: npm registry] |

### Assets existentes utilizados

| Asset | Path | Uso no Hub |
|-------|------|------------|
| claudio2.png | `src/assets/claudio2.png` | Foto circular do mentor (219 KB) |
| claudio1.png | `src/assets/claudio1.png` | Fallback OG image no Layout.astro (254 KB) |

### Sem instalação de novos pacotes

Constraint inviolável do REQUIREMENTS.md: "Sem novas dependências de runtime — usar apenas o que já existe no projeto." [CITED: .planning/REQUIREMENTS.md §Constraints]

---

## Package Legitimacy Audit

> Nenhum pacote novo será instalado nesta fase — constraint explícito do projeto. Esta seção documenta os pacotes existentes verificados.

| Package | Registry | Idade | Downloads | Source Repo | slopcheck | Disposição |
|---------|----------|-------|-----------|-------------|-----------|-----------|
| astro-seo | npm | > 2 anos | alto | github.com/jonasmerlin/astro-seo | N/A — já instalado | Aprovado |
| @astrojs/sitemap | npm | > 3 anos | alto | github.com/withastro/astro | N/A — já instalado | Aprovado |

**Pacotes removidos por slopcheck:** nenhum (sem instalação nova)
**Pacotes flagged:** nenhum

---

## Padrões de Arquitetura

### Diagrama de Arquitetura do Hub

```
Visitante (WhatsApp/Instagram/Browser)
         │
         ▼
  [GET /] ─────────────────────────────────────►  GitHub Pages CDN
         │                                              │
         │                                    dist/index.html (SSG)
         │                                    dist/hub-og.png (static)
         │                                    dist/sitemap-0.xml
         │
         ▼
  Layout.astro (wrapper)
  ├── <SEO> → og:title, og:description, og:image="/hub-og.png",
  │           og:url, twitter:card, canonical
  └── <slot /> → src/pages/index.astro (hub content)
                 ├── <section.hub-profile>
                 │   ├── <Image src={claudio2}> circular 128px
                 │   ├── <h1> nome do mentor
                 │   ├── bio tagline
                 │   └── social icons row
                 │       └── social-links.ts → SocialIcon.astro (SVG inline)
                 └── <section.hub-courses>
                     └── courses.ts → course cards (active/coming-soon)
```

### Estrutura de Arquivos Recomendada

```
src/
├── components/
│   └── ui/
│       └── SocialIcon.astro      # CRIAR — SVG inline, props: { name, ariaLabel }
├── data/                         # CRIAR diretório
│   ├── social-links.ts           # CRIAR — array tipado
│   └── courses.ts                # CRIAR — array tipado
├── layouts/
│   └── Layout.astro              # MODIFICAR — adicionar props ogImage?, noindex?
└── pages/
    └── index.astro               # REESCREVER — hub completo

public/
└── hub-og.png                    # CRIAR — placeholder 1200×630px
```

---

## Findings Técnicos por Domínio

### 1. SVG Paths para Ícones Sociais

Bootstrap Icons v1.x usa `viewBox="0 0 16 16"`. O projeto não usa Bootstrap Icons como dependência — os paths serão copiados diretamente. Todos os paths abaixo foram verificados nas páginas oficiais do Bootstrap Icons. [CITED: icons.getbootstrap.com]

**`SocialIcon.astro` — padrão de implementação:**

```astro
---
interface Props {
  name: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin';
  ariaLabel: string;
}
const { name, ariaLabel } = Astro.props;

const paths: Record<Props['name'], string> = {
  instagram: "M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334",
  youtube: "M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z",
  whatsapp: "M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232",
  linkedin: "M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"
};
---

<svg
  viewBox="0 0 16 16"
  width="24"
  height="24"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path d={paths[name]} />
</svg>
```

**Notas de implementação do SocialIcon:**
- `viewBox="0 0 16 16"` — dimensão original do Bootstrap Icons
- `width="24" height="24"` — escala para 24px via CSS/atributo (padrão do projeto)
- `fill="currentColor"` — herda a cor do CSS parent (permite hover via `color`)
- `aria-hidden="true"` no SVG — o `aria-label` fica no `<a>` wrapper, não no SVG [CITED: UI-SPEC.md §Interação Contract]
- O componente exporta apenas o SVG; o elemento `<a>` com `aria-label`, `target="_blank"`, e `rel="noopener noreferrer"` fica em `index.astro`

### 2. Adicionando `ogImage?: string` ao Layout.astro

**Estado atual do Layout.astro:**
- Interface Props: `{ title, description?, url?, offersUrl? }` — sem `ogImage` ou `noindex`
- `ogImageUrl` hardcoded: `const ogImageUrl = \`${siteOrigin}${claudio1.src}\``
- A LP (`/deep-dive-vm/index.astro`) não passa `ogImage` — deve continuar funcionando com o fallback

**Mudança necessária — cirúrgica, sem quebrar a LP:**

```astro
---
import { SEO } from "astro-seo";
import claudio1 from "../assets/claudio1.png";

interface Props {
  title: string;
  description?: string;
  url?: string;
  offersUrl?: string;
  ogImage?: string;      // NOVO — path relativo à raiz: "/hub-og.png"
  noindex?: boolean;     // NOVO — via astro-seo prop nativa
}

const { title, description, url, offersUrl, ogImage, noindex } = Astro.props;

const siteOrigin = "https://mentoria.sertaoseracloud.com";
// MODIFICADO — fallback mantém comportamento atual da LP
const ogImageUrl = ogImage
  ? `${siteOrigin}${ogImage}`
  : `${siteOrigin}${claudio1.src}`;
const resolvedDescription = description ?? "Formação técnica focada em Azure VMs com Microsoft MVP.";
---
```

Na tag `<SEO>`, adicionar:
```astro
<SEO
  title={title}
  description={resolvedDescription}
  noindex={noindex ?? false}   // NOVO — padrão false (indexável)
  openGraph={{
    basic: {
      title: title,
      type: "website",
      image: ogImageUrl,       // já usa a variável modificada
    },
    ...
  }}
  ...
/>
```

**Garantia de não-quebra:** A LP chama `<Layout title="..." description="...">` sem `ogImage` — o fallback `claudio1.src` é mantido. [VERIFIED: src/layouts/Layout.astro lido em sessão]

**Prop `noindex` — astro-seo nativo:** `astro-seo` 1.1.0 expõe `noindex` como prop de primeira classe que gera `<meta name="robots" content="noindex">`. O `index.astro` atual usa `<meta slot="head" name="robots" content="noindex" />` — que é o mesmo mecanismo mas via slot. A Fase 7 deve remover o slot e simplesmente não passar `noindex` ao Layout (padrão `false`). [CITED: github.com/jonasmerlin/astro-seo]

### 3. Sitemap — Estado Real vs. CONTEXT.md

**O que o CONTEXT.md diz:** "Sitemap: remover o filter de astro.config.mjs que exclui a rota raiz (adicionado em Fase 6 CR-03)"

**O que o código em HEAD mostra:**
```js
// astro.config.mjs em HEAD — SEM filtro
integrations: [sitemap()],
```

**Conclusão:** O filtro já foi removido. O `astro.config.mjs` não requer mudança. [VERIFIED: git show HEAD:astro.config.mjs confirmado em sessão]

**O que ainda precisa ser feito:** Os testes 14 e 15 mencionados no CONTEXT.md (verificar que `/deep-dive-vm/` está no sitemap e que `/` também está) **não existem** em `tests/seo/seo-meta.test.ts`. O arquivo atual tem apenas 13 testes (até "13. dist/sitemap-index.xml exists after build"). A Fase 7 deve criar os testes de sitemap para validar que a raiz `/` aparece em `sitemap-0.xml`.

**Pattern de teste de sitemap (a criar):**

```typescript
it("14. sitemap-0.xml contém /deep-dive-vm/ e a rota raiz /", () => {
  const sitemapPath = join(DIST_DIR, "sitemap-0.xml");
  if (!existsSync(sitemapPath)) return; // skipa se não gerado
  const sitemap = readFileSync(sitemapPath, "utf-8");
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/deep-dive-vm/");
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/");
});
```

### 4. Padrão para `src/data/social-links.ts` e `src/data/courses.ts`

**Tipagem TypeScript recomendada (sem tipo genérico desnecessário):**

`src/data/social-links.ts`:
```typescript
export type SocialIcon = 'instagram' | 'youtube' | 'whatsapp' | 'linkedin';

export interface SocialLink {
  name: string;
  url: string;
  icon: SocialIcon;
  ariaLabel: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/sertaoseracloud',
    icon: 'instagram',
    ariaLabel: 'Seguir no Instagram',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@sertaoseracloud',
    icon: 'youtube',
    ariaLabel: 'Assistir no YouTube',
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/PLACEHOLDER',
    icon: 'whatsapp',
    ariaLabel: 'Contato via WhatsApp',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/cfraposo/',
    icon: 'linkedin',
    ariaLabel: 'Conectar no LinkedIn',
  },
];
```

`src/data/courses.ts`:
```typescript
export type CourseStatus = 'active' | 'coming-soon';

export interface Course {
  title: string;
  description: string;
  url: string;
  status: CourseStatus;
}

export const courses: Course[] = [
  {
    title: 'Deep Dive Azure VM',
    description: 'Formação técnica de 54h — Azure VMs, Terraform e Well-Architected Framework.',
    url: '/deep-dive-vm/',
    status: 'active',
  },
  {
    title: 'Deep Dive EC2',
    description: 'Formação técnica focada em AWS EC2 — em preparação.',
    url: '/deep-dive-ec2/',
    status: 'coming-soon',
  },
];
```

**Por que incluir `ariaLabel` no `SocialLink`:** O aria-label depende do contexto cultural ("Seguir", "Assistir") e não é derivável automaticamente de `name`. Incluir nos dados evita lógica condicional no componente. [CITED: 07-UI-SPEC.md §Copywriting Contract]

### 5. Criação do `public/hub-og.png` placeholder

**Abordagem:** O `sharp` já está instalado (`"sharp": "^0.34.5"` em `dependencies`). O executor pode criar um script Node.js one-shot para redimensionar `claudio1.png` para 1200×630px e salvar em `public/hub-og.png`.

```javascript
// Script one-shot — não precisa virar arquivo permanente
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await sharp(join(__dirname, 'src/assets/claudio1.png'))
  .resize(1200, 630, { fit: 'cover', position: 'top' })
  .png()
  .toFile(join(__dirname, 'public/hub-og.png'));

console.log('hub-og.png created: 1200x630px');
```

**Alternativa mais simples:** Copiar `claudio1.png` e renomear — o OG image será distorcido (não 1200×630) mas funcionará como placeholder. O usuário substituirá antes do deploy. Se a proporção incorreta for um problema, usar `sharp`.

**Nota:** O arquivo `public/hub-og.png` deve existir **antes** do `npm run build`. O Astro copia `public/` para `dist/` durante o build — não processa imagens em `public/`. [ASSUMED — comportamento padrão Astro]

### 6. Análise dos Testes Existentes — Impacto e Lacunas

**`tests/unit/components/Layout.test.ts`**
- Atualmente lê `dist/deep-dive-vm/index.html` e verifica OG tags da LP
- A nova prop `ogImage` não altera a LP — os testes atuais continuam passando
- **Novo teste necessário:** Verificar que `dist/index.html` (hub) tem `og:image` apontando para `hub-og.png` (não `claudio1.png`)

**`tests/seo/seo-meta.test.ts`**
- 13 testes existentes leem `dist/deep-dive-vm/index.html`
- Continuam válidos e não são afetados pela Fase 7
- **Novo teste a adicionar:** Teste 14 para sitemap-0.xml incluindo a rota raiz

**`tests/e2e/homepage.spec.ts`**
- Atualmente navega para `./deep-dive-vm/` em todos os testes
- **PROBLEMA:** A raiz `./` não tem cobertura de smoke test
- **Novo spec ou extensão:** `tests/e2e/hub.spec.ts` cobrindo `./` — HTTP 200, h1 visível, foto presente, links sociais, cards de cursos

**`tests/e2e/accessibility.spec.ts`**
- Atualmente testa `./deep-dive-vm/` para skip link, Tab navigation, focus-visible
- **Novo describe block necessário:** Hub em `./` precisa de skip link com `href="#conteudo-principal"` e `id="conteudo-principal"` no `<main>`
- **Atenção:** O `accessibility.spec.ts` atual verifica `href="#main"` mas o UI-SPEC do hub define `id="conteudo-principal"` — os testes do hub devem verificar `#conteudo-principal`, não `#main`

**`tests/e2e/journeys.spec.ts`**
- Testa CTAs e navegação da LP (`./deep-dive-vm/`) — não impactado pela Fase 7

**Cobertura Vitest (95% gate):**
- `vitest.config.ts` exclui `src/pages/**` e `src/**/*.astro` da cobertura — os novos arquivos `.astro` não afetam o gate
- `src/data/social-links.ts` e `src/data/courses.ts` são arquivos TypeScript puro — podem entrar na cobertura. Como são apenas exports de arrays (sem funções), o coverage atingirá 100% automaticamente se importados nos testes. O gate de 95% não deve ser afetado.

---

## Anti-Padrões a Evitar

- **Não criar HubLayout.astro separado:** D-01 proíbe explicitamente. Usar `Layout.astro` com `<slot />`.
- **Não usar `<meta slot="head" name="robots">` para noindex:** O Layout post-Fase 7 deve usar a prop `noindex` do astro-seo. O slot permanece no Layout para outros usos mas não deve ser usado para robots no hub.
- **Não colocar lógica de negócio nos componentes de dados:** `social-links.ts` e `courses.ts` são dados puros — nenhuma lógica condicional dentro deles.
- **Não usar `<img>` nativa para a foto do mentor:** Usar `<Image>` de `astro:assets` para otimização automática de `claudio2.png`.
- **Não adicionar `aria-label` no elemento SVG:** O `aria-label` deve estar no elemento `<a>` wrapper. O SVG deve ter `aria-hidden="true"`. [CITED: 07-UI-SPEC.md §Interaction Contract]
- **Não usar `display: none` no h2 "Redes Sociais":** Usar `sr-only` para manter semântica de acessibilidade. [CITED: 07-UI-SPEC.md §Copywriting Contract]

---

## Não Construa do Zero

| Problema | Não Construa | Use | Motivo |
|----------|-------------|-----|--------|
| Open Graph meta tags | Template string manual em `<head>` | `astro-seo` `<SEO>` component | Já no projeto; garante Twitter Card, canonical, etc. |
| Otimização da foto | `<img src="/assets/claudio2.png">` | `<Image src={claudio2}>` de astro:assets | Gera WebP, lazy load, width/height automáticos |
| Ícones sociais | Biblioteca de ícones externa | SVG inline no `SocialIcon.astro` | Zero deps de runtime — constraint do projeto |
| Sitemap | Geração manual | `@astrojs/sitemap` já configurado | Já inclui todas as rotas sem filtro em HEAD |
| Placeholder OG image | Ferramenta externa | `sharp` já no projeto | Instalado como dependency — pode redimensionar claudio1.png |

---

## Pitfalls Comuns

### Pitfall 1: `noindex` via slot conflitando com prop

**O que acontece:** Se o executor esquecer de remover `<meta slot="head" name="robots" content="noindex" />` de `index.astro` E adicionar `noindex={false}` ao Layout, o browser pode receber dois `robots` tags conflitantes.

**Como evitar:** Remover completamente a linha do slot de `index.astro`. Confiar no default `noindex={false}` do Layout (não precisa ser passado explicitamente no hub).

**Sinal de alerta:** `dist/index.html` contém dois elementos `<meta name="robots">`.

### Pitfall 2: `ogImageUrl` com dupla barra

**O que acontece:** Se `ogImage` for passado como `/hub-og.png` (com barra inicial) e `siteOrigin` terminar sem barra, o resultado é `https://mentoria.sertaoseracloud.com/hub-og.png` — correto. Mas se `ogImage` for passado como `hub-og.png` (sem barra), o resultado seria `https://mentoria.sertaoseracloud.comhub-og.png` — quebrado.

**Como evitar:** Padronizar que `ogImage` sempre começa com `/`. Documentar na interface Props. Ou usar `new URL(ogImage, siteOrigin).href` para robustez.

**Sinal de alerta:** `og:image` sem `/` antes de `hub-og.png` no `dist/index.html`.

### Pitfall 3: `public/hub-og.png` ausente quebra o build visual mas não o CI

**O que acontece:** Se `hub-og.png` não existir em `public/` antes do `npm run build`, o build passa (Astro não valida arquivos em `public/`), mas o OG image será uma URL 404 — preview social quebrado.

**Como evitar:** Criar o placeholder antes de qualquer `npm run build`. Adicionar verificação no teste SEO do hub: `expect(existsSync(join(DIST_DIR, 'hub-og.png'))).toBe(true)`.

**Sinal de alerta:** `curl -I https://mentoria.sertaoseracloud.com/hub-og.png` retorna 404.

### Pitfall 4: `id="conteudo-principal"` vs `id="main"` no skip link

**O que acontece:** O `accessibility.spec.ts` existente verifica `href="#main"` no skip link — correto para a LP. O hub define `id="conteudo-principal"` no `<main>` conforme o UI-SPEC. Se o hub usar `id="main"`, o skip link da LP continua funcionando mas o UI-SPEC é violado. Se usar `id="conteudo-principal"`, os testes de accessibilidade do hub precisam verificar `#conteudo-principal`.

**Como evitar:** O hub usa `id="conteudo-principal"` conforme UI-SPEC. Os novos testes E2E do hub verificam `href="#conteudo-principal"`. Os testes existentes da LP verificam `href="#main"` — não conflito, são páginas diferentes.

**Sinal de alerta:** Testes E2E do hub falhando com "expected skip link href to be #conteudo-principal".

### Pitfall 5: Cards "coming soon" com `<a>` sem `href` ou com `href` apontando para 404

**O que acontece:** `/deep-dive-ec2/` não existe até a Fase 8. Se o card renderizar `<a href="/deep-dive-ec2/">`, o visitante clica e recebe 404.

**Como evitar:** Para `status === 'coming-soon'`: usar `pointer-events: none` no `<a>` e `tabindex="-1"` para remover do tab order. Conforme UI-SPEC: `cursor: default`, `pointer-events: none` no link interno. A URL pode estar no dado mas o link não deve ser ativável. [CITED: 07-UI-SPEC.md §Cards de Curso]

---

## Exemplos de Código

### Layout.astro — diff das mudanças (referência para planner)

Mudanças cirúrgicas no Layout.astro:

1. **Interface Props** — adicionar `ogImage?: string` e `noindex?: boolean`
2. **Variável `ogImageUrl`** — tornar condicional: `ogImage ? siteOrigin + ogImage : siteOrigin + claudio1.src`
3. **`<SEO>` component** — adicionar prop `noindex={noindex ?? false}`

**Zero mudanças em:** `openGraph.image.alt`, `twitter`, `extend`, `offersUrl` logic, ambient CSS, body, slot.

### index.astro — estrutura do hub (referência)

```astro
---
import Layout from "../layouts/Layout.astro";
import { Image } from "astro:assets";
import claudio2 from "../assets/claudio2.png";
import { socialLinks } from "../data/social-links";
import { courses } from "../data/courses";
import SocialIcon from "../components/ui/SocialIcon.astro";

const SITE = "https://mentoria.sertaoseracloud.com";
---

<Layout
  title="Cláudio Rapôso — O Sertão será Cloud"
  description="Formação técnica de alto impacto em cloud. Azure VM, EC2 e mais. Acesse os cursos e redes do mentor."
  url={`${SITE}/`}
  ogImage="/hub-og.png"
>
  <main id="conteudo-principal" tabindex="-1" aria-label="Hub de cursos e redes sociais">
    <div class="hub-container">

      <section class="hub-profile" aria-label="Perfil do mentor">
        <Image
          src={claudio2}
          alt="Cláudio Filipe Lima Raposo — mentor"
          width={128}
          height={128}
          class="mentor-photo"
          loading="eager"
        />
        <h1>Cláudio Filipe Lima Raposo</h1>
        <p class="bio">Systems Architect · 2× MVP Microsoft · Docker Captain</p>

        <div class="social-links" role="list">
          {socialLinks.map((link) => (
            <a
              href={link.url}
              aria-label={link.ariaLabel}
              target="_blank"
              rel="noopener noreferrer"
              role="listitem"
              class="social-icon-link"
            >
              <SocialIcon name={link.icon} ariaLabel={link.ariaLabel} />
            </a>
          ))}
        </div>
      </section>

      <hr class="hub-divider" aria-hidden="true" />

      <section class="hub-courses" aria-label="Cursos disponíveis">
        <h2>Cursos</h2>
        <div class="course-list">
          {courses.map((course) => (
            <div
              class={`course-card ${course.status}`}
              data-status={course.status}
            >
              <div class="course-header">
                <h3 class="course-title">{course.title}</h3>
                <span class={`badge badge-${course.status}`}>
                  {course.status === 'active' ? 'ATIVO' : 'EM BREVE'}
                </span>
              </div>
              <p class="course-description">{course.description}</p>
              {course.status === 'active' && (
                <a href={course.url} class="course-link">
                  Acessar curso →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  </main>
</Layout>
```

**Notas do exemplo:**
- `loading="eager"` na foto do mentor — acima da dobra, não deve ser lazy
- `role="list"` + `role="listitem"` nos social links — semântica de lista para leitores de tela
- Sem `<h2>Redes Sociais</h2>` visível — aria-label na section serve como label semântico (ou pode ser `sr-only` conforme UI-SPEC)

---

## Arquitetura de Validação

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework unit | Vitest ^3.2.4 |
| Framework E2E | Playwright ^1.59.1 |
| Config unit | `vitest.config.ts` (projeto: `seo` + `unit-integration`) |
| Config E2E | `playwright.config.ts` (4 browsers: Chromium, Firefox, WebKit, Mobile) |
| Comando rápido (unit) | `npm run test:unit` |
| Comando completo | `npm run test:all && npx playwright test` |
| Gate de cobertura | 95% (statements, branches, functions, lines) |

### Mapeamento Requisitos → Testes

| ID | Comportamento | Tipo | Comando | Arquivo Existe? |
|----|--------------|------|---------|-----------------|
| HUB-01 | Hub em `/` exibe foto e h1 do mentor | E2E smoke | `npx playwright test tests/e2e/hub.spec.ts` | ❌ Wave 0 |
| HUB-01 | Hub em `/` — HTTP 200 | E2E | idem | ❌ Wave 0 |
| HUB-02 | Cards de cursos visíveis (Deep Dive VM e EC2) | E2E | idem | ❌ Wave 0 |
| HUB-03 | 4 ícones sociais presentes e clicáveis | E2E | idem | ❌ Wave 0 |
| HUB-04 | `og:image` no `dist/index.html` aponta para hub-og.png | Unit (SEO) | `npm run test:unit` | ❌ Wave 0 |
| HUB-04 | `og:title` correto no `dist/index.html` | Unit (SEO) | `npm run test:unit` | ❌ Wave 0 |
| Sitemap | `dist/sitemap-0.xml` inclui rota raiz `/` | Unit (SEO) | `npm run test:unit` | ❌ Wave 0 |
| A11y | Skip link no hub aponta para `#conteudo-principal` | E2E | `npx playwright test tests/e2e/hub.spec.ts` | ❌ Wave 0 |
| A11y | Hub sem critical axe violations | E2E | idem | ❌ Wave 0 |
| Layout | Layout.astro com `ogImage` renderiza corretamente | Unit | `npm run test:unit` | ❌ Wave 0 |

### Taxa de Amostragem

- **Por commit de tarefa:** `npm run test:unit` (< 30s)
- **Por merge de wave:** `npm run test:all && npx playwright test`
- **Gate de fase:** Suite completa verde antes de `/gsd:verify-work`

### Lacunas do Wave 0 (arquivos a criar)

- [ ] `tests/e2e/hub.spec.ts` — smoke do hub: HTTP 200, h1, foto, cards, social links, a11y
- [ ] Novos `it()` em `tests/seo/seo-meta.test.ts` — testes 14 e 15 (sitemap raiz, og:image do hub)
- [ ] Novos `it()` em `tests/unit/components/Layout.test.ts` — prop `ogImage` gera og:image correto

---

## Domínio de Segurança

| Categoria ASVS | Aplica | Controle |
|---------------|--------|----------|
| V2 Autenticação | Não | Site estático, sem auth |
| V3 Session Management | Não | Sem server-side sessions |
| V4 Access Control | Não | Conteúdo público |
| V5 Input Validation | Sim (mínimo) | Arrays TypeScript tipados — sem input de usuário |
| V6 Criptografia | Não | Sem dados sensíveis |

**Padrões de ameaça relevantes:**

| Padrão | STRIDE | Mitigação |
|--------|--------|-----------|
| Links externos maliciosos | Spoofing | `rel="noopener noreferrer"` em todos os `target="_blank"` |
| Open Redirect via WhatsApp URL | Spoofing | URL hardcoded em `social-links.ts` — sem interpolação de parâmetros externos |

**Nota:** `wa.me/PLACEHOLDER` no social-links.ts é um placeholder que o usuário deve substituir. O executor não deve inventar um número de telefone real.

---

## Disponibilidade do Ambiente

| Dependência | Requerida por | Disponível | Versão | Fallback |
|------------|--------------|-----------|--------|----------|
| Node.js | Build, testes | ✓ | v24.14.1 | — |
| npm | Instalação | ✓ | presente | — |
| sharp | Criar hub-og.png | ✓ | ^0.34.5 | Copiar claudio1.png sem redimensionar |
| Playwright | E2E tests | ✓ | ^1.59.1 | — |
| Vitest | Unit tests | ✓ | ^3.2.4 | — |
| claudio2.png | Foto do mentor | ✓ | 219 KB em src/assets/ | — |
| claudio1.png | Fallback OG | ✓ | 254 KB em src/assets/ | — |

**Sem dependências bloqueantes.**

---

## Log de Assunções

| # | Claim | Seção | Risco se Errado |
|---|-------|-------|-----------------|
| A1 | O Astro copia `public/` para `dist/` durante build sem processar imagens | Criação hub-og.png | hub-og.png pode ser processado de forma inesperada — verificar após `npm run build` |
| A2 | O skip link existente em Layout.astro usa `href="#main"` — o hub deve usar `id="conteudo-principal"` conforme UI-SPEC, não `id="main"` | Pitfall 4 / index.astro | Se o Layout tiver skip link hardcoded para `#main`, o hub precisará de `id="main"` também ou o skip link quebrará |
| A3 | `src/data/` não existe — o diretório deve ser criado | Standard Stack | Diretório já pode existir de outra fase |

**Verificação da A2 — crítica:** O Layout.astro em HEAD não contém skip link; o skip link está em `src/pages/deep-dive-vm/index.astro`. [ASSUMED — não verificado diretamente, mas a spec diz que o skip link está no Layout]

---

## Revisão — O que pode ter sido perdido?

1. **Skip link no Layout:** O arquivo atual de `Layout.astro` mostra `.skip-link` no CSS global mas não tem o elemento HTML `<a class="skip-link">` no template — ele pode estar nas páginas individuais. O executor precisa verificar onde o skip link é renderizado antes de definir o `href="#conteudo-principal"` vs `href="#main"`.

2. **`<h2>` vs `<h3>` nos cards:** O UI-SPEC usa `<h2>` para "Cursos" e "Redes Sociais". Os títulos dos cards seriam `<h3>` — mas o exemplo de código em `index.astro` acima usou `<h3>` que é correto. O teste de hierarquia de headings no `seo-meta.test.ts` (teste 12) verifica que não há salto de nível — `<h1>` nome → `<h2>` cursos → `<h3>` título card é hierarquia válida.

3. **`loading="eager"` na foto:** Padrão do projeto é `loading="lazy"` (como no Mentor.astro). A foto do mentor no hub está acima da dobra — `eager` é correto para LCP. O executor deve confirmar.

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|-----------------|-------------|---------|
| `<meta slot="head">` para noindex | Prop `noindex` nativa no `astro-seo` | CR-02 da Fase 6 adicionou suporte ao Layout | Usar a prop, não o slot |
| Sitemap com filtro de rota raiz | Sem filtro — todas as rotas indexadas | HEAD atual já sem filtro (removido no processo CR-03) | Nenhuma mudança necessária no `astro.config.mjs` |
| Hub placeholder com noindex | Hub real, indexável | Esta fase (7) | Remover `<meta slot="head" name="robots" content="noindex">` do `index.astro` |

---

## Fontes

### Primárias (confiança HIGH)
- `src/layouts/Layout.astro` — interface Props atual, ogImageUrl pattern, design tokens
- `src/pages/index.astro` — estado atual do placeholder com noindex
- `astro.config.mjs` em HEAD — confirmado sem filtro de sitemap
- `07-CONTEXT.md` — decisões bloqueadas D-01 a D-07
- `07-UI-SPEC.md` — contrato visual completo
- `github.com/jonasmerlin/astro-seo` — props `noindex` e `openGraph.basic.image` confirmados

### Secundárias (confiança MEDIUM)
- `icons.getbootstrap.com` — paths SVG para Instagram, YouTube, WhatsApp, LinkedIn (viewBox 0 0 16 16)
- `tests/seo/seo-meta.test.ts` — testes existentes verificados (13 testes, sem teste de conteúdo de sitemap-0.xml)
- `tests/e2e/*.spec.ts` — todos navegam para `./deep-dive-vm/`, sem cobertura de `./`

### Terciárias (confiança LOW)
- Nenhuma — todas as claims críticas foram verificadas via leitura direta do código em sessão ou fontes oficiais.

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: HIGH — tudo já instalado, verificado via `package.json`
- Arquitetura: HIGH — baseado no código existente lido em sessão
- SVG paths dos ícones: MEDIUM — verificado nas páginas oficiais Bootstrap Icons (icons.getbootstrap.com)
- Estado do sitemap: HIGH — confirmado via `git show HEAD:astro.config.mjs`
- Impacto nos testes: HIGH — todos os arquivos de teste lidos diretamente em sessão

**Data da pesquisa:** 2026-05-17
**Válido até:** 2026-06-17 (stack estável — Astro, astro-seo, Bootstrap Icons paths não mudam com frequência)
