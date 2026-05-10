# Phase 1 – Implementation Context

## Frontmatter schema
The following fields will be stored in the frontmatter of every Markdown file:

- `title` – Page title
- `description` – Meta description
- `cta_text` – Text for the primary Call‑to‑Action button
- `cta_link` – URL for the CTA button

## Extraction method
We will use an **automated script** to scan existing Astro components, locate literal strings, and generate the corresponding Markdown files with the frontmatter defined above. The script will output one `.md` file per page and place the extracted content into the appropriate sections.

## Validation strategy
Two complementary validation approaches will be applied:

1. **Pixel‑perfect diff** – Render the legacy page and the new Astro‑generated page, produce image snapshots, and run an image‑diff check to ensure visual differences are ≤ 0.1 %.
2. **Visual regression tests** – Automated screenshot tests (e.g., with Playwright or Cypress) will be added to the CI pipeline to catch any visual regressions on future changes.

## SEO verification
Both **Lighthouse** audits (Chrome built‑in) and **custom SEO audits** (project‑specific checks for metadata completeness, keyword density, and structured data) will be run after each migration batch. The results must meet or exceed the baseline scores captured from the current production site.

## Next steps
- Run the front‑matter‑extraction script (generated in the next phase) against the codebase.
- Generate Markdown files and update Astro components to use `<Content src="…"/>`.
- Execute the validation suite and SEO audits; address any failures before proceeding to the next migration batch.

*All decisions above are locked for downstream agents (researcher, planner, executor).*