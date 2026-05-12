# Roadmap: Testing & SEO Optimization

## Phase 1: Testing Foundation (Week 1-2)

1. **Unit Test Implementation**
   - Create Vitest tests for:
     - All Astro components (Posts, Cards, Header, Footer)
     - Utility functions (slug generation, date formatting)
     - Data processing with Zod schemas
   - Implement TDD cycle:
     - Write failing tests first
     - Refactor production code
     - Add passing tests

2. **Integration Test Setup**
   - Develop tests for:
     - Content Collections data flow
     - Route generation with dynamic parameters
     - Zod schema validation in content processing
   - Configure GitHub Actions workflow
     - Run tests on every push
     - Report coverage metrics

## Phase 2: E2E Testing (Week 3-4)

1. **Critical User Journeys**
   - Home page load and navigation
   - Search functionality (if implemented)
   - Form validation scenarios (if applicable)
   - Responsive design across breakpoints

2. **Accessibility Testing**
   - Keyboard navigation flow
   - Screen reader compatibility
   - Lighthouse accessibility audit

## Phase 3: SEO Optimization (Week 4-5)

1. **Technical SEO Audit**
   - Lighthouse CI configuration
   - Static site generation performance
   - Structured data implementation

2. **Content Optimization**
   - Meta tag generation with dynamic data
   - Heading hierarchy validation
   - Alt text implementation for images

## Phase 4: Continuous Validation

1. **Test Coverage Enforcement**
   - Minimum 95% code coverage
   - Regular coverage reporting
2. **SEO Health Monitoring**
   - Weekly Lighthouse scores
   - Automated SEO quality gates in CI

**Goal:** Enforce 95% coverage gate in CI; publish live coverage badge from a `badges` branch; run Lighthouse on a weekly cron; persist LHCI score history as filesystem JSON committed to main.

**Plans:** 4 plans

Plans:
- [ ] 04-01-PLAN.md — Raise vitest coverage thresholds to 95% on all four metrics (D-01/02/03)
- [ ] 04-02-PLAN.md — Pre-create `badges` orphan branch, add badge publish CI step, add README badge link (D-07/08/09)
- [ ] 04-03-PLAN.md — Create `.github/workflows/lighthouse-weekly.yml` with Sunday midnight UTC cron (D-04/05/06)
- [ ] 04-04-PLAN.md — Change LHCI upload.target to `filesystem`, commit `.lighthouseci/*.json` to main with `[skip ci]` (D-10/11/12/13)
