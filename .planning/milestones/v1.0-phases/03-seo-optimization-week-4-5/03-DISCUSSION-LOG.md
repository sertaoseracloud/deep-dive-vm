# Phase 3: SEO Optimization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 03-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 3-SEO Optimization (Week 4-5)
**Areas discussed:** Performance CI gate, Image optimization, Font loading strategy, SEO test expansion

---

## Performance CI Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Category score ≥ 80 as error | `categories:performance: ["error", { minScore: 0.8 }]` — simple, matches REQUIREMENTS.md | ✓ |
| Core Web Vitals thresholds | Gate on LCP ≤ 2500ms, CLS ≤ 0.1, FCP ≤ 1800ms — more granular | |
| Warn only | Non-blocking; visible in report but never fails the build | |

**User's choice:** Category score ≥ 80 as error

---

## Accessibility CI Gate (follow-up during Performance gate)

| Option | Description | Selected |
|--------|-------------|----------|
| Promote a11y to error | `categories:accessibility` → `["error", { minScore: 0.9 }]` | ✓ |
| Keep as warn | Accessibility stays informational | |

**User's choice:** Promote to error (Phase 2 baseline solid enough to gate on)

---

## Image Optimization

| Option | Description | Selected |
|--------|-------------|----------|
| Astro `<Image>` component | Auto-converts to WebP, lazy loading, prevents CLS — zero new dependencies | ✓ |
| Manual lazy loading only | Keep PNG, add `loading="lazy"` + `width`/`height` manually | |
| Defer to Phase 4 | Skip image changes in Phase 3 | |

**User's choice:** Astro `<Image>` component for all 3 PNGs

---

## Hero Image Loading Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Hero = eager, others = lazy | `claudio1` → `loading="eager"` + `fetchpriority="high"`; `claudio2`, `marcelo` → `loading="lazy"` | ✓ |
| All lazy | Uniform `loading="lazy"` across all images | |

**User's choice:** Hero eager, others lazy

---

## Font Loading Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Preload + font-display:swap | `<link rel="preload" as="style">` + `onload` swap + `<noscript>` fallback | ✓ |
| Self-host via fontsource | Install `@fontsource/*` packages, import in Layout.astro | |
| Keep as-is | No change; render-blocking concern exists but may not fail Lighthouse | |

**User's choice:** Preload + font-display:swap

---

## SEO Test Expansion

| Option | Description | Selected |
|--------|-------------|----------|
| JSON-LD schema validation | Assert `application/ld+json` present and parseable with `@context`/`@type` | ✓ |
| Heading hierarchy test | Assert no H2 before first H1, no level-skipping | ✓ |
| Sitemap presence | Assert `dist/sitemap-index.xml` exists (requires `@astrojs/sitemap`) | ✓ |

**User's choice:** All three

---

## Sitemap Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Root only — single-page site | Auto-detection via `@astrojs/sitemap`; no `customPages` config | ✓ |
| Explicit URL list | `customPages` in astro.config.mjs | |

**User's choice:** Root only

---

## Claude's Discretion

None — all gray areas had explicit user input.

---

## Deferred Ideas

- Core Web Vitals raw metric thresholds (LCP/CLS/FCP) — deferred; category score gate chosen instead
- Self-hosting fonts via fontsource — deferred; preload approach is sufficient
- FAQ JSON-LD schema markup — Phase 4
- Person schema for mentor Cláudio Raposo — Phase 4
