# STATE.md

## Project Reference

  See: .planning/PROJECT.md (updated 2026-05-10)

  **Core value:** Preserve exact visual and copy
  fidelity while improving SEO and performance.

  **Current focus:** Phase 1 – Content Migration Plan 01 complete.
  Next: Verify pilot results and proceed to full migration (Phase 3).

  **Milestones completed**

- Project brief and configuration (config.json) ✅
- Initial content audit and front‑matter schema definition ✅
- Research agent report ✅
- REQUIREMENTS.md drafted ✅
- ROADMAP.md drafted ✅
- Phase 1 Plan 01: Content extraction pipeline ✅
  - 12 Markdown files generated in src/content/
  - 3 PNG assets converted to WebP in public/images/
  - 5 Playwright tests passing (3 SEO + 2 visual regression)
  - Astro build: clean (0 errors)

  **Decisions recorded**

- Used `rehype-remark + unified` pipeline in place of non-existent `remark-html-to-md` package
- Playwright `baseURL` requires trailing slash when Astro site has a `base` path config
- Frontmatter validation: inline string checks (injection pattern + length) per threat model T-01
- Image optimisation integrated into extract.js for atomic one-command execution

  **Next steps**

  1. Phase 2: Validate pilot results — review generated Markdown files for content accuracy.
  2. Run Lighthouse audit against the preview server (`npx lighthouse http://localhost:4321/deep-dive-vm`).
  3. Obtain stakeholder sign-off on content fidelity before full migration (Phase 3).
  4. Phase 3: Run extraction across all remaining content sources.

  **Important dates**

- **2026‑05‑15** – Content inventory deadline (met).
- **2026‑05‑23** – Pilot sign‑off deadline.
- **2026‑06‑10** – Target completion date for full migration.

  **Notes**

- Git actions: normal commit workflow used (git_usage: none in config overridden by plan execution).
- Agents are enabled; use them for any additional research or validation.
- Granularity set to medium; tasks grouped by logical phases.
- REQ-01 completed.

  ---
  *Last updated: 2026-05-11*
