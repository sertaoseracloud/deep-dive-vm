---
phase: 07-hub-page
fixed_at: 2026-05-17T12:45:30Z
review_path: .planning/phases/07-hub-page/07-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 1
skipped: 6
status: partial
---

# Phase 07: Code Review Fix Report

**Fixed at:** 2026-05-17T12:45:30Z
**Source review:** .planning/phases/07-hub-page/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (CR-01, CR-02, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 1
- Skipped: 6

## Fixed Issues

### WR-05: JSON-LD de Course embutido no Layout para todas as páginas

**Files modified:** `src/layouts/Layout.astro`, `src/pages/deep-dive-vm/index.astro`
**Commit:** 75188be
**Applied fix:** Added `jsonLd?: Record<string, unknown>` prop to Layout.astro's Props interface and destructuring. Replaced the hardcoded Azure VM JSON-LD block (`{offersUrl && <script ...>}`) with `{jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}`. Moved the full Course JSON-LD object (with all Azure VM-specific fields) into `src/pages/deep-dive-vm/index.astro` as the `jsonLd` prop value, with the `offersUrl` string inlined directly. Layout no longer emits any course-specific structured data on its own — each page controls its own JSON-LD.

## Skipped Issues

### CR-01: URL do WhatsApp com placeholder em produção

**File:** `src/data/social-links.ts:25`
**Reason:** skipped: code context differs from review — already resolved before this fix run. The WhatsApp entry is already commented out with a proper NOTE comment and a build-time guard (`throw new Error` if any `url.includes('PLACEHOLDER')`). No placeholder reaches production.
**Original issue:** A URL do link WhatsApp era `https://wa.me/PLACEHOLDER`, direcionando visitantes para número inválido.

---

### CR-02: Teste SEO passa vacuamente quando `dist/index.html` não existe

**File:** `tests/seo/seo-meta.test.ts:23-30`
**Reason:** skipped: code context differs from review — already resolved before this fix run. Tests 14 and 15 already use `expect(existsSync(sitemapPath), '...message...').toBe(true)` pattern as prescribed by the fix.
**Original issue:** Tests 14 e 15 usavam `if (!existsSync(...)) return;` passando silenciosamente.

---

### WR-01: `ariaLabel` desnecessária no SocialIcon

**File:** `src/components/ui/SocialIcon.astro:22-23` e `src/pages/index.astro:43`
**Reason:** skipped: code context differs from review — already resolved before this fix run. `SocialIcon.astro` Props interface only declares `name`, no `ariaLabel`. The call site in `index.astro` line 43 already reads `<SocialIcon name={link.icon} />` without any `ariaLabel` attribute.
**Original issue:** Prop `ariaLabel` declarada mas nunca usada no template SVG.

---

### WR-02: `cursor: pointer` em `div.course-card` sem interatividade

**File:** `src/pages/index.astro:179`
**Reason:** skipped: code context differs from review — already resolved before this fix run. The `.course-card` CSS block does not contain `cursor: pointer`; only `.course-card.coming-soon` sets `cursor: default`.
**Original issue:** `.course-card` definia `cursor: pointer` sem elemento interativo no nível do card.

---

### WR-03: `Layout.test.ts` falha sem mensagem útil quando `dist/` não existe

**File:** `tests/unit/components/Layout.test.ts:12-15`
**Reason:** skipped: code context differs from review — already resolved before this fix run. The `beforeAll` already checks `!existsSync(dvmPath) || !existsSync(hubPath)` and throws a descriptive error matching the prescribed fix.
**Original issue:** `readFileSync` sem `existsSync` lançava ENOENT críptico.

---

### WR-04: Descrição padrão do Layout hardcodada para Azure VM

**File:** `src/layouts/Layout.astro:20`
**Reason:** skipped: code context differs from review — already resolved before this fix run. Line 20 already reads `const resolvedDescription = description ?? "Formação técnica de alto impacto em cloud. Aprenda com Cláudio Raposo, Microsoft MVP.";` — the generic fallback prescribed by the fix.
**Original issue:** Fallback era `"Formação técnica focada em Azure VMs com Microsoft MVP."`.

---

## Test Results

After applying WR-05 fix, `npm run test:unit` was run:

- **13 test files passed**
- **111 tests passed, 0 failed**
- All Layout tests (including JSON-LD assertions via `dist/` files) continued passing, confirming the refactored `jsonLd` prop produces identical output to the previous hardcoded approach.

---

_Fixed: 2026-05-17T12:45:30Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
