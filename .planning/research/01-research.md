# Research: Testing & SEO Best Practices

## Testing Strategy (TDD)

### Unit Testing with Vitest

- Vitest is ideal for Astro component testing with Vite integration.
- Focus on pure functions, component props validation, and data transformations.
- Mock external dependencies (API calls, filesystem) at unit level.
- Target 80%+ code coverage with branch and statement coverage tracking.

### Integration Testing

- Test page composition, data flow from collections to components.
- Validate Content Collections data integrity with Zod schemas.
- Use Playwright for integration tests that mock browser environment.

### E2E Testing

- Cover critical user journeys (navigation, form validation, page loads).
- Use Playwright for browser automation.
- Test accessibility features and responsive design.

## SEO Best Practices

### Technical SEO

- Meta tags: title, description, Open Graph, Twitter Card.
- Structured data (JSON-LD) for rich snippets.
- Proper heading hierarchy (H1 -> H2 -> H3).
- Image optimization (alt text, responsive images).
- Canonical URLs, sitemap.xml.

### Performance SEO

- LCP (Largest Contentful Paint) < 2.5s.
- FCP (First Contentful Paint) < 1.8s.
- CLS (Cumulative Layout Shift) < 0.1.
- Proper preload, preconnect, and resource hints.

### Accessibility

- Semantic HTML, ARIA labels.
- Keyboard navigation, focus management.
- Screen reader compatibility.

Sources: MDN Web Docs, Google Lighthouse documentation, Astro docs
