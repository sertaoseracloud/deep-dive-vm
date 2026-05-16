# Phase 01 — Motion Effects: Validation Strategy

**Phase:** 01
**Date:** 2026-05-15

## Requirement → Test Map

| Req ID | Behavior | Test Type | Command | Wave Gate |
|--------|----------|-----------|---------|-----------|
| MOT-01 | Motion components render without errors | unit | `npm run test -- motion-utils` | Wave 1 complete |
| MOT-02 | Reduced-motion preference disables animations | integration | `npm run test:reduced-motion` | Wave 2 complete |
| MOT-03 | Lighthouse CLS <= 0.1, TBT < 50ms | e2e/perf | `npm run test:perf` | Wave 3 complete |

## Sampling Rate

- Per task: quick unit run
- Per wave: full suite
- Phase gate: full suite + Lighthouse CLS <= 0.1
