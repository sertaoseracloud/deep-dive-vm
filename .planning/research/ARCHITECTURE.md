# Architecture Research: Multi-LP Platform

**Researched:** 2026-05-16
**Confidence:** HIGH (verified against official Astro docs via Context7)

---

## Recommended Structure

**Option A (file-based directories) is the clear winner.** Use it.

```
src/
  pages/
    index.astro                     ← NEW: Hub/Linktree page at mentoria.sertaoseracloud.com/
    deep-dive-vm/
      index.astro                   ← MOVED: existing landing page at /deep-dive-vm/
    deep-dive-ec2/
      index.astro                   ← NEW SCAFFOLD: future LP at /deep-dive-ec2/
  components/
    hub/                            ← NEW: Hub-only components (LP card, link list)
      LpCard.astro
    deep-dive-vm/                   ← MOVED: all current LP components
      layout/
        UrgencyBar.astro
        NavBar.astro
        Footer.astro
        StickyCta.astro
      sections/
        Hero.astro
        TrustBand.astro
        (... all current sections)
      ui/
        Button.astro
        LegalModals.astro
        ModuleDetails.astro
        SectionHead.astro
    shared/                         ← OPTIONAL: components shared between hub AND LPs
      (e.g., a footer variant used everywhere)
  layouts/
    Layout.astro                    ← KEEP: already generic, works for both hub and LPs
    HubLayout.astro                 ← NEW OPTIONAL: if hub needs a distinct <head>/schema
  assets/                           ← KEEP: untouched, Astro handles src/ imports correctly
public/
  CNAME                             ← MOVE HERE from repo root (see Integration Points)
  favicon.svg
  favicon.ico
  images/
    (all existing webp images)
```

**Rationale for Option A over Option B ([slug] dynamic routing):**

- Each LP is independently authored, not data-driven — a [slug] pattern adds `getStaticPaths()` boilerplate with no benefit when you have 2-5 distinct pages that differ structurally.
- File-based directories make the URL → file mapping obvious to any contributor.
- Adding a new LP is one action: create `src/pages/new-lp/index.astro`. No routing config to touch.
- Dynamic routing is the right tool when you have 20+ similar pages generated from a data source (CMS, collection). Not this case.

---

## Migration Path

### Phase 1 — Remove `base` from astro.config.mjs (do this FIRST)

The `base: '/deep-dive-vm/'` config was a GitHub Pages workaround. With a custom domain (`mentoria.sertaoseracloud.com`), the site is already served from root. The base prefix is wrong for the target architecture.

**Astro official guidance (HIGH confidence):** When using a custom domain on GitHub Pages, remove `base` from `astro.config.mjs` and set only `site`.

```js
// astro.config.mjs — AFTER
export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  // base removed — custom domain serves from root
  outDir: 'dist',
  integrations: [sitemap()],
});
```

After removing `base`, `import.meta.env.BASE_URL` becomes `'/'`.

### Phase 2 — Move existing LP files

1. Create `src/pages/deep-dive-vm/` directory.
2. Move `src/pages/index.astro` → `src/pages/deep-dive-vm/index.astro`.
   - Astro file-based routing: `src/pages/deep-dive-vm/index.astro` maps to `/deep-dive-vm/` automatically. No config needed.
3. Create `src/components/deep-dive-vm/` and move all current `src/components/layout/`, `src/components/sections/`, `src/components/ui/` into it.
4. Update import paths in `src/pages/deep-dive-vm/index.astro` to reflect new component locations.

### Phase 3 — Fix hardcoded base path references

Two known hardcoded occurrences in `src/layouts/Layout.astro`:

| Location | Current value | Target value |
|---|---|---|
| `Layout.astro:16` — `offersUrl` | `${siteOrigin}/deep-dive-vm#investimento` | KEEP as-is — this is a Deep Dive VM specific URL, belongs in the LP page or a LP-specific layout, not the shared Layout |
| `Layout.astro:48` — favicon `href` | `"/deep-dive-vm/favicon.svg"` | `"/favicon.svg"` — favicon lives in `public/` at root, no base prefix needed |

Recommended refactor: extract the `offersUrl` and JSON-LD schema block (which is course-specific) out of `Layout.astro` into `src/pages/deep-dive-vm/index.astro` or a `src/layouts/LpLayout.astro`. The shared `Layout.astro` should be course-agnostic.

### Phase 4 — Fix CNAME location

Current CNAME is in repo root. **Astro official docs specify `public/CNAME`** — files in `public/` are copied directly into `dist/` at build time, which is what GitHub Pages reads. A root-level CNAME is only picked up if GitHub Pages is configured to use the root. To be safe and explicit with Astro's build pipeline, move it:

```
CNAME (repo root) → public/CNAME
```

Verify the file contains exactly: `mentoria.sertaoseracloud.com`

### Phase 5 — Create hub page

Create `src/pages/index.astro` as the new root. This is a simple linktree-style page — no complex component tree needed initially. It links out to `/deep-dive-vm/` and `/deep-dive-ec2/`.

### Phase 6 — Scaffold deep-dive-ec2

Create `src/pages/deep-dive-ec2/index.astro` with a placeholder. Components for this LP live in `src/components/deep-dive-ec2/` when built out.

---

## Integration Points

### astro.config.mjs

- Remove `base` entirely. The sitemap integration uses `site` to build URLs; without `base`, it generates correct root-relative URLs.
- No other config changes needed. Astro's file-based routing handles the new page structure automatically.

### GitHub Actions deploy workflow (`.github/workflows/deploy.yaml`)

**No changes required.** The workflow does:
1. `npm run build` — outputs to `./dist`
2. `upload-pages-artifact` with `path: ./dist`
3. `deploy-pages`

This workflow is base-agnostic. It deploys whatever Astro outputs to `dist/`. The CNAME file in `public/` will be copied into `dist/CNAME` by Astro at build time, maintaining the custom domain mapping on every deploy.

### Asset imports (`src/assets/`)

All assets in `src/assets/` are imported via ES module syntax (`import claudio1 from '../assets/claudio1.png'`). Astro processes these through its image pipeline and outputs them with content-hashed filenames. **No base-prefix changes needed** — Astro rewrites these paths automatically regardless of `base` config. These imports are not affected by removing `base`.

### Public directory assets (`public/`)

Assets referenced by hardcoded URL string (not ES import) need the base prefix removed now that `base` is gone:

- `"/deep-dive-vm/favicon.svg"` → `"/favicon.svg"` (in `Layout.astro`)
- Any `public/images/*.webp` referenced as strings use paths like `"/images/claudio1.webp"` — these are already correct (no base prefix in the components checked; they use ES imports instead).

### Component import paths

After moving components into `src/components/deep-dive-vm/`, update imports in `src/pages/deep-dive-vm/index.astro`:

```astro
// Before (current index.astro)
import Hero from "../components/sections/Hero.astro";

// After (in src/pages/deep-dive-vm/index.astro)
import Hero from "../../components/deep-dive-vm/sections/Hero.astro";
```

Alternatively, configure `tsconfig.json` path aliases to avoid fragile relative paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@deep-dive-vm/*": ["./src/components/deep-dive-vm/*"],
      "@hub/*": ["./src/components/hub/*"],
      "@shared/*": ["./src/components/shared/*"],
      "@layouts/*": ["./src/layouts/*"]
    }
  }
}
```

This is especially valuable when components reference each other internally.

### Layout.astro — schema and SEO

The current `Layout.astro` contains a JSON-LD Course schema and an `offersUrl` that are Deep Dive VM-specific. With a hub page at root that needs a different `<head>`, extract these:

- Keep `Layout.astro` as a generic shell (head basics, fonts, global CSS, ambient background).
- Create `src/layouts/LpLayout.astro` that extends Layout and adds the Course schema slot, accepting `offersUrl` as a prop.
- The hub's `index.astro` uses `Layout.astro` directly with different title/description.

---

## Build Order

**Recommended sequence:**

1. **Route migration first** (Phases 1–4 above) — Move existing LP to `/deep-dive-vm/`, remove base, fix hardcoded paths. This is the load-bearing structural change. Validate by running `npm run build` and confirming `dist/deep-dive-vm/index.html` exists and `dist/index.html` does not yet (or is empty).

2. **Hub page second** (Phase 5) — Only after the LP migration is confirmed working. The hub is a net-new page; it cannot break existing functionality.

3. **EC2 scaffold third** (Phase 6) — Pure addition, no risk.

**Why this order:** The base config removal + file move is the highest-risk step. Doing it in isolation makes rollback trivial (just `git revert`). Mixing it with hub creation obscures which change caused a regression if the deploy breaks.

---

## Pitfalls Specific to This Migration

### CNAME must survive every deploy

GitHub Pages clears the custom domain if CNAME is not in the deployed artifact. Astro's `public/` directory is the correct mechanism — it copies verbatim into `dist/`. A root-level CNAME in the repo is NOT automatically included in the Astro build output. Verify `dist/CNAME` exists after first build post-migration.

### `base` removal does not auto-rewrite existing hardcoded strings

Astro rewrites *imported* asset paths when `base` changes. It does NOT scan and rewrite hardcoded string literals. Audit all `href="..."` and `src="..."` string literals for any that currently include `/deep-dive-vm/` as a prefix — remove the prefix after `base` is removed. Found occurrences: `Layout.astro:48` (favicon href).

### NavBar anchor links are page-relative — no changes needed

All nav links are anchor-only (`#metodo`, `#investimento`, etc.). These are relative to the current page regardless of URL path. The NavBar component, when used inside `deep-dive-vm/index.astro`, will correctly link to anchors on that page. No changes to NavBar required.

### Sitemap will regenerate correctly

The `@astrojs/sitemap` integration reads `site` from config and generates URLs for all pages it discovers. After migration: `site: 'https://mentoria.sertaoseracloud.com'` + pages at `/`, `/deep-dive-vm/`, `/deep-dive-ec2/` → sitemap entries are correct. No manual sitemap configuration needed.

---

## Sources

- Astro file-based routing: https://docs.astro.build/en/guides/routing/ (HIGH confidence, verified via Context7 /withastro/docs)
- Astro base config + custom domain: https://docs.astro.build/en/guides/deploy/github/ (HIGH confidence — official doc explicitly states: "remove base when using custom domain")
- Astro public/ assets: https://docs.astro.build/en/guides/imports/#files-in-public (HIGH confidence, verified via Context7)
- Astro configuration reference: https://docs.astro.build/en/reference/configuration-reference/ (HIGH confidence, verified via Context7)
