---
phase: "06"
fixed_at: 2026-05-17T00:00:00Z
review_path: .planning/phases/06-route-migration/06-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 7
skipped: 1
status: partial
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-05-17
**Source review:** `.planning/phases/06-route-migration/06-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01, CR-02, CR-03, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 7
- Skipped: 1 (WR-04)

## Fixed Issues

### CR-01: LHCI configs divergentes

**Files modified:** `.lhcirc.json`
**Commit:** 1df147e
**Applied fix:** `categories:accessibility` alterado de `"warn"` para `"error"`. `categories:performance` adicionado como `["error", { "minScore": 0.8 }]`. Ambos os arquivos LHCI agora têm thresholds idênticos.

### CR-02: noindex via slot pode não funcionar

**Files modified:** `src/layouts/Layout.astro`
**Commit:** e6915ae
**Applied fix:** Adicionada prop `noindex?: boolean` à interface Props do Layout.astro, com default `false`. A prop é passada diretamente para `<SEO noindex={noindex}>` usando a API oficial do astro-seo, eliminando dependência de `slot="head"` que não existe no Layout atual.

### CR-03: seo-meta.test.ts verificação fraca do sitemap

**Files modified:** `tests/seo/seo-meta.test.ts`, `astro.config.mjs`
**Commit:** 0d25b2e
**Applied fix:** `astro.config.mjs` — adicionado `filter` ao plugin sitemap excluindo a URL raiz. `seo-meta.test.ts` — adicionado describe block "Sitemap content assertions" com:
- Teste 14: verifica que `sitemap-0.xml` contém "deep-dive-vm"
- Teste 15: verifica que `sitemap-0.xml` NÃO contém `<loc>https://mentoria.sertaoseracloud.com/</loc>`

### WR-01: Comentário desatualizado em accessibility.spec.ts

**Files modified:** `tests/e2e/accessibility.spec.ts`
**Commit:** 2a4c0c2
**Applied fix:** Comentário na linha 11 atualizado de `src/pages/index.astro` para `src/pages/deep-dive-vm/index.astro` — reflete a estrutura de rotas pós-migração.

### WR-02: LHCI configs divergentes (warning)

Coberto pelo fix de CR-01. Não gerou commit separado.

### WR-03: motion-accessibility.spec.ts filtro de violações

**Files modified:** `tests/e2e/motion-accessibility.spec.ts`
**Commit:** 18dfc62
**Applied fix:** `expect(results.violations).toEqual([])` substituído por filtro explícito de impacto:
```ts
const criticalViolations = results.violations.filter(
  (v) => v.impact === "critical" || v.impact === "serious"
);
expect(criticalViolations).toHaveLength(0);
```

### WR-05: Footer.test.ts verificação de ano frágil

**Files modified:** `tests/unit/components/Footer.test.ts`
**Commit:** de711d2
**Applied fix:** Substituído `new RegExp(\`© ${year}\`)` por `/© 20\d{2}/`. O regex agora é robusto — funciona independente do ano em que o build foi gerado versus o ano em que os testes rodam.

## Skipped Issues

### WR-04: Hub sem skip link mas com tabindex="-1"

**File:** `src/pages/index.astro:71`
**Reason:** skipped: código atual tem skip link presente — tabindex="-1" é correto e necessário

**Original issue:** O finding indicava remover `tabindex="-1"` do `<main>` se não houvesse skip link. No entanto, o `src/pages/index.astro` atual contém `<a href="#main" class="skip-link">Pular para o conteúdo</a>` antes do `<main>`. Portanto `tabindex="-1"` é necessário para que o skip link funcione via Enter (padrão WCAG). Remover seria regressivo para acessibilidade.

---

_Fixed: 2026-05-17_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
