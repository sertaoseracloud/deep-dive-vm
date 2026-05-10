# REQUIREMENTS.md

## Project Overview

  Migrate the existing high‑conversion landing‑page
  copy into Markdown files consumed by an Astro
  site, preserving exact layout, hierarchy, and
  visual fidelity. Target audience: potential
  customers. The migration must improve SEO,
  page‑load performance, and conversion rates while
  ensuring zero visual differences versus the legacy
   page.

## Core Requirements

### 1. Content Migration

- **1.1** Extract **all** existing landing‑page
  copy (HTML, CMS entries, PDFs) and convert it to
  Markdown.
- **1.2** Separate each page into:
  - **Frontmatter**: `title`, `description`,
  `ctaText`, `ctaLink`, `seoMeta`, `slug`, `layout`.
  - **Body**: Markdown content preserving
  headings, bold, lists, and inline formatting.
- **1.3** Preserve the original hierarchy (h1, h2,
   …) and content density.

### 2. Asset Management

- **2.1** Move all images, SVGs, and downloadable
  assets to `public/` or `src/assets/`.
- **2.2** Rewrite relative links in Markdown to
  point to the new locations.
- **2.3** Optimize images to WebP/AVIF and
  generate responsive `srcset`s.

### 3. SEO & Structured Data

- **3.1** Generate canonical tags for every page
  using the old‑URL → new‑route mapping.
- **3.2** Populate meta tags (`title`,
  `description`, `og:*`, `twitter:*`) from
  frontmatter.
- **3.3** Inject JSON‑LD blocks (Product, FAQ,
  Review) where applicable.
- **3.4** Create a sitemap (`@astrojs/sitemap`)
  and robots.txt reflecting the new structure.

### 4. Performance

- **4.1** Ensure the Astro build outputs pure
  static HTML with **≤ 10 KB** JavaScript payload
  for the landing page.
- **4.2** Meet **Lighthouse** targets: **FCP
  < 1 s**, **LCP < 2.5 s**, **CLS ≤ 0.1**.
- **4.3** Enable incremental builds for future
  content updates.

### 5. Validation & Testing

- **5.1** Run `markdownlint` and custom Astro
  validation scripts on every PR.
- **5.2** Use a link‑checker to verify no broken
  internal or external links.
- **5.3** Compare generated HTML against the
  legacy page using an HTML‑diff tool (pixel‑perfect
   visual diff is a must‑pass check).
- **5.4** Verify SEO metrics (meta tags, canonical
   URLs, structured data) with Google Search
  Console’s URL Inspection tool.

### 6. Deployment & Rollout

- **6.1** Deploy to a staging environment first;
  perform full SEO and performance audits.
- **6.2** Configure Netlify/Vercel redirects from
  old URLs to new Astro routes (`_redirects` or
  `vercel.json`).
- **6.3** After sign‑off, push to production with
  a **single‑branch** release.

## Non‑Functional Constraints

- **Timeline**: Complete migration by **next
  month** (date target: 2026‑06‑10).
- **No Git actions**: All changes will be
  committed manually by the user (as per config).
- **Granularity**: Medium – tasks broken into
  logical groups but not to the level of individual
  lines.
- **Agent Mode**: Enabled – research agents may be
   used for any future deep‑dive questions.

## Acceptance Criteria

- All landing‑page copy is present in Markdown
  with correct frontmatter.
- SEO scores are equal to or higher than the
  legacy page (per Google Search Console).
- Lighthouse performance metrics meet the
  thresholds above.
- Visual regression testing reports **PASS** (no
  differences in hierarchy, styling, or content).
- No broken links or missing assets in the
  production build.

  ---

  *Last updated: 2026‑05‑10*
