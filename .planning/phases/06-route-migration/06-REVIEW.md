---
phase: 06-route-migration
reviewed: 2026-05-17T00:00:00Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - src/layouts/Layout.astro
  - src/pages/deep-dive-vm/index.astro
  - src/pages/index.astro
  - astro.config.mjs
  - playwright.config.ts
  - .lhcirc.json
  - .lighthouserc.json
  - public/CNAME
  - tests/unit/components/Button.test.ts
  - tests/unit/components/Faq.test.ts
  - tests/unit/components/Footer.test.ts
  - tests/unit/components/Hero.test.ts
  - tests/unit/components/Layout.test.ts
  - tests/unit/components/NavBar.test.ts
  - tests/unit/components/Pricing.test.ts
  - tests/unit/components/SectionHead.test.ts
  - tests/unit/components/StickyCta.test.ts
  - tests/unit/components/UrgencyBar.test.ts
  - tests/seo/seo-meta.test.ts
  - tests/e2e/homepage.spec.ts
  - tests/e2e/accessibility.spec.ts
  - tests/e2e/journeys.spec.ts
  - tests/e2e/motion-accessibility.spec.ts
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 06: Code Review Report — Route Migration

**Reviewed:** 2026-05-17T00:00:00Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

A migração move o site de `base: '/deep-dive-vm/'` para roteamento raiz, criando `src/pages/deep-dive-vm/index.astro` como landing page e `src/pages/index.astro` como hub placeholder. O layout foi refatorado com `offersUrl` opcional e slot `head` adicionado.

Os problemas mais graves estão nas configurações do LHCI (ambos os arquivos apontam para a URL antiga `/deep-dive-vm/` em vez da nova rota raiz), o que significa que o gate de qualidade do Lighthouse nunca testará a landing page na rota correta. Há também um problema estrutural no `src/pages/index.astro`: o `noindex` é injetado via slot `head` mas pode não funcionar conforme o esperado dependendo de como o `astro-seo` renderiza. E o comentário obsoleto em `accessibility.spec.ts` referencia `src/pages/index.astro` com informação incorreta após a migração.

---

## Critical Issues

### CR-01: LHCI coleta na URL errada — landing page nunca auditada na rota migrada

**File:** `.lhcirc.json:6` e `.lighthouserc.json:6`

**Issue:** Ambos os arquivos LHCI configuram `"url": ["http://localhost/deep-dive-vm/"]`. Após a migração, a landing page está em `http://localhost/deep-dive-vm/` — mas o servidor estático (`staticDistDir: "./dist"`) expõe o arquivo em `dist/deep-dive-vm/index.html`. O LHCI com `staticDistDir` inicia seu próprio servidor HTTP e serve `dist/` na raiz. A URL correta para a landing page seria `http://localhost/deep-dive-vm/` — porém a rota **raiz** (`/`) agora é o hub placeholder com `noindex`, que não deve ser auditado pelo gate de SEO.

O problema concreto: o `assert` de `categories:seo` (gate de erro) será aplicado **também** à rota `/deep-dive-vm/`. O hub em `/` (com `noindex`) passará no gate de SEO apenas se o LHCI não auditar essa rota, mas a configuração atual não exclui explicitamente `/` nem audita `/deep-dive-vm/` como rota primária da landing page separada do hub. Se o LHCI encontrar o `noindex` na rota `/`, o score de SEO cai e o gate falha — ou não é testado de forma alguma porque só `/deep-dive-vm/` está na lista.

Mais grave: o requisito descrito na tarefa era "hub excluído do gate de SEO" — mas nenhum dos dois arquivos LHCI inclui a rota `/` na lista de URLs. Isso significa o hub **não** é excluído explicitamente; ele simplesmente não é auditado. Isso é correto, mas o gate de SEO em `categories:seo: ["error", { "minScore": 0.9 }]` no `.lhcirc.json` aplica-se somente à landing page `/deep-dive-vm/` — o que parece intencional. No entanto, o gate de `categories:performance: ["error", { "minScore": 0.8 }]` existe apenas no `.lighthouserc.json` mas não no `.lhcirc.json`, criando **configurações divergentes entre CI e local**. Um pipeline que usa `.lhcirc.json` em CI nunca aplica o gate de performance.

**Fix:** Unificar os dois arquivos ou explicitamente documentar qual é usado em qual contexto. Se `.lhcirc.json` é o arquivo de CI, adicionar o gate de performance nele:

```json
"categories:performance": ["error", { "minScore": 0.8 }]
```

E se `.lighthouserc.json` é local, alinhar os thresholds de `categories:accessibility` (atualmente `"warn"` no `.lhcirc.json` mas `"error"` no `.lighthouserc.json`).

---

### CR-02: `noindex` no hub via slot `head` pode não suprimir indexação

**File:** `src/pages/index.astro:9`

**Issue:** O hub injeta `<meta slot="head" name="robots" content="noindex" />` usando o mecanismo de slot do Astro. O Layout renderiza `<slot name="head" />` após o componente `<SEO />` do `astro-seo`. O problema é que `astro-seo` também pode injetar uma meta tag `robots` dependendo da versão. Se a biblioteca não injeta `robots`, a abordagem funciona. Mas o risco real é diferente: o `<SEO>` no Layout não recebe `noindex` como prop — ele é passado como slot filho depois. Se o `astro-seo` renderizar um `<meta name="robots" content="index, follow">` implicitamente (comportamento de algumas versões), o crawler verá dois `robots` contraditórios e poderá ignorar o `noindex`.

Além disso, o hub não passa `url` para o Layout, então o canonical será `Astro.url.href` — que aponta para a raiz `/`. Isso é correto, mas combinado com o `noindex`, o canonical na raiz é redundante e potencialmente confuso para crawlers.

**Fix:** Passar `robots="noindex"` como prop ao componente SEO em vez de via slot, ou verificar que `astro-seo` na versão utilizada não emite `robots` implicitamente:

```astro
<SEO
  title={title}
  ...
  noindex={!offersUrl}
/>
```

Alternativamente, refatorar o Layout para aceitar uma prop `noindex?: boolean` e condicionalmente adicionar a meta tag no head antes do `astro-seo`.

---

### CR-03: `seo-meta.test.ts` lê `dist/deep-dive-vm/index.html` mas verifica `dist/sitemap-index.xml` na raiz sem garantir que o sitemap inclui a rota `/deep-dive-vm/`

**File:** `tests/seo/seo-meta.test.ts:165-167`

**Issue:** O teste 13 verifica apenas que `dist/sitemap-index.xml` existe — não que o sitemap contém a URL da landing page `https://mentoria.sertaoseracloud.com/deep-dive-vm/`. Após a migração de rota, o plugin `@astrojs/sitemap` deve incluir `/deep-dive-vm/` no sitemap. Se a geração de sitemap falhar silenciosamente (por exemplo, a página com `noindex` na raiz sendo excluída junto com outras rotas), o sitemap pode existir mas estar vazio ou sem a landing page. O teste passa vacuamente.

Mais crítico ainda: o hub em `/` tem `noindex` via slot, mas o `@astrojs/sitemap` do Astro **não lê automaticamente meta tags `robots`** — ele inclui todas as páginas geradas estaticamente, a menos que sejam excluídas explicitamente via `filter` na config. Isso significa `/` **aparecerá no sitemap** apesar do `noindex`, criando inconsistência.

**Fix:** Adicionar um teste que verifica o conteúdo do sitemap:

```ts
it("14. sitemap contém a URL da landing page deep-dive-vm", () => {
  const sitemap = readFileSync(join(DIST_DIR, "sitemap-0.xml"), "utf-8");
  expect(sitemap).toContain("deep-dive-vm");
});

it("15. sitemap NÃO contém a rota raiz (hub com noindex)", () => {
  const sitemap = readFileSync(join(DIST_DIR, "sitemap-0.xml"), "utf-8");
  // A raiz com noindex não deveria estar no sitemap
  const entries = sitemap.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  const rootEntry = entries.find(e => e === "<loc>https://mentoria.sertaoseracloud.com/</loc>");
  expect(rootEntry).toBeUndefined();
});
```

E em `astro.config.mjs`, excluir a rota raiz do sitemap:

```js
sitemap({
  filter: (page) => !page.endsWith("https://mentoria.sertaoseracloud.com/"),
})
```

---

## Warnings

### WR-01: Comentário desatualizado em `accessibility.spec.ts` referencia arquivo incorreto

**File:** `tests/e2e/accessibility.spec.ts:12`

**Issue:** O comentário de documentação diz: `"Note: main#main has tabindex='-1' added in src/pages/index.astro so that activating the skip link..."`. Após a migração, a landing page está em `src/pages/deep-dive-vm/index.astro` — não em `src/pages/index.astro`. O arquivo `src/pages/index.astro` é agora o hub placeholder. O comentário aponta para o arquivo errado, causando confusão para desenvolvedores que tentam localizar o código.

**Fix:**
```ts
// Note: main#main has tabindex="-1" added in src/pages/deep-dive-vm/index.astro so that
// activating the skip link via Enter can programmatically receive focus.
```

---

### WR-02: Configurações LHCI divergentes entre `.lhcirc.json` e `.lighthouserc.json`

**File:** `.lhcirc.json` e `.lighthouserc.json` (ambos)

**Issue:** Os dois arquivos diferem em três dimensões críticas:
- `categories:accessibility`: `"warn"` em `.lhcirc.json` vs `"error"` em `.lighthouserc.json`
- `categories:performance`: ausente em `.lhcirc.json`, presente como `"error"` em `.lighthouserc.json`
- `upload.target`: `"temporary-public-storage"` em `.lhcirc.json` vs `"filesystem"` em `.lighthouserc.json`

Se `.lhcirc.json` é usado em CI (o nome sugere isso — `lhcirc` é o padrão de configuração do LHCI), então o gate de performance **nunca** é aplicado em CI, e falhas de acessibilidade produzem apenas warnings em vez de bloquear o pipeline.

**Fix:** Decidir qual arquivo é canônico para CI e sincronizar os thresholds. Documentar o propósito de cada arquivo com comentários ou remover o duplicado.

---

### WR-03: `motion-accessibility.spec.ts` — teste de WCAG AA exige zero violações (expectativa irrealista)

**File:** `tests/e2e/motion-accessibility.spec.ts:18-21`

**Issue:** O teste `"page has zero WCAG 2.1 AA violations"` usa `expect(results.violations).toEqual([])` — zero violações absolutas. Isso difere da abordagem em `homepage.spec.ts` que filtra apenas `v.impact === "critical"`. A diferença de abordagem entre os dois arquivos cria inconsistência: um teste passa com violações de impacto `serious` ou `moderate`, o outro falha com qualquer violação.

Em ambientes de CI com fontes externas não carregadas (Google Fonts bloqueadas), axe-core frequentemente detecta problemas de contraste de cor como violações WCAG AA — mas esses falsos positivos são causados pela ausência das fontes, não por problemas reais na página. A abordagem de `homepage.spec.ts` (filtrar apenas `critical`) é mais robusta.

**Fix:** Alinhar a estratégia de filtragem com `homepage.spec.ts`:

```ts
const criticalViolations = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
expect(criticalViolations).toHaveLength(0);
```

---

### WR-04: `src/pages/index.astro` — `<main>` não tem skip-link mas tem `tabindex="-1"`

**File:** `src/pages/index.astro:10`

**Issue:** O hub tem `<main id="main" tabindex="-1">` mas nenhum skip link aponta para `#main` na página. O `tabindex="-1"` em `<main>` serve para receber foco programático do skip link — mas sem o skip link, o atributo é um artefato inútil que não causa dano mas indica que a implementação foi copiada da landing page sem revisão. Adicionalmente, o hub não tem skip link algum, o que é uma omissão de acessibilidade (mesmo que a página seja minimal).

**Fix:** Ou adicionar um skip link ao hub:
```astro
<a href="#main" class="skip-link">Pular para o conteúdo</a>
<main id="main" tabindex="-1">
```
Ou remover `tabindex="-1"` do `<main>` do hub se não houver skip link.

---

### WR-05: `Footer.test.ts` — verificação de ano com `new Date().getFullYear()` é frágil em execuções cross-midnight e cross-year

**File:** `tests/unit/components/Footer.test.ts:32-34`

**Issue:** O teste verifica `© ${new Date().getFullYear()}` contra o HTML gerado em build-time. Se o build for executado em 31 de dezembro e os testes em 1 de janeiro, ou vice-versa, o teste falha. Mais relevante: o build estático congela o ano no HTML — se o arquivo `dist/` for reutilizado de um build anterior de outro ano (caches de CI), o teste falha com o ano atual mas o build tem o ano anterior.

**Fix:** Verificar o padrão de ano de forma mais flexível:
```ts
it("contains copyright year in footer disclaimer", () => {
  expect(builtHtml).toMatch(/© 20\d{2}/);
});
```

---

## Info

### IN-01: `src/pages/deep-dive-vm/index.astro` — `offersUrl` hardcoded com fragmento `#investimento` mas Layout cria JSON-LD com URL completa

**File:** `src/pages/deep-dive-vm/index.astro:27`

**Issue:** O valor `offersUrl="https://mentoria.sertaoseracloud.com/deep-dive-vm#investimento"` está hardcoded. A URL não inclui a barra final (`/deep-dive-vm/` vs `/deep-dive-vm`). O canonical da página aponta para `Astro.url.toString()` que, dependendo da configuração do servidor, pode incluir ou não a barra final. Isso cria inconsistência entre o canonical e a URL do JSON-LD offer. Não é um bug bloqueante, mas pode afetar dados estruturados.

**Fix:** Alinhar o formato da URL:
```astro
offersUrl="https://mentoria.sertaoseracloud.com/deep-dive-vm/#investimento"
```

---

### IN-02: `Layout.astro` — comentário inline com `//` dentro de objeto de configuração TSX/JSX

**File:** `src/layouts/Layout.astro:40`

**Issue:** `creator: "@sertaoseracloud", // Ajustado conforme o perfil do mentor` — comentário inline em um objeto Astro. Embora válido em JavaScript/TypeScript, comentários dentro de objetos de configuração passados como props são um anti-padrão de limpeza de código. O valor não requer justificativa inline; o comentário deve ser removido ou movido para documentação do componente.

**Fix:** Remover o comentário:
```astro
twitter={{
  creator: "@sertaoseracloud",
  card: "summary_large_image",
}}
```

---

### IN-03: `tests/e2e/motion-accessibility.spec.ts` — múltiplos `TODO` referenciando "Phase 02" ainda presentes

**File:** `tests/e2e/motion-accessibility.spec.ts:27-29`, `43-46`, `64-67`, `83-85`

**Issue:** Quatro blocos `TODO` ainda referenciam "Phase 02" como fase futura para implementação de funcionalidades (SettingsToggle, CarouselMotion, MobileMenuMotion). Este é agora o Phase 06. Os TODOs estão dentro de blocos `test.skip()` condicionais, portanto não causam falhas, mas indicam débito técnico acumulado e documentação desatualizada.

**Fix:** Atualizar as referências de fase ou remover os TODOs se as funcionalidades foram implementadas em fases anteriores. Se ainda pendentes, trocar "Phase 02" pela fase correta.

---

_Reviewed: 2026-05-17T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
