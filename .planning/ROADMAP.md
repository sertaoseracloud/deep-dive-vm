# ROADMAP.md

## Overview

  Migrate the high‑conversion landing‑page copy to
  Markdown for an Astro site while preserving SEO,
  performance, and visual fidelity. Target
  completion: **2026‑06‑10**.

  ---

## Phase 1 – Discovery & Setup (1 week)

  | Milestone | Tasks | Owner | Due |
  |-----------|-------|-------|-----|
  | 1.1 | Inventory all source content (HTML pages,
  CMS entries, PDFs) – create a spreadsheet with
  URLs, content type, SEO priority. | (you) |
  2026‑05‑15 |
  | 1.2 | Define front‑matter schema (title,
  description, ctaText, ctaLink, seoMeta, slug,
  layout). Add to project docs. | (you) | 2026‑05‑15
   |
  | 1.3 | Set up the Astro project for Markdown
  ingestion: configure `astro.config.mjs` with
  `markdown.rehypePlugins` (relative‑link rewrite).
  | (you) | 2026‑05‑16 |
  | 1.4 | Add SEO helper component (`<Seo/>`) and
  JSON‑LD template. | (you) | 2026‑05‑16 |
  | 1.5 | Create CI pipeline steps: `markdownlint`,
  link‑checker, Lighthouse run. | (you) | 2026‑05‑17
   |

  **Outcome:** Project scaffold ready; all tooling
  configured; content inventory complete.

  ---

## Phase 2 – Pilot Migration (1 week)

  | Milestone | Tasks | Owner | Due |
  |-----------|-------|-------|-----|
  | 2.1 | Select 5 high‑traffic pages (based on SEO
  priority). | (you) | 2026‑05‑18 |
  | 2.2 | Write a conversion script
  (Node + pandoc/turndown) that: <br>• pulls HTML
  <br>• converts to Markdown <br>• injects
  front‑matter from the URL‑map CSV. | (you) |
  2026‑05‑19 |
  | 2.3 | Run the script on the 5 pages; commit
  Markdown files to `src/content/`. | (you) |
  2026‑05‑20 |
  | 2.4 | Optimize images referenced by those pages;
   move to `public/`. | (you) | 2026‑05‑20 |
  | 2.5 | Deploy to staging; run visual diff
  (Pixelmatch or similar) against legacy pages. |
  (you) | 2026‑05‑21 |
  | 2.6 | Perform SEO audit on staged pages (meta
  tags, canonical, JSON‑LD). | (you) | 2026‑05‑22 |
  | 2.7 | Lighthouse audit; ensure FCP < 1 s, LCP
  < 2.5 s. | (you) | 2026‑05‑22 |
  | 2.8 | Review results with stakeholders; sign‑off
   to proceed to full migration. | (you) |
  2026‑05‑23 |

  **Outcome:** Proven conversion pipeline; validated
   performance & SEO targets; stakeholder
  confidence.

  ---

## Phase 3 – Full Content Migration (2 weeks)

  | Milestone | Tasks | Owner | Due |
  |-----------|-------|-------|-----|
  | 3.1 | Run the conversion script on **all**
  remaining pages (bulk mode). | (you) | 2026‑05‑27
  |
  | 3.2 | Verify asset paths; run bulk image
  optimizer (sharp) on new assets. | (you) |
  2026‑05‑28 |
  | 3.3 | Commit all generated Markdown files; run
  `markdownlint` across the repository. | (you) |
  2026‑05‑29 |
  | 3.4 | Generate the URL‑mapping CSV → produce
  canonical tags for every page. | (you) |
  2026‑05‑30 |
  | 3.5 | Add Netlify/Vercel redirects for all
  legacy URLs. | (you) | 2026‑05‑31 |
  | 3.6 | Deploy full site to staging; run full‑site
   visual regression suite. | (you) | 2026‑06‑02 |
  | 3.7 | Run SEO audit (Google Search Console URL
  Inspection) for all new URLs. | (you) | 2026‑06‑03
   |
  | 3.8 | Run Lighthouse on every page; ensure all
  meet performance thresholds. | (you) | 2026‑06‑04
  |

  **Outcome:** All content live in Markdown; SEO,
  performance, and visual fidelity validated for the
   entire site.

  ---

## Phase 4 – Launch & Monitoring (1 week)

  | Milestone | Tasks | Owner | Due |
  |-----------|-------|-------|-----|
  | 4.1 | Deploy to production (single‑branch
  release). | (you) | 2026‑06‑06 |
  | 4.2 | Activate redirects; monitor 404 logs for
  24 h. | (you) | 2026‑06‑07 |
  | 4.3 | Verify SEO metrics in Search Console (no
  drop in impressions/CTR). | (you) | 2026‑06‑08 |
  | 4.4 | Run post‑launch performance monitoring
  (Web Vitals, real‑user monitoring). | (you) |
  2026‑06‑09 |
  | 4.5 | Final sign‑off: conversion rate meets or
  exceeds pre‑migration baseline. | (you) |
  2026‑06‑10 |

  **Outcome:** Production site fully migrated, SEO &
   performance goals met, conversion impact
  validated.

  ---

## Ongoing Maintenance (Post‑Launch)

- **Weekly**: Run CI checks (markdown lint, link
  checker).
- **Monthly**: Lighthouse audit for new content.
- **Quarterly**: Review SEO & conversion metrics;
  iterate on content if needed.

  ---

  *Roadmap generated on 2026‑05‑10. Adjust dates if
  needed, but keep the overall deadline of
  2026‑06‑10.*
