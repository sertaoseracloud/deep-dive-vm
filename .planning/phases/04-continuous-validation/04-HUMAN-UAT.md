---
status: partial
phase: 04-continuous-validation
source: [04-VERIFICATION.md]
started: 2026-05-12T00:00:00Z
updated: 2026-05-12T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Weekly cron fires on schedule

expected: On Sunday midnight UTC (or via workflow_dispatch), the `lighthouse-weekly.yml` workflow triggers automatically, the `lighthouse-weekly` job runs to completion, and `.lighthouseci/*.json` files are committed to the `lhci-results` orphan branch with message `chore: update lhci weekly results [skip ci]` — no follow-on CI loop triggered.

result: [pending]

**Shortcut:** Trigger `workflow_dispatch` immediately from the GitHub Actions UI on the `Weekly Lighthouse Audit` workflow — this is a valid proxy test and does not require waiting for Sunday midnight UTC.

Steps to verify:
1. Go to GitHub Actions → Weekly Lighthouse Audit → Run workflow
2. Confirm the `lighthouse-weekly` job runs to completion (exit 0)
3. Confirm a commit appears on the `lhci-results` branch with `[skip ci]` in the message
4. Confirm no follow-on `Test Suite` run was triggered by that push

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
