---
phase: 07-hub-page
reviewed: 2026-05-17T03:45:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/components/ui/SocialIcon.astro
  - src/data/courses.ts
  - src/data/social-links.ts
  - src/layouts/Layout.astro
  - src/pages/index.astro
  - tests/e2e/hub.spec.ts
  - tests/seo/seo-meta.test.ts
  - tests/unit/components/Layout.test.ts
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 07: Code Review Report — Hub Page

**Reviewed:** 2026-05-17T03:45:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Esta fase implementa a página hub (index raiz) com perfil do mentor, ícones sociais e listagem de cursos, além de ajustes no `Layout.astro` para suportar a prop `ogImage`. O código fonte está bem estruturado e os testes cobrem os casos principais. Foram identificados **2 bloqueadores** (dados incorretos publicados em produção e teste que passa vacuamente), **5 avisos** (acessibilidade, segurança, robustez de teste e qualidade de CSS) e **3 itens informativos**.

---

## Critical Issues

### CR-01: URL do WhatsApp com placeholder em produção

**File:** `src/data/social-links.ts:25`
**Issue:** A URL do link WhatsApp é `https://wa.me/PLACEHOLDER`. Esse valor literal chega ao HTML renderizado e qualquer visitante que clicar no ícone do WhatsApp será direcionado para `https://wa.me/PLACEHOLDER`, resultando em erro de API do WhatsApp (número inválido). Não se trata de um TODO comentado — é um dado ativo em um array exportado diretamente para produção.
**Fix:** Substituir pelo número real do mentor em formato E.164 (sem `+`):
```ts
url: 'https://wa.me/5511999999999',
```
Ou, enquanto o número definitivo não estiver disponível, remover o item do array e não renderizar o link até a informação estar correta.

---

### CR-02: Teste SEO passa vacuamente quando `dist/index.html` não existe

**File:** `tests/seo/seo-meta.test.ts:23-30`
**Issue:** O `beforeAll` lança um `Error` se `DIST_INDEX` (`dist/deep-dive-vm/index.html`) não existir. Correto. Porém, o teste 15 (linha 177) e o teste 14 (linha 171) usam `if (!existsSync(...)) return;` — retornam silenciosamente sem falhar se os arquivos não existirem. O teste 15, especificamente, verifica `dist/index.html` (arquivo diferente de `DIST_INDEX`). Se esse arquivo não for gerado pelo build, o teste 15 passa sem qualquer asserção real, dando falsa confiança sobre a presença do `hub-og.png` no OG da hub page. O teste 14 tem o mesmo problema para `sitemap-0.xml`.
**Fix:** Substituir o guard silencioso por uma falha explícita:
```ts
// Teste 14
it("14. sitemap-0.xml contains root / and /deep-dive-vm/", () => {
  const sitemapPath = join(DIST_DIR, "sitemap-0.xml");
  expect(existsSync(sitemapPath), `sitemap-0.xml not found at ${sitemapPath}`).toBe(true);
  const sitemap = readFileSync(sitemapPath, "utf-8");
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/");
  expect(sitemap).toContain("https://mentoria.sertaoseracloud.com/deep-dive-vm/");
});

// Teste 15
it("15. dist/index.html og:image points to hub-og.png", () => {
  const hubIndexPath = join(DIST_DIR, "index.html");
  expect(existsSync(hubIndexPath), `dist/index.html not found at ${hubIndexPath}`).toBe(true);
  const hubHtml = readFileSync(hubIndexPath, "utf-8");
  const ogImage = extractMetaContent(hubHtml, "og:image");
  expect(ogImage).toBeTruthy();
  expect(ogImage).toContain("hub-og.png");
});
```

---

## Warnings

### WR-01: `aria-hidden="true"` no SVG — duplicação de `ariaLabel` desnecessária e confusa

**File:** `src/components/ui/SocialIcon.astro:22-23` e `src/pages/index.astro:43`
**Issue:** O `<svg>` em `SocialIcon.astro` recebe `aria-hidden="true"`, o que é correto (o link pai já carrega o `aria-label`). Porém, o componente expõe a prop `ariaLabel` e a recebe no frontmatter (`const { name, ariaLabel } = Astro.props`), mas **não usa `ariaLabel` em nenhum lugar do template**. A prop é declarada na interface, extraída via desestruturação e então completamente ignorada. Isso gera confusão: futuros mantenedores podem pensar que o SVG está acessível pelo `ariaLabel` quando na verdade ele está totalmente oculto para leitores de tela. Pior: a prop `ariaLabel` é passada redundantemente pelo `index.astro` na linha 43, duplicando o dado que já está no `aria-label` do `<a>` pai.
**Fix:** Remover a prop `ariaLabel` de `SocialIcon.astro` inteiramente (tanto da interface quanto da desestruturação), e remover o atributo da chamada em `index.astro`:
```astro
<!-- SocialIcon.astro -->
interface Props {
  name: 'instagram' | 'youtube' | 'whatsapp' | 'linkedin';
}
const { name } = Astro.props;
```
```astro
<!-- index.astro linha 43 -->
<SocialIcon name={link.icon} />
```

---

### WR-02: `cursor: pointer` em `div.course-card` sem interatividade para teclado

**File:** `src/pages/index.astro:179`
**Issue:** O estilo `.course-card` define `cursor: pointer`, implicando ao usuário que o elemento é clicável. No entanto, o `<div class="course-card">` não é interativo: não possui `role`, `tabindex`, `onclick` ou link envolvente. Para o card `coming-soon`, o `cursor` é sobrescrito para `default` (linha 190), mas o card `active` mantém `cursor: pointer` sem que haja um elemento interativo no nível do card — apenas um `<a class="course-link">` interno. Isso é enganoso para usuários de mouse e representa uma inconsistência semântica.
**Fix:** Remover `cursor: pointer` de `.course-card` e deixar apenas o `<a class="course-link">` sinalizar interatividade, ou transformar o card inteiro em um link:
```css
.course-card {
  /* remover: cursor: pointer; */
  background: rgba(27, 41, 60, 0.6);
  ...
}
```

---

### WR-03: `Layout.test.ts` falha sem mensagem de erro útil quando `dist/` não existe

**File:** `tests/unit/components/Layout.test.ts:12-15`
**Issue:** O `beforeAll` lê `dist/deep-dive-vm/index.html` e `dist/index.html` com `readFileSync` sem checar existência. Se o build não foi executado, o `readFileSync` lança um `ENOENT` Node.js com stack trace críptico, sem indicar ao desenvolvedor que a correção é rodar `npm run build`. O arquivo `seo-meta.test.ts` resolveu isso corretamente com `existsSync` + mensagem customizada; `Layout.test.ts` não seguiu o mesmo padrão.
**Fix:** Usar o mesmo padrão do `seo-meta.test.ts`:
```ts
beforeAll(() => {
  const dvmPath = join(PROJECT_ROOT, "dist/deep-dive-vm/index.html");
  const hubPath = join(PROJECT_ROOT, "dist/index.html");
  if (!existsSync(dvmPath) || !existsSync(hubPath)) {
    throw new Error(
      `dist/ files not found. Run 'npm run build' before running Layout tests.\nExpected: ${dvmPath}`
    );
  }
  builtHtml = readFileSync(dvmPath, "utf-8");
  hubHtml = readFileSync(hubPath, "utf-8");
});
```

---

### WR-04: Descrição padrão do Layout hardcodada para Azure VM — incorreta na hub page

**File:** `src/layouts/Layout.astro:20`
**Issue:** O fallback de `description` é `"Formação técnica focada em Azure VMs com Microsoft MVP."`. A hub page (`index.astro`) passa sua própria `description`, então esse fallback não é ativado nessa rota. Porém, qualquer página futura que use `<Layout>` sem `description` — como páginas de erro, páginas de confirmação, ou novas rotas de outros cursos — herdará uma descrição específica de Azure VM, o que é semanticamente incorreto. O fallback deve ser genérico.
**Fix:**
```ts
const resolvedDescription = description ?? "Formação técnica de alto impacto em cloud. Aprenda com Cláudio Raposo, Microsoft MVP.";
```

---

### WR-05: JSON-LD de Course embutido no Layout para todas as páginas

**File:** `src/layouts/Layout.astro:92-124`
**Issue:** O bloco JSON-LD com `@type: "Course"` é emitido condicionalmente quando `offersUrl` é fornecido. O conteúdo do JSON-LD está hardcodado com dados específicos do curso "Deep Dive Azure VM" (nome, descrição, preço R$947, `courseCode: "AZ-VM-DEEP-DIVE"`, duração 54h). Quando o segundo curso (`deep-dive-ec2`) for ativado e usar o mesmo `<Layout offersUrl=...>`, o JSON-LD incorreto do Azure VM será emitido para a página do EC2, contaminando os dados estruturados com informações erradas. Isso afeta diretamente como mecanismos de busca indexam o curso EC2.
**Fix:** Extrair o JSON-LD para uma prop tipada ou um slot, em vez de hardcodar no Layout:
```astro
interface Props {
  ...
  jsonLd?: Record<string, unknown>; // caller fornece o objeto completo
}
```
E no template: `{jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}`

---

## Info

### IN-01: Comentário inline de código (`// Ajustado conforme o perfil do mentor`)

**File:** `src/layouts/Layout.astro:45`
**Issue:** Comentário de processo interno exposto no código-fonte de produção. Não causa bug, mas é ruído desnecessário.
**Fix:** Remover o comentário: `twitter={{ creator: "@sertaoseracloud", card: "summary_large_image" }}`

---

### IN-02: `hub.spec.ts` — teste de overflow avalia `scrollWidth` antes do layout estabilizar

**File:** `tests/e2e/hub.spec.ts:99-103`
**Issue:** O `page.evaluate` que mede `document.documentElement.scrollWidth > window.innerWidth` é executado logo após `page.goto`. Dependendo do comportamento de carregamento de fontes e imagens, o layout pode não estar completamente estabilizado, tornando o teste potencialmente instável em ambientes lentos. O teste não usa `waitForLoadState('networkidle')` nem `waitForSelector` antes da medição.
**Fix:** Aguardar o estado de rede antes de medir:
```ts
await page.goto("./");
await page.waitForLoadState("networkidle");
const hasOverflow = await page.evaluate(...);
```

---

### IN-03: `SocialIcon` — tipo `SocialIcon` duplicado entre `social-links.ts` e a interface do componente

**File:** `src/data/social-links.ts:1` e `src/components/ui/SocialIcon.astro:3`
**Issue:** O tipo `SocialIcon` (union de strings de rede social) é definido duas vezes de forma idêntica: uma vez em `social-links.ts` como `export type SocialIcon` e outra vez implicitamente na interface `Props` de `SocialIcon.astro`. O campo `icon: SocialIcon` em `SocialLink` e o campo `name` de `Props` são do mesmo tipo mas não compartilham a definição. Se uma rede social for adicionada em `social-links.ts`, o `Props` de `SocialIcon.astro` precisará ser atualizado manualmente (e vice-versa), e o compilador não vai alertar sobre a inconsistência entre os dois lugares.
**Fix:** Importar o tipo de `social-links.ts` no componente:
```astro
---
import type { SocialIcon as SocialIconName } from '../../data/social-links';
interface Props {
  name: SocialIconName;
}
```

---

_Reviewed: 2026-05-17T03:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
