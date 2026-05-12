---
phase: "02"
slug: 02-e2e-testing
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-11
---

# Phase 02 — Validation Strategy (E2E Testing)

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (4-project: Chromium, Firefox, WebKit, iPhone 13) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test --project=chromium` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~45 seconds (Chromium only) / ~3 minutes (all browsers) |

Supporting infrastructure from Phase 1 (unchanged):

| Property | Value |
|----------|-------|
| **Unit/Integration Framework** | Vitest 3.2.4 + happy-dom |
| **Config file** | `vitest.config.ts` |
| **Unit command** | `npm run test:unit` |
| **Integration command** | `npm run test:integration` |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test --project=chromium`
- **After every plan wave:** Run `npx playwright test --project=chromium`
- **Before `/gsd-verify-work`:** Full Chromium suite must be green (30/30)
- **Max feedback latency:** ~45 seconds (Chromium quick run)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | e2e-journeys | T-02-04 / — | CTA hrefs use explicit anchor IDs (#investimento, #ementa); no open redirect | e2e | `npx playwright test tests/e2e/journeys.spec.ts --project=chromium` | ✅ | ✅ green |
| 02-01-02 | 01 | 1 | e2e-accessibility | T-02-04 | tabindex="-1" addition documented; skip link is first focusable element; focus lands on #main | e2e | `npx playwright test tests/e2e/accessibility.spec.ts --project=chromium` | ✅ | ✅ green |
| 02-01-03 | 01 | 1 | e2e-multi-browser | T-02-01 | continue-on-error at step level (not job level) — infra failures still surface | structural | `grep -E "continue-on-error\|e2e-chromium\|e2e-cross-browser" .github/workflows/test.yml` | ✅ | ✅ green |
| 02-01-03 | 01 | 1 | e2e-ci-every-push | — | N/A | structural | `grep -E "push:|pull_request:" .github/workflows/test.yml` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Requirement Coverage Detail

### e2e-journeys — COVERED (tests/e2e/journeys.spec.ts, 11 tests)

| Test | Assertion | Commit |
|------|-----------|--------|
| Hero primary CTA has href to #investimento | `toHaveAttribute("href", "#investimento")` | 33136a2 |
| Hero ghost CTA has href to #ementa | `toHaveAttribute("href", "#ementa")` | 33136a2 |
| NavBar CTA has href to #investimento | `toHaveAttribute("href", "#investimento")` | 33136a2 |
| #top visible immediately on load | `toBeVisible()` | 33136a2 |
| #metodo scrolls into viewport | `scrollIntoView()` + `toBeInViewport()` | 33136a2 |
| #ementa scrolls into viewport | `scrollIntoView()` + `toBeInViewport()` | 33136a2 |
| #mentor scrolls into viewport | `scrollIntoView()` + `toBeInViewport()` | 33136a2 |
| #investimento scrolls into viewport | `scrollIntoView()` + `toBeInViewport()` | 33136a2 |
| #faq scrolls into viewport | `scrollIntoView()` + `toBeInViewport()` | 33136a2 |
| Sticky CTA present in DOM with href to #investimento | `toBeAttached()` + `toHaveAttribute` | 33136a2 |
| Sticky CTA visible on mobile (375×812) with flex display | `toBeInViewport()` + `getComputedStyle().display !== "none"` | 01e8b8a (fix) |

### e2e-accessibility — COVERED (tests/e2e/accessibility.spec.ts, 5 tests)

| Test | Assertion | Commit |
|------|-----------|--------|
| Tab through 6 elements: ≥2 anchors, no stuck focus | `anchorFocused.length >= 2` + no duplicate sequential text | 01e8b8a |
| Skip link is first focusable element | `firstFocused.includes("skip-link")` | 33136a2 |
| Skip link has href=#main and correct text | `toHaveAttribute("href", "#main")` + `toHaveText("Pular para o conteúdo")` | 33136a2 |
| Activating skip link moves focus to #main | `document.activeElement.id === "main"` | 33136a2 |
| Focused element (second Tab stop) has visible outline | `outlineStyle !== "none"` + `outlineStyle !== ""` + `tagName === "A"` | 01e8b8a (fix) |

### e2e-multi-browser — COVERED (.github/workflows/test.yml)

| Property | Value |
|----------|-------|
| Blocking job | `e2e-chromium` (no `continue-on-error`) |
| Informational job | `e2e-cross-browser` (`continue-on-error: true` at step level) |
| Browsers covered | Chromium, Firefox, WebKit, iPhone 13 (mobile) |
| Cross-browser gates on | `needs: e2e-chromium` (Chromium must pass before cross-browser starts) |

### e2e-ci-every-push — COVERED (.github/workflows/test.yml)

| Trigger | Target |
|---------|--------|
| `push: branches: [main]` | Both e2e jobs run on every push to main |
| `pull_request: branches: [main]` | Both e2e jobs run on every PR targeting main |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Wave 0 stubs were needed — both E2E spec files were created from scratch as part of Phase 2 task execution.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

| Behavior | Why automated sufficient |
|----------|-------------------------|
| CTA href correctness | `toHaveAttribute("href", …)` asserts exact anchor IDs |
| Section reachability via scroll | `scrollIntoView()` + `toBeInViewport()` confirms real viewport position |
| Sticky CTA mobile display | `toBeInViewport()` + computed `display` check at 375×812 viewport |
| Skip link keyboard activation | `keyboard.press("Tab")` + `keyboard.press("Enter")` + `activeElement.id === "main"` |
| Focus outline visibility | `getComputedStyle().outlineStyle` — real computed CSS from headless Chromium |
| CI job blocking behaviour | Structural grep of workflow YAML — verified by code review |

---

## Regression Coverage (Phase 1 Baseline Preserved)

Phase 2 must not regress Phase 1's 14 homepage tests. Verified by:

```
npx playwright test --project=chromium
PASS (30) FAIL (0)
  tests/e2e/homepage.spec.ts: 14 tests PASS  ← Phase 1 baseline
  tests/e2e/journeys.spec.ts: 11 tests PASS  ← Phase 2 journeys
  tests/e2e/accessibility.spec.ts: 5 tests PASS  ← Phase 2 accessibility
```

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (all 3 tasks have verify commands)
- [x] Wave 0: not required — infrastructure pre-existed
- [x] No watch-mode flags in any test commands
- [x] Feedback latency < 60s (Chromium quick run ~45s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-11
