# Content Migration to Markdown

## What This Is

Migrate the existing high‑conversion landing‑page copy into Markdown files used by an Astro site, preserving exact layout, hierarchy, and visual fidelity. The target audience is potential customers.

## Core Value

Ensure the copy remains visually identical while gaining version‑controlled, easily editable Markdown, improving SEO, load time, and conversion rates.

## Requirements

### Validated

- None yet – the migration will validate the approach.

### Active

- Migrate **all** existing landing‑page copy into Markdown, separating frontmatter (titles, CTA text, links, SEO metadata) from body content.
- Preserve visual hierarchy (headings, bold, lists) exactly as in the legacy page.
- Generate HTML via Astro's `<Content/>` component without altering the markup structure.
- Verify SEO score meets target thresholds.
- Meet load‑time performance targets.
- Achieve conversion‑rate increase compared to the legacy page.
- Ensure zero visual differences versus the legacy page.

### Out of Scope

- Creating new copy or content revisions.
- Building additional pages beyond the landing page.
- Internationalization/localization.

## Context

- Existing Astro project at `C:\Repo\landing-page\deep-dive-vm`.
- Content currently embedded in Astro components; needs extraction.
- Specs folder contains accessibility, QA, and test documentation.
- Goal is to modernize delivery while keeping proven copy.

## Constraints

- **Timeline**: Complete migration by next month.
- **Performance**: Load‑time must stay within current benchmarks or improve.
- **SEO**: Maintain or improve current SEO scores.
- **Visual fidelity**: HTML output from Astro must match legacy page pixel‑perfectly.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Astro frontmatter for fixed parameters | Enables component props and SEO metadata injection | ✓ Good |
| Separate body content into Markdown | Keeps long‑form copy editable and versioned | ✓ Good |
| Validate via HTML diff against legacy page | Guarantees visual fidelity | — Pending |

---
*Last updated: 2026‑05‑10 after initial project definition*
