# Roadmap: Landing Page Deep Dive

## Milestones

- ✅ **v1.0 Testing & SEO Optimization** — Phases 1-4 (shipped 2026-05-12)
- ✅ **v1.2 Quality Audit** — Phase 5 (shipped 2026-05-16)
- 🚧 **v1.3 Multi-LP Platform** — Phases 6-8 (in progress)

## Phases

<details>
<summary>✅ v1.0 Testing & SEO Optimization (Phases 1-4) — SHIPPED 2026-05-12</summary>

- [x] **Phase 1: Testing Foundation** — Unit test suite + 95% coverage gate (completed 2026-05-11)
- [x] **Phase 2: E2E Testing** — Playwright cross-browser coverage (completed 2026-05-11)
- [x] **Phase 3: SEO Optimization** — Lighthouse SEO 100, schema, sitemap (completed 2026-05-11)
- [x] **Phase 4: Continuous Validation** — GitHub Actions CI + weekly LHCI cron (completed 2026-05-12)

</details>

<details>
<summary>✅ v1.2 Quality Audit (Phase 5) — SHIPPED 2026-05-16</summary>

- [x] **Phase 5: Quality Audit** — 60fps gate, reduced-motion compliance, CLS audit (completed 2026-05-16)

</details>

### 🚧 v1.3 Multi-LP Platform (In Progress)

**Milestone Goal:** Transform the site into a multi-landing-page platform — the domain root becomes a Linktree-style hub, and each course lives at its own route. The existing Deep Dive VM URL is preserved throughout.

- [x] **Phase 6: Route Migration** — Remove Astro base config, move LP to file-based route, CNAME preserved, CI green (completed 2026-05-17)
- [x] **Phase 7: Hub Page** — Linktree-style root hub with mentor identity, course cards, social links, and Open Graph (executed 2026-05-17)
- [ ] **Phase 8: Multi-LP Scaffold** — Documented, repeatable pattern for adding new landing pages

## Phase Details

### Phase 6: Route Migration
**Goal**: The existing Deep Dive VM landing page is reachable at `/deep-dive-vm/` via native Astro file-based routing, with no `base` property in the config, the custom domain surviving every deploy, and CI remaining green throughout.
**Depends on**: Phase 5
**Requirements**: MIGR-01, MIGR-02, MIGR-03, MIGR-04
**Success Criteria** (what must be TRUE):
  1. Visiting `mentoria.sertaoseracloud.com/deep-dive-vm/` in a browser loads the existing landing page with all assets intact — no 404, no broken images or fonts
  2. The custom domain `mentoria.sertaoseracloud.com` survives a GitHub Pages deploy (CNAME file present in built output)
  3. All CI checks pass green after the migration: Vitest unit tests, Playwright E2E suite, and LHCI audit
  4. No hardcoded `/deep-dive-vm/` path remains broken — favicon, JSON-LD offersUrl, and test configs all resolve correctly
**Plans**: 3 plans
Plans:
- [x] 06-01-PLAN.md — CNAME + refatorar Layout.astro (favicon, offersUrl prop opcional)
- [x] 06-02-PLAN.md — Remover base do config + mover LP + criar hub placeholder + build de validação
- [x] 06-03-PLAN.md — Atualizar 11 testes Vitest + playwright.config.ts + 4 E2E specs + LHCI blocklist

### Phase 7: Hub Page
**Goal**: The root URL `mentoria.sertaoseracloud.com/` serves a complete Linktree-style hub that a visitor can share on WhatsApp or Instagram and receive a rich preview card.
**Depends on**: Phase 6
**Requirements**: HUB-01, HUB-02, HUB-03, HUB-04
**Success Criteria** (what must be TRUE):
  1. Visiting `mentoria.sertaoseracloud.com/` displays the mentor's photo, name, and bio tagline in a mobile-first layout
  2. The hub shows a course card for Deep Dive VM (with link to `/deep-dive-vm/`) and a "coming soon" card for Deep Dive EC2
  3. Social link icons for Instagram, YouTube, WhatsApp, and LinkedIn are visible and clickable, and they can be updated without changing component code
  4. Sharing the root URL on WhatsApp or LinkedIn generates a rich preview card with image, title, and description (Open Graph meta tags verified in built HTML)
**Plans**: 3 plans
**UI hint**: yes
Plans:

**Wave 1** — Foundations (parallel-safe)
- [x] 07-01-PLAN.md — Layout props (ogImage/noindex), data files, SocialIcon, hub-og.png placeholder

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 07-02-PLAN.md — Rewrite src/pages/index.astro as the Linktree hub

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 07-03-PLAN.md — Add unit/SEO/E2E tests (Layout hub OG, sitemap, hub.spec.ts)

Cross-cutting constraints:
- `dist/` must be rebuilt via `npm run build` before test verification (Wave 3 tasks)
- `public/hub-og.png` must exist before any Wave 2+ build
- All social link anchors require `rel="noopener noreferrer"` and `aria-label`

### Phase 8: Multi-LP Scaffold
**Goal**: A documented, working pattern exists so that adding a new landing page to the platform requires only following a checklist — demonstrated by a live `/deep-dive-ec2/` route.
**Depends on**: Phase 7
**Requirements**: SCAFF-01, SCAFF-02
**Success Criteria** (what must be TRUE):
  1. Visiting `mentoria.sertaoseracloud.com/deep-dive-ec2/` renders a "coming soon" page (no 404)
  2. `HOWTO-new-landing-page.md` at the repository root describes the complete steps to add a new LP — create the page file, add hub card, create og:image, update tests — verified by reading the file and following it to add a hypothetical new route
**Plans**: 3 plans
  - [x] 08-01-PLAN.md — EC2 LP-lite page + og:image placeholder (SCAFF-01 production)
  - [ ] 08-02-PLAN.md — EC2 E2E spec + SEO test 16 (SCAFF-01 verification)
  - [ ] 08-03-PLAN.md — HOWTO-new-landing-page.md (SCAFF-02)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Testing Foundation | v1.0 | 1/1 | Complete | 2026-05-11 |
| 2. E2E Testing | v1.0 | 1/1 | Complete | 2026-05-11 |
| 3. SEO Optimization | v1.0 | 4/4 | Complete | 2026-05-11 |
| 4. Continuous Validation | v1.0 | 4/4 | Complete | 2026-05-12 |
| 5. Quality Audit | v1.2 | 3/3 | Complete | 2026-05-16 |
| 6. Route Migration | v1.3 | 3/3 | Complete   | 2026-05-17 |
| 7. Hub Page | v1.3 | 3/3 | Executed — pending verify | 2026-05-17 |
| 8. Multi-LP Scaffold | v1.3 | 0/3 | Planned     | - |
