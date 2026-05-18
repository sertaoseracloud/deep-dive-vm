---
phase: 09-python-neurodivergentes
reviewed: 2026-05-17T00:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - src/data/python-course.ts
  - src/data/courses.ts
  - src/components/layout/UrgencyBar.astro
  - src/components/layout/StickyCta.astro
  - src/pages/deep-dive-vm/index.astro
  - src/components/sections/FinalCTA.astro
  - src/pages/deep-dive-python-neurodivergentes/index.astro
  - src/components/sections/Pricing.astro
  - src/components/sections/Hero.astro
  - src/components/sections/TrustBand.astro
  - src/components/sections/PainPoints.astro
  - src/components/sections/Method.astro
  - src/components/sections/Curriculum.astro
  - src/components/sections/Mentor.astro
  - src/components/sections/ForWho.astro
  - src/components/sections/Bonuses.astro
  - src/components/sections/Faq.astro
  - src/components/ui/ModuleDetails.astro
  - tests/e2e/python-lp.spec.ts
  - tests/e2e/hub.spec.ts
  - tests/seo/seo-meta.test.ts
findings:
  critical: 2
  warning: 6
  info: 4
  total: 12
status: issues_found
---

# Phase 09: Code Review Report

**Revisado:** 2026-05-17T00:00:00Z
**Profundidade:** standard
**Arquivos revisados:** 21
**Status:** issues_found

## Resumo

Esta fase refatorou 11 componentes de seção para props-driven e introduziu uma nova landing page `/deep-dive-python-neurodivergentes/`. A arquitetura geral está correta: os componentes aceitam props tipadas, os dados são isolados por curso, e o roteamento estático do Astro está adequado.

Foram identificados dois problemas críticos: (1) a URL de compra do curso Python está com placeholder publicável em produção — qualquer visitante que clique no CTA principal será enviado para a raiz do Hotmart sem produto vinculado, perdendo a venda; (2) há dados biográficos inconsistentes entre as duas LPs — a LP Python afirma "10× MVP" e "2× MVP" simultaneamente nos portlets do herói vs. a LP VM, quando a fonte canônica (hub e VM) usa "2× MVP". Adicionalmente foram encontrados seis problemas de Warning e quatro informativos.

---

## Critical Issues

### CR-01: URL de compra do Python é placeholder — CTA envia usuário para raiz do Hotmart

**File:** `src/data/python-course.ts:2`

**Issue:** O campo `hotmartUrl` contém `"https://pay.hotmart.com/"` com comentário explícito `// placeholder — substitua pela URL real antes do deploy`. Este valor é consumido diretamente pelo componente `Pricing` da LP Python como `ctaHref` (linha 260 de `index.astro`). Qualquer visitante que clicar em "Quero começar agora" será redirecionado para a página raiz do Hotmart — sem produto associado, sem possibilidade de compra. A LP está em `status: 'active'` no `courses.ts` (linha 27), portanto acessível publicamente.

**Fix:**
```ts
// src/data/python-course.ts
export const PYTHON_COURSE = {
  hotmartUrl: "https://pay.hotmart.com/SEU_PRODUTO_REAL_AQUI",
  route: "/deep-dive-python-neurodivergentes/",
  ogImage: "/python-neurodivergentes-og.png",
} as const;
```
Antes do deploy: substituir o placeholder pela URL real do produto no Hotmart. Como medida de segurança imediata, defina `status: 'coming-soon'` em `courses.ts` linha 27 até que a URL seja configurada, ou adicione validação de build que falhe se `hotmartUrl` terminar com barra sozinha.

---

### CR-02: Dado biográfico conflitante — "10× MVP" vs "2× MVP" para o mesmo mentor

**File:** `src/pages/deep-dive-python-neurodivergentes/index.astro:91` e `:202`

**Issue:** A LP Python declara `{ label: "⟡ 10× MVP · MICROSOFT" }` (linha 91, badge do retrato) e `tagline: "⟡ SYSTEMS ARCHITECT · 10× MVP · 7× AWS · NEURODIVERGENTE"` (linha 202, seção Mentor). A LP VM usa `"⟡ 2× MVP · MICROSOFT"` (linha 90) e `"⟡ SYSTEMS ARCHITECT · 2× MVP · DOCKER CAPTAIN · GREEN SW CHAMPION"` (linha 201). A página hub (`src/pages/index.astro`) também usa "2× MVP Microsoft". Uma das duas LPs contém dado factualmente errado. Credenciais falsas de professor em landing page de produto constituem informação enganosa ao consumidor.

**Fix:** Alinhar todas as páginas para o valor correto do mentor. Se a contagem correta é 2×, corrigir `index.astro` da LP Python:
```astro
// linha 91
{ label: "⟡ 2× MVP · MICROSOFT" },

// linha 202 (tagline)
tagline: "⟡ SYSTEMS ARCHITECT · 2× MVP · 7× AWS · NEURODIVERGENTE",
```
Se a contagem correta é 10×, corrigir as demais páginas para consistência. Criar uma constante compartilhada em `src/data/` para eliminar divergências futuras.

---

## Warnings

### WR-01: `TrustBand.astro` — `.replace()` substitui apenas a primeira ocorrência do `\n`

**File:** `src/components/sections/TrustBand.astro:12`

**Issue:** `label.replace('\n', '<br />')` usa `String.prototype.replace` com uma string literal como padrão, que por especificação do JavaScript substitui **apenas a primeira** ocorrência. Se o `label` contiver mais de um `\n` (improvável agora, mas possível com conteúdo futuro), as quebras de linha subsequentes serão ignoradas silenciosamente.

**Fix:**
```ts
// Trocar replace por replaceAll, ou usar regex global:
<div class="trust-label" set:html={label.replace(/\n/g, '<br />')} />
```

---

### WR-02: `StickyCta.astro` — `priceLabel` renderizado com `set:html` sem sanitização, inconsistência entre LPs

**File:** `src/components/layout/StickyCta.astro:14` e `src/pages/deep-dive-python-neurodivergentes/index.astro:285`

**Issue:** O componente usa `<Fragment set:html={priceLabel} />` para aceitar HTML arbitrário como prop. Na LP VM (linha 295 de `deep-dive-vm/index.astro`) o valor passado inclui tags HTML: `"DESDE <b>12× R$ 78,92</b>"`. Na LP Python (linha 285) o valor é texto puro sem tags: `"DESDE 12× R$ 78,92"`. A inconsistência indica que o autor da LP Python não percebeu que `set:html` é esperado — a LP Python ficará com formatação visual diferente (sem o negrito no preço) sem qualquer erro de build ou runtime.

**Fix:** Padronizar o valor passado na LP Python para incluir a marcação esperada:
```astro
<StickyCta
  priceLabel="DESDE <b>12× R$ 78,92</b>"
  ctaHref="#investimento"
  ctaText="Quero começar →"
/>
```
A longo prazo, considerar dividir a prop em `priceLead: string` e `priceHighlight: string` para forçar a estrutura via tipos TypeScript em vez de HTML embutido.

---

### WR-03: `seo-meta.test.ts` — IDs de teste duplicados causam confusão de diagnóstico e podem mascarar falhas

**File:** `tests/seo/seo-meta.test.ts:169` e `:221`

**Issue:** Os dois `describe` blocks definem testes com os mesmos rótulos numéricos: `"14. sitemap-0.xml contains root / and /deep-dive-vm/"` (linha 169) e `"14. sitemap-0.xml contains the deep-dive-vm URL"` (linha 221); similarmente `"15. dist/index.html og:image points to hub-og.png"` (linha 177) e `"15. sitemap-0.xml does NOT contain the hub root URL"` (linha 231). Quando qualquer um falhar, o log do Vitest mostrará "Test 14 failed" sem clareza sobre qual dos dois blocos falhou, comprometendo o diagnóstico em CI.

**Fix:** Renumerar os testes do segundo `describe` block para continuar a sequência:
```ts
// describe("Sitemap content assertions...") — renumerar a partir de 19
it("19. sitemap-0.xml contains the deep-dive-vm URL", () => { ... });
it("20. sitemap-0.xml does NOT contain the hub root URL...", () => { ... });
```

---

### WR-04: `seo-meta.test.ts` — Teste 14 valida conteúdo contraditório em asserções separadas

**File:** `tests/seo/seo-meta.test.ts:169-175` e `:231-240`

**Issue:** O teste 14 no primeiro `describe` (linha 173-174) afirma que `sitemap-0.xml` **deve** conter `https://mentoria.sertaoseracloud.com/`. O teste 15 no segundo `describe` (linha 239) afirma que o sitemap **não deve** conter `/<loc>https:\/\/mentoria\.sertaoseracloud\.com\/<\/loc>/`. Os dois testes não são logicamente contraditórios (um usa `.toContain` que é substring, o outro usa regex com `<loc>` exato), mas esta ambiguidade é frágil: se o sitemap incluir a URL raiz com `<loc>`, o segundo teste falhará enquanto o primeiro ainda passa. A intenção — que a raiz não seja indexável — seria validada de forma incompleta.

**Fix:** Substituir a asserção do teste 14 para ser mais precisa:
```ts
it("14. sitemap-0.xml contains root / and /deep-dive-vm/", () => {
  // Apenas verificar a URL do VM, sem exigir a URL raiz
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/deep-dive-vm/");
});
```
Isso elimina a contradição e alinha com a intenção de SEO de não indexar a raiz.

---

### WR-05: `Mentor.astro` — SectionHead recebe `titleHtml` mas a prop espera texto simples

**File:** `src/components/sections/Mentor.astro:40` e `:72`

**Issue:** O componente usa `<SectionHead titleHtml={primary.name} />` (linha 40) e `<SectionHead titleHtml={guest.name} />` (linha 72), mas `name` é tipado como `string` em `MentorInfo` (linha 13). Se o `SectionHead` renderizar `titleHtml` com `set:html`, ele aceita HTML, mas a prop de `Mentor` não garante HTML válido — é esperado texto plano com possível apostrofe ou caractere especial como `Cláudio Filipe Lima Raposo` (acento). Como texto plano, isso é seguro; mas a prop se chama `titleHtml`, sugerindo que se espera HTML, gerando confusão para futuros colaboradores que podem passar strings não-escapadas.

**Fix:** Renomear `name` para `nameHtml` em `MentorInfo` e documentar a expectativa, ou verificar que `SectionHead` usa `{title}` em vez de `set:html` para o campo nome — e então usar a prop correta:
```ts
// Se SectionHead tem prop `title` (texto puro) além de `titleHtml`:
<SectionHead eyebrow={primary.eyebrow} title={primary.name} />
```

---

### WR-06: `deep-dive-python-neurodivergentes/index.astro` — `url` canônica hardcoded em vez de usar `Astro.url`

**File:** `src/pages/deep-dive-python-neurodivergentes/index.astro:30`

**Issue:** A LP Python passa `url="https://mentoria.sertaoseracloud.com/deep-dive-python-neurodivergentes/"` como string literal hardcoded. A LP VM (linha 30 de `deep-dive-vm/index.astro`) usa corretamente `url={Astro.url.toString()}`. Se o domínio mudar (ex.: staging, preview URL), a URL canônica da LP Python ficará errada enquanto a LP VM se adaptará automaticamente. Além disso, a URL canônica hardcoded não refletirá o `site` configurado em `astro.config.mjs` se este mudar.

**Fix:**
```astro
<Layout
  ...
  url={Astro.url.toString()}
  ...
>
```

---

## Info

### IN-01: `python-course.ts` — Comentário TODO em arquivo de dados exportado indica código incompleto

**File:** `src/data/python-course.ts:2`

**Issue:** O comentário `// placeholder — substitua pela URL real antes do deploy` está em arquivo de dados que é importado em produção. É um TODO não rastreável por ferramentas de linting padrão.

**Fix:** Além de substituir o valor (ver CR-01), remover o comentário do arquivo final ou converter em erro de build via assertion:
```ts
const hotmartUrl = "https://pay.hotmart.com/SEU_PRODUTO_AQUI";
if (import.meta.env.PROD && hotmartUrl.endsWith("hotmart.com/")) {
  throw new Error("PYTHON_COURSE.hotmartUrl não foi configurado antes do build de produção.");
}
```

---

### IN-02: `ModuleDetails.astro` — CSS global (`:global(.track)`) vaza para escopo da página inteira

**File:** `src/components/sections/Curriculum.astro:98-133`

**Issue:** As regras `:global(.track)`, `:global(.track .head)` e `:global(.track p)` em `Curriculum.astro` aplicam estilos para qualquer elemento com a classe `track` em qualquer parte do documento. Se outro componente usar essa classe, os estilos serão aplicados indevidamente. `ModuleDetails.astro` também define `:global(.track .head svg)` (linha 157) com o mesmo vetor de leak.

**Fix:** Usar seletores escopados dentro de `.module-tracks` (que já existe em `ModuleDetails.astro`) em vez de `:global`. Exemplo em `ModuleDetails.astro`:
```css
/* Trocar :global(.track) por seletor escopado */
.module-tracks .track { ... }
.module-tracks .track .head { ... }
.module-tracks .track p { ... }
```

---

### IN-03: `Curriculum.astro` — Hardcoded `grid-template-columns: repeat(5, 1fr)` em `ModuleDetails` pressupõe sempre 5 frentes

**File:** `src/components/ui/ModuleDetails.astro:131`

**Issue:** O layout `.module-tracks` usa `grid-template-columns: repeat(5, 1fr)` fixo. O número de frentes é controlado pelo dado passado como `tracks[]`, mas o CSS não se adapta automaticamente. Se um módulo futuro tiver 3 ou 4 tracks, o grid renderizará células vazias visíveis (buracos no layout). Ambas as LPs atuais sempre passam 5 tracks, portanto não é um bug ativo — mas é uma armadilha para conteúdo futuro.

**Fix:** Usar `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))` para layout adaptativo, ou passar o número de frentes como prop e usar CSS inline `style={`grid-template-columns: repeat(${tracks.length}, 1fr)`}`.

---

### IN-04: `seo-meta.test.ts` — SEO test suite só valida `/deep-dive-vm/index.html` mas não `/deep-dive-python-neurodivergentes/index.html` para as meta-tags principais

**File:** `tests/seo/seo-meta.test.ts:18-29` (primeiro `describe`)

**Issue:** O `beforeAll` do primeiro `describe` block carrega apenas `dist/deep-dive-vm/index.html` (linha 18: `DIST_INDEX`). Os testes 1-12 (title, description, og:title, og:description, og:image, h1, canonical, alt, JSON-LD, headings) validam exclusivamente a LP VM. A nova LP Python tem apenas a asserção do `og:image` (teste 17) em uma checagem isolada. Erros como título acima de 60 caracteres ou descrição faltante na LP Python passariam despercebidos.

**Fix:** Extrair os helpers de asserção SEO em uma função utilitária e rodar o mesmo conjunto de testes contra ambas as páginas:
```ts
const PAGES = [
  { label: "VM", path: "deep-dive-vm/index.html" },
  { label: "Python", path: "deep-dive-python-neurodivergentes/index.html" },
];

for (const page of PAGES) {
  describe(`SEO meta-tag assertions (${page.label})`, () => {
    // reutilizar os mesmos it() blocks
  });
}
```

---

_Revisado: 2026-05-17T00:00:00Z_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidade: standard_
