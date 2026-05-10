# Research

## Development Environment
- Local instance: http://localhost:4321/deep-dive-vm

## Production Environment
- Deployed site: https://mentoria.sertaoseracloud.com/deep-dive-vm/

## Reference Documentation
- Astro Markdown guide: https://docs.astro.build/en/guides/markdown-content/

## Migration Overview
The goal is to migrate the existing landing‑page copy into Markdown files while preserving exact visual hierarchy and SEO metadata. Content will be split into frontmatter (titles, CTA text, links, SEO data) and body (rich text, lists, bold). The Astro `<Content/>` component will render the Markdown to HTML unchanged.

## Migration Steps
1. **Audit existing copy** – Identify all hard‑coded strings in Astro components.
2. **Extract to Markdown** – Create a `.md` file per page, moving static text to the body and structured data to frontmatter.
3. **Update components** – Replace inline markup with `<Content src="./page.md" />`.
4. **Validate HTML output** – Use visual diff tools to compare rendered HTML against the legacy page for pixel‑perfect fidelity.
5. **SEO verification** – Run Lighthouse/SEO audits to ensure metadata is retained.
6. **Performance testing** – Measure load‑time before and after migration.

## Validation Criteria
- No visual differences (pixel diff ≤ 0.1%).
- All frontmatter fields present and correctly mapped.
- SEO score meets or exceeds baseline.
- Load‑time remains within current benchmark.

## Risks & Mitigations
- **Risk:** Missing strings during extraction.
  - *Mitigation:* Automated script to scan component files for literal text.
- **Risk:** Frontmatter syntax errors.
  - *Mitigation:* Lint Markdown with `remark-lint` before commit.

## Timeline
- **Week 1:** Complete audit and initial extraction.
- **Week 2:** Implement component updates and run first validation pass.
- **Week 3:** Full SEO and performance testing, address regressions.
- **Week 4:** Final review and deployment.
