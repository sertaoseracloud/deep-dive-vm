---
phase: 7
slug: hub-page
status: compliant
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-17
audited: 2026-05-17
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 (unit) + Playwright (E2E) + LHCI (Lighthouse) |
| **Config file** | `vitest.config.ts` / `playwright.config.ts` / `.lhcirc.json` |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run build && npm run test:all` |
| **Estimated runtime** | ~60 seconds (build ~5s + unit ~10s + E2E ~45s) |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:unit`
- **After every plan wave:** Run `npm run build && npm run test:all`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| T1: Layout.astro ogImage/noindex | 07-01 | 1 | HUB-04 | T-07-02 | ogImage usa assets do servidor, não input do usuário | source + build | `node -e "const s=require('fs').readFileSync('src/layouts/Layout.astro','utf-8'); if(!s.includes('ogImage?:')) throw new Error(); console.log('OK')"` | `src/layouts/Layout.astro` | ✓ |
| T2: data files (social-links, courses) | 07-01 | 1 | HUB-02, HUB-03 | — | URLs de redes sociais são strings hardcoded, não interpoladas de input externo | source | `node -e "const {socialLinks}=require('./src/data/social-links'); const {courses}=require('./src/data/courses'); console.log('OK', socialLinks.length, courses.length)"` | `src/data/social-links.ts`, `src/data/courses.ts` | ✓ |
| T3: SocialIcon.astro | 07-01 | 1 | HUB-03 | — | SVG inline sem script, sem eventos dinamicos | source | `node -e "const s=require('fs').readFileSync('src/components/ui/SocialIcon.astro','utf-8'); if(s.includes('<script')) throw new Error('script encontrado'); console.log('OK')"` | `src/components/ui/SocialIcon.astro` | ✓ |
| T4: hub-og.png placeholder | 07-01 | 1 | HUB-04 | — | Asset estático servido de public/ | source | `node -e "const {statSync}=require('fs'); const s=statSync('public/hub-og.png'); console.log('OK', s.size, 'bytes')"` | `public/hub-og.png` | ✓ |
| T1: Rewrite index.astro hub | 07-02 | 2 | HUB-01, HUB-02, HUB-03, HUB-04 | T-07-01, T-07-03 | Hub não renderiza conteúdo baseado em query params ou cookies | build + source | `npm run build && node -e "const s=require('fs').readFileSync('dist/index.html','utf-8'); if(s.includes('noindex')) throw new Error('noindex presente'); if(!s.includes('hub-og.png')) throw new Error('og:image ausente'); console.log('OK')"` | `src/pages/index.astro` | ✓ |
| T1: Layout.test.ts additions | 07-03 | 3 | HUB-04 | — | Testes unitários verificam og:image no HTML construído | unit test | `npm run test:unit` | `tests/unit/components/Layout.test.ts` | ✓ |
| T2: seo-meta.test.ts additions | 07-03 | 3 | HUB-04 | — | Sitemap inclui URL raiz; hub-og.png no og:image do hub | unit test | `npm run test:unit` | `tests/seo/seo-meta.test.ts` | ✓ |
| T3: hub.spec.ts creation | 07-03 | 3 | HUB-01, HUB-02, HUB-03 | — | E2E verifica photo, h1, course cards, social links no hub | e2e test | `npx playwright test tests/e2e/hub.spec.ts` | `tests/e2e/hub.spec.ts` | ✓ |

---

## Threat Model Coverage

| Threat ID | Threat | Mitigated By |
|-----------|--------|-------------|
| T-07-01 | Hub renderiza HTML não sanitizado de data files | Dados em `src/data/*.ts` são TypeScript hardcoded — zero input externo |
| T-07-02 | ogImage URL aponta para recurso externo / CSS injection via prop | `ogImage` aceita apenas string literal `/hub-og.png` da page — sem interpolação de params |
| T-07-03 | Course card "coming soon" para /deep-dive-ec2/ que não existe → 404 link | Card coming-soon não é um `<a>` clicável — renderizado como div, não link |

---

## Wave Checkpoints

### Wave 1 (Plan 07-01) Complete When:
- `src/layouts/Layout.astro` aceita `ogImage?: string` e `noindex?: boolean`
- `src/data/social-links.ts` existe com 4 entradas (Instagram, YouTube, WhatsApp PLACEHOLDER, LinkedIn)
- `src/data/courses.ts` existe com 2 entradas (active + coming-soon)
- `src/components/ui/SocialIcon.astro` existe com 4 SVG paths inline
- `public/hub-og.png` existe com dimensões 1200×630px
- `npm run build` exit 0 (sem quebrar a LP)

### Wave 2 (Plan 07-02) Complete When:
- `src/pages/index.astro` NÃO contém `noindex`
- `dist/index.html` contém `hub-og.png` no og:image
- `dist/index.html` contém foto circular do mentor
- `dist/index.html` contém 2 course cards
- `dist/index.html` contém 4 links de redes sociais com aria-label
- `dist/deep-dive-vm/index.html` continua inalterado (regressão zero)

### Wave 3 (Plan 07-03) Complete When:
- `npm run test:unit` exit 0 (todos os testes incluindo novos)
- `npx playwright test tests/e2e/hub.spec.ts` exit 0
- `npm run test:all` exit 0

---

## Success Criteria (Phase Goal)

> The root URL `mentoria.sertaoseracloud.com/` serves a complete Linktree-style hub that a visitor can share on WhatsApp or Instagram and receive a rich preview card.

| Criterion | Verified By | Status |
|-----------|-------------|--------|
| HUB-01: mentor photo + name + bio visible | hub.spec.ts (E2E) — photo, h1, bio tagline | ✓ |
| HUB-02: course cards (VM ativo, EC2 coming soon) | hub.spec.ts — 2 cards, active href, coming-soon sem link | ✓ |
| HUB-03: social links com ícones, configuráveis via data file | hub.spec.ts — 4 links, aria-label, rel=noopener | ✓ |
| HUB-04: og:title, og:description, og:image, og:url no built HTML | Layout.test.ts (hubHtml) + seo-meta.test.ts test 15 | ✓ |
| Noindex removido do hub | Layout.test.ts — LP noindex regression guard | ✓ |
| LP /deep-dive-vm/ sem regressão | Layout.test.ts — LP og:image regression guard | ✓ |

---

## Validation Audit 2026-05-17

| Metric | Count |
|--------|-------|
| Gaps found | 5 |
| Resolved | 5 |
| Escalated | 0 |
| Manual-only | 0 |
| Final test count | 114 unit + 14 E2E hub (was 111 unit + 10 E2E hub) |
