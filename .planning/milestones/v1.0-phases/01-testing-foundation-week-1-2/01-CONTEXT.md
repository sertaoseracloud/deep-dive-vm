# Phase 1 Context: Testing Foundation (Week 1-2)

## Decisions

### 1. Unit-Test Framework

- **Framework**: Vitest with jsdom and Astro test utilities
- **Snapshot testing**: Enabled for Astro components
- **Coverage**: Target 95%+ statement and branch coverage
- **Environment**: Full DOM simulation for component testing

### 2. Integration-Test Data Strategy

- **Source**: Real content fixtures from repository Markdown files
- **Testing**: Content Collections data flow and Zod validation
- **Environment**: Vitest + Astro API utilities

### 3. E2E-Test Scope & Coverage

- **Focus**: Core homepage flow only (load, navigation, responsive checks)
- **Target**: 90% test pass rate
- **Framework**: Playwright with Chromium, Firefox, WebKit

### 4. SEO Audit Baseline

- **Primary metric**: SEO score ≥ 90 in CI
- **Secondary checks**: Meta tags, Open Graph, structured data presence
- **Performance deferred**: LCP, FCP, CLS metrics deferred to Phase 3

## Implementation Mandates

- TDD requirement: Write failing tests before implementation
- CI integration: All tests must pass on every push to main
- Coverage reporting: Generate and enforce minimum thresholds
- SEO validation: Automated Lighthouse CI with SEO score check

## Technical Specifications

- **Unit tests**: Props validation, conditional rendering, slot distribution, CSS classes
- **Integration**: Data flow from collections to components, route generation
- **E2E**: Home page load, navigation, responsive behavior
- **SEO**: Unique titles, meta descriptions, heading hierarchy, alt text

## Dependencies

- Phase 1 depends on completion of research and requirements
- No prior phases (this is the foundation phase)
- Phase 2 depends on successful Phase 1 completion
