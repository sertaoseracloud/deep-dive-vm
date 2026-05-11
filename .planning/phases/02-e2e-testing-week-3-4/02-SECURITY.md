---
phase: "02"
slug: 02-e2e-testing
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-11
---

# Phase 02 — Security (E2E Testing)

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| test runner → browser sandbox | Playwright controls a headless Chromium/Firefox/WebKit browser; scripts executing inside the page cannot escape the sandbox or access the host filesystem | Test assertions only — no credentials, no PII |
| CI runner → npm registry | `npm ci` consumes the lockfile; supply-chain attack surface is identical to all other jobs (unit-and-integration, lighthouse) | Package downloads gated by `package-lock.json` SHA integrity |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-02-01 | Tampering | `test.yml` — `continue-on-error` placement | mitigate | Step-level placement (not job-level) per WR-04 code review finding — swallows test failures only, not infra failures | closed |
| T-02-02 | Denial of Service | Cross-browser job consuming runner minutes on every PR | accept | Non-blocking job; runner cost is low for a static site; no PII or secrets in scope | closed |
| T-02-03 | Information Disclosure | `playwright-report` artifacts contain rendered page HTML | accept | No credentials or PII in landing page DOM; artifacts are scoped to repo and auto-expire | closed |
| T-02-04 | Spoofing | Skip link focus test passes because `tabindex` was added silently | mitigate | `tabindex="-1"` addition documented in SUMMARY.md (§ "tabindex=−1 Addition" and § "DOM Order Fix for Skip Link") | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Threat Evidence

### T-02-01 — CLOSED (Tampering)

**Threat:** Mis-placing `continue-on-error: true` at the wrong YAML level causes either: (a) infrastructure failures being silently swallowed if placed at job level, or (b) test failures propagating incorrectly if the flag is absent.

**Plan-time mitigation:** PLAN.md specified job-level placement.

**Revised mitigation (post code review):** WR-04 finding determined that job-level `continue-on-error` swallows all failures including `npm ci` timeouts and build crashes, making it impossible to distinguish "Firefox flaky" from "runner crashed." The flag was moved to the test **step** only.

**Evidence in implementation:**
```yaml
# .github/workflows/test.yml:53-74
e2e-cross-browser:
  runs-on: ubuntu-latest
  needs: e2e-chromium          # gates on Chromium passing (CR-02 fix)
  steps:
    ...
    - name: E2E tests — Firefox, WebKit, mobile (informational)
      run: npx playwright test --project=firefox --project=webkit --project=mobile
      continue-on-error: true  # ← step level only, not job level
```

Infrastructure steps (`npm ci`, `npm run build`) will still fail the job if they break. Only browser test failures are suppressed.

---

### T-02-02 — CLOSED (Denial of Service / Accepted)

**Threat:** Cross-browser job runs on every push to `main` and every PR, consuming runner-minutes even for trivial commits.

**Acceptance rationale:** This is a static landing page with no auth, no secrets, and no production database. GitHub Actions free tier is sufficient for this workload. The cross-browser job is non-blocking (`continue-on-error: true` at step level) and produces informational reports. Cost vs. benefit favors running it.

**No PII or secrets involved** — confirmed by SUMMARY.md: "No new trust boundary surfaces introduced."

---

### T-02-03 — CLOSED (Information Disclosure / Accepted)

**Threat:** `playwright-report` artifacts uploaded to GitHub Actions contain a rendered snapshot of the page HTML. If the page contained credentials or PII, the artifact would expose them to anyone with repo read access.

**Acceptance rationale:** The landing page is a fully public static marketing page. There are no forms, no user sessions, no auth tokens, and no PII rendered in the DOM. Confirmed by SUMMARY.md: "All files are test infrastructure and CI configuration only."

**Mitigating control:** Artifacts are scoped to the repository (not public internet) and GitHub's default 90-day artifact retention applies. The `lighthouse-report` artifact has an explicit 30-day retention; playwright reports use the default.

---

### T-02-04 — CLOSED (Spoofing)

**Threat:** The skip link keyboard test could be silently made to pass by adding `tabindex="-1"` to `<main>` without documentation, obscuring the accessibility intent.

**Evidence mitigation was applied:** SUMMARY.md (`02-01-SUMMARY.md`) contains two explicit sections:

1. **§ "tabindex=−1 Addition"** — documents the attribute was added, why (WCAG skip-link pattern requires programmatic focus target), and the exact file modified (`src/pages/index.astro`).
2. **§ "DOM Order Fix for Skip Link"** — documents the skip link was moved before `<UrgencyBar />` and `<NavBar />` so it is the first focusable element.

Both changes are committed and attributed to commit `33136a2`. The SUMMARY decisions field also records: `"tabindex=-1 on main#main allows skip link activation to move focus without adding to tab order"`.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-02 | Static site; cross-browser runner cost is negligible; no PII in scope | OpenClaude / gsd-security-auditor | 2026-05-11 |
| AR-02-02 | T-02-03 | Playwright report contains only public marketing page HTML; no credentials or PII | OpenClaude / gsd-security-auditor | 2026-05-11 |

---

## Open Risks (Non-Security)

The following are code quality issues identified in REVIEW.md that are **not security threats** but are noted for completeness:

- **WR-03** (focus-visible test may land on skip link rather than NavBar brand): test passes but may not catch NavBar outline regression. Deferred.
- **IN-02** (UrgencyBar architectural fragility): If UrgencyBar gains a dismiss button, tab order tests will need updating. Deferred.
- **IN-03** (`workers: 1` in CI): Performance concern, not security. Deferred.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-11 | 4 | 4 | 0 | gsd-security-auditor (via gsd-secure-phase) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-11
