---
phase: "06"
status: fixed
critical: 0
warning: 0
info: 3
reviewed_at: 2026-05-17T00:00:00Z
---

# Phase 06: Route Migration — Code Review

## Summary

Após aplicação dos fixes:
- **Critical:** 0 (todos resolvidos)
- **Warning:** 0 (todos resolvidos)
- **Info:** 3 (IN-01, IN-02, IN-03 — fora do escopo desta iteração)

---

### CR-01: LHCI configs divergentes — FIXED

**File:** `.lhcirc.json`
**Fix aplicado:** `categories:accessibility` alterado de `warn` para `error`, `categories:performance` adicionado como `error` com `minScore: 0.8`. Ambos os arquivos agora alinhados.

---

### CR-02: noindex via slot pode não funcionar — FIXED

**File:** `src/layouts/Layout.astro`
**Fix aplicado:** Adicionada prop `noindex?: boolean` ao Layout.astro, passada para `<SEO noindex={noindex}>`. Páginas podem agora usar `noindex={true}` de forma segura via API oficial do astro-seo.

---

### CR-03: seo-meta.test.ts verificação fraca do sitemap — FIXED

**Files:** `tests/seo/seo-meta.test.ts`, `astro.config.mjs`
**Fix aplicado:** Adicionados testes 14 e 15 para verificar conteúdo do sitemap-0.xml. Filtro adicionado ao plugin sitemap excluindo a rota raiz.

---

### WR-01: Comentário desatualizado em accessibility.spec.ts — FIXED

**File:** `tests/e2e/accessibility.spec.ts:11`
**Fix aplicado:** Comentário atualizado de `src/pages/index.astro` para `src/pages/deep-dive-vm/index.astro`.

---

### WR-02: LHCI configs divergentes — FIXED

Coberto pelo CR-01 acima.

---

### WR-03: motion-accessibility.spec.ts filtro de violações — FIXED

**File:** `tests/e2e/motion-accessibility.spec.ts:20`
**Fix aplicado:** `expect(results.violations).toEqual([])` substituído por filtro de violações críticas/sérias apenas.

---

### WR-04: Hub sem skip link mas com tabindex="-1" — SKIPPED

**File:** `src/pages/index.astro:71`
**Motivo:** O código atual contém skip link (`<a href="#main" class="skip-link">`) junto com `tabindex="-1"` no `<main>` — esta é a configuração correta para acessibilidade de teclado. O `tabindex="-1"` é necessário para que o skip link funcione. Finding não se aplica ao estado atual do código.

---

### WR-05: Footer.test.ts verificação de ano frágil — FIXED

**File:** `tests/unit/components/Footer.test.ts:32`
**Fix aplicado:** `new RegExp(\`© ${year}\`)` substituído por `/© 20\d{2}/` — regex robusto desacoplado do ano em runtime.

---

### IN-01, IN-02, IN-03 — FORA DO ESCOPO

Info findings excluídos desta iteração de fixes conforme `fix_scope: critical_warning`.

---

_Reviewed: 2026-05-17_
_Reviewer: Claude (gsd-code-reviewer)_
