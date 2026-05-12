# Milestones

## v1.0 Testing & SEO Optimization (Shipped: 2026-05-12)

**Phases completed:** 4 phases, 10 plans, 9 tasks

**Key accomplishments:**

- 1. [Rule 1 - Bug] SEO title exceeded 60-character limit
- One-liner:
- Three new Vitest SEO assertions for JSON-LD schema, heading hierarchy, and sitemap presence appended to the existing 10-test suite, plus vitest.config.ts fix enabling test discovery for tests/seo/
- 1. [Rule 1 - Bug] Fixed missing og:description in built HTML (pre-existing Test 4 failure)
- Phase 3 gate verified green: Lighthouse Performance 91, SEO 100, Accessibility 96, all 13 Vitest SEO assertions passing, 3 WebP images in dist/_astro, preload font pattern confirmed, and sitemap-index.xml present
- GitHub Actions weekly cron scaffold triggering Lighthouse CI on Sunday midnight UTC, independent of push/PR gate, with contents:write permission and fetch-depth:0 pre-wired for Plan 04-04 filesystem commit integration

---
