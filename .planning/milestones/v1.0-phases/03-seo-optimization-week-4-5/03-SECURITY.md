---
phase: "03"
slug: 03-seo-optimization
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-11
---

# Phase 03 — Security (SEO Optimization)

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Build process → npm registry | `npm install @astrojs/sitemap` downloads a package from the npm registry during CI and local builds | Package download gated by `package-lock.json` SHA integrity |
| Astro build → Google Fonts CDN | `<link rel="preload">` causes the browser to fetch font CSS from `fonts.googleapis.com` at runtime | Font CSS only — no credentials, no PII |
| Browser → `dist/` static files | WebP images and sitemap served from `dist/` to any visitor | Public static assets for a public landing page |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-03-01-01 | Tampering | `.lighthouserc.json` config | mitigate | JSON validity + 4 assertion keys verified via node one-liner in Task 1 verify step | closed |
| T-03-01-02 | Denial of Service | `@astrojs/sitemap` supply chain | accept | Official Astro core integration; npm provenance available; build-time devDependency only | closed |
| T-03-01-03 | Information Disclosure | `dist/sitemap-index.xml` | accept | Exposes public URL structure only — acceptable for a single-route public landing page | closed |
| T-03-01-04 | Tampering | `astro.config.mjs` | mitigate | `site`, `base`, `outDir` values preservation verified; `npm run build` exits 0 | closed |
| T-03-02-01 | Tampering | `JSON.parse` in test 11 | accept | Operates on our own build output (not external input); throwing is the desired test failure behavior | closed |
| T-03-02-02 | Tampering | Regex in test 12 | accept | `/<(h[1-6])[\s>]/gi` on our own build output; catastrophic backtracking is not possible with this pattern | closed |
| T-03-02-03 | Information Disclosure | `DIST_DIR` path in test file | accept | Test file not shipped to production; local filesystem reference only | closed |
| T-03-03-01 | Tampering | `onload` inline JS in font preload link | accept | Runs in browser only; modifies `rel` attribute of same element; no user input; no CSP configured | closed |
| T-03-03-02 | Information Disclosure | WebP image URLs in `dist/_astro/` | accept | Public build artifacts (hashed filenames) for a public landing page; no sensitive data in names | closed |
| T-03-03-03 | Denial of Service | Google Fonts CDN unavailability | mitigate | `<noscript>` fallback ensures font CSS retrieval in no-JS environments; `font-display: swap` in URL enables graceful degradation | closed |
| T-03-03-04 | Tampering | `<Image>` `src` prop type mismatch | mitigate | Astro TypeScript types enforce `ImageMetadata` at build time; `npm run build` exits 0 confirms no type errors | closed |
| T-03-04-01 | Tampering | LHCI score threshold config | accept | `.lighthouserc.json` is version-controlled; LHCI reads it directly — no external input path | closed |
| T-03-04-02 | Denial of Service | LHCI performance gate flapping | mitigate | `numberOfRuns: 3` with LHCI default `aggregationMethod: optimistic` (best of 3 runs); 80% threshold provides headroom; re-run before investigating code changes | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Threat Evidence

### T-03-01-01 — CLOSED (Tampering / Mitigated)

**Mitigation:** Task 1 verify step ran a node one-liner to confirm `.lighthouserc.json` contains exactly 4 assertion entries.

**Evidence from 03-01-SUMMARY.md:**
```
categories:seo ✓
categories:accessibility ✓ (promoted to error)
categories:best-practices ✓
categories:performance ✓ (new gate)
```
`npm run build` exits 0 after the change.

---

### T-03-01-04 — CLOSED (Tampering / Mitigated)

**Mitigation:** Preserve `site`, `base`, `outDir` in `astro.config.mjs` after adding sitemap integration.

**Evidence from 03-01-SUMMARY.md:**
```
site/base/outDir preserved: true  ✓
dist/sitemap-index.xml: true      ✓
```

---

### T-03-03-03 — CLOSED (Denial of Service / Mitigated)

**Mitigation:** `<noscript>` fallback + `font-display: swap` for graceful degradation when Google Fonts CDN is unavailable.

**Evidence from 03-03-SUMMARY.md:**
```
noscript fallback:           OK   (<noscript> block contains stylesheet link)
preload font link:           OK   (rel=preload as=style + fonts.googleapis.com)
no blocking font stylesheet: OK   (no rel=stylesheet outside noscript)
```
Confirmed in `dist/` inspection.

---

### T-03-03-04 — CLOSED (Tampering / Mitigated)

**Mitigation:** Astro TypeScript types enforce that `<Image src={...}>` receives `ImageMetadata` (raw import), not a `.src` string. Build exit 0 confirms no type errors.

**Evidence from 03-03-SUMMARY.md:**
> "T-03-03-04 (src prop type mismatch): mitigated — all three `<Image>` usages pass `ImageMetadata` objects (raw imports, not `.src` strings); build exits 0 without type errors"

---

### T-03-04-02 — CLOSED (Denial of Service / Mitigated — Exercised in Production)

**Mitigation:** `numberOfRuns: 3` with LHCI default `aggregationMethod: optimistic`; re-run before investigating code changes.

**Evidence from 03-04-SUMMARY.md — mitigation was exercised during execution:**
> "LHCI Run #2 flapped with transient Chrome EPERM + RootCauses exception; re-ran per T-03-04-02 mitigation; Run #3 succeeded with exit code 0"

The LHCI flap scenario occurred on Windows (`EPERM` on temp file cleanup) and was resolved by re-running as documented. This validates the threat model: the mitigation works and was needed.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-01-02 | `@astrojs/sitemap` is an official Astro core integration; npm provenance available; build-time only | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-02 | T-03-01-03 | `dist/sitemap-index.xml` exposes only the public URL `/deep-dive-vm/`; no sensitive paths exist | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-03 | T-03-02-01 | `JSON.parse` on our own build output — throwing is the desired test failure; no external input | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-04 | T-03-02-02 | Simple non-backtracking regex on static HTML string; no user input path | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-05 | T-03-02-03 | `DIST_DIR` is a local filesystem constant in a test file not shipped to production | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-06 | T-03-03-01 | `onload` inline JS scope is limited to modifying the same element's `rel` attribute; no CSP configured; no user input surface | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-07 | T-03-03-02 | Content-hashed filenames in `dist/_astro/` are public CDN artifacts; no sensitive metadata | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-03-08 | T-03-04-01 | `.lighthouserc.json` is version-controlled and read directly by LHCI; no external input path to the config | OpenClaude / gsd-security-auditor | 2026-05-11 |

---

## Notable: CSP Consideration (Non-Blocking)

The `onload` inline JS pattern in the font preload link (`onload="this.onload=null;this.rel='stylesheet'"`) would be blocked by a `Content-Security-Policy: script-src 'self'` header if one were ever added. Currently, no CSP header is configured for this static GitHub Pages deployment. This is documented as an accepted risk (T-03-03-01). If a CSP is added in a future phase, the font preload pattern must be updated to use a nonce or a `link.onload` event listener in a separate script file.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-11 | 13 | 13 | 0 | gsd-security-auditor (via gsd-secure-phase) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-11
