---
phase: "04"
slug: 04-continuous-validation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-11
updated: 2026-05-12
---

# Phase 04 — Validation Strategy (Continuous Validation)

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 + @vitest/coverage-v8 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run test:all && npm run build && npx lhci autorun` |
| **Estimated runtime** | ~10 seconds (unit) / ~3 minutes (full with LHCI) |

---

## Sampling Rate

- **After every task commit:** `npm run test:unit`
- **After every plan wave:** `npm run build && npx lhci autorun`
- **Before `/gsd-verify-work`:** Full suite green + LHCI exit 0
- **Max feedback latency:** ~10 seconds (unit quick run)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | D-01, D-02, D-03 | CI exits non-zero when coverage < 95% on any metric | config | `npm run test:unit` (expect exit 1 if below threshold) | ✅ `vitest.config.ts` | ⬜ pending |
| 04-02-01 | 02 | 1 | D-07, D-08 | shields.io badge JSON committed to `badges` branch after CI run | integration | `git show badges:badges/coverage.json` | ❌ W0: `badges` branch must be pre-created | ⬜ pending |
| 04-03-01 | 03 | 1 | D-04, D-05, D-06 | Weekly cron workflow file present; cron trigger correct | config | `cat .github/workflows/lighthouse-weekly.yml` | ❌ W0: file created in this task | ⬜ pending |
| 04-04-01 | 04 | 2 | D-10, D-11, D-12, D-13 | LHCI uploads to `.lighthouseci/` (filesystem); JSON committed to main with `[skip ci]` | integration | `node -e "const c=require('./.lighthouserc.json');if(c.ci.upload.target!=='filesystem')throw 1;console.log('ok')"` | ✅ no extra packages needed (filesystem path) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `badges` git branch — orphan branch must be pre-created with seed `badges/coverage.json` before CI badge step runs (Plan 04-02 Task 1)
- [ ] `[skip ci]` convention — machine commits (badge push to `badges`, LHCI JSON push to `main`) must include `[skip ci]` to avoid infinite CI loops (D-13 hard rule)

*No extra npm packages or GitHub secrets are required — the `filesystem` JSON target (D-10) needs none.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Status |
|----------|-------------|------------|--------|
| shields.io badge renders correctly in README | D-07, D-08 | Visual check — badge URL must resolve to correct color/value | ⬜ pending |
| LHCI dashboard shows historical runs | D-10 | Web UI for SQLite server requires browser check | ⬜ pending |
| Weekly cron fires on schedule | D-04 | GitHub Actions schedule triggers can only be confirmed by waiting for Sunday midnight UTC | ⬜ pending |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (`badges` branch only — no LHCI server packages or secrets needed)
- [x] No watch-mode flags in any test commands
- [x] Feedback latency < 15s (unit quick run)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-05-12
