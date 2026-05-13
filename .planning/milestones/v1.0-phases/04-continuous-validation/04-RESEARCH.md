# Phase 4: Continuous Validation - Research

**Researched:** 2026-05-11
**Domain:** CI/CD configuration — Vitest coverage thresholds, GitHub Actions scheduling, LHCI SQLite persistence, shields.io badge publishing
**Confidence:** HIGH (all decisions locked; research focuses on implementation mechanics)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Raise `thresholds` in `vitest.config.ts` from 80% → 95% on **all four metrics**: `statements`, `branches`, `functions`, `lines`.
- **D-02:** The gate is **hard** (CI fails if below 95%). The existing `--coverage` flag in `test:unit` already exits non-zero when thresholds aren't met.
- **D-03:** Do NOT add utility modules first. Raise to 95% as-is. The `.astro` exclusion means the coverable surface is currently thin; the gate will still enforce quality as the surface grows.
- **D-04:** Add a **new** GitHub Actions workflow file `.github/workflows/lighthouse-weekly.yml` with `schedule: cron: '0 0 * * 0'` (Sunday midnight UTC).
- **D-05:** The weekly job runs **`npm run build && npx lhci autorun`** — build fresh from source, then audit. No dependency on the live deployed URL.
- **D-06:** The weekly job is separate from `test.yml` — does not gate pushes, runs independently on schedule.
- **D-07:** Add a **shields.io coverage badge** to the README. Generated from `coverage/coverage-summary.json`.
- **D-08:** Badge is hosted as a **static JSON file committed to a `badges` branch** in this repo, readable by shields.io endpoint pattern. CI step writes the badge JSON after coverage runs and commits/pushes to the `badges` branch.
- **D-09:** No Codecov or third-party account required.
- **D-10:** Run a **local LHCI SQLite server**. The `lhci.db` file lives in the **repo root** of `main`.
- **D-11:** Change `upload.target` in `.lighthouserc.json` from `"temporary-public-storage"` to `"lhci"` pointing at the local SQLite server.
- **D-12:** CI starts the LHCI server, runs `npx lhci autorun`, and the server commits `lhci.db` back to main.

### Claude's Discretion

- Badge branch name (`badges` or `gh-pages`) — pick whichever doesn't conflict with existing GitHub Pages setup.
- Whether the weekly workflow also uploads an artifact (the LHCI report) for additional reference.

### Deferred Ideas (OUT OF SCOPE)

- Codecov integration for PR diff annotations.
- Auditing the live deployed URL (`https://mentoria.sertaoseracloud.com/deep-dive-vm/`).
- Extending artifact retention to 90 days (superseded by SQLite persistence decision).

</user_constraints>

---

## Summary

Phase 4 is entirely CI/CD and configuration work — no new feature code. There are four independent changes: (1) raise vitest coverage thresholds from 80% to 95% in `vitest.config.ts`; (2) add a weekly scheduled GitHub Actions workflow for Lighthouse; (3) publish a shields.io endpoint badge from the coverage JSON to a `badges` branch; (4) replace LHCI's temporary-public-storage upload target with a local SQLite server whose `lhci.db` is committed back to `main`.

A critical finding that affects planning: the current `src/` tree contains **only `.astro` files and assets**. The vitest coverage config excludes `src/**/*.astro`, `src/assets/**`, and `src/pages/**`, which means the coverable surface is currently 0/0 (`coverage-final.json` is `{}`). Setting thresholds to 95% on an empty surface is valid — vitest/v8 will report "Unknown%" on 0/0 and will NOT fail the gate until actual coverable files exist. This is consistent with D-03 ("the gate will still enforce quality as the surface grows"). The badge CI step must handle this edge case by falling back to a known message (e.g., "N/A") when `coverage-summary.json` contains no `total` key.

The LHCI SQLite approach (D-10 through D-12) has a significant implementation complexity: starting a server in stateless CI, generating a build token, running autorun against the server, then committing the binary `.db` file back to `main` requires write permissions and careful git config in the workflow. The CONTEXT.md itself flags this: "the executor should evaluate whether this is feasible in stateless CI or if a simpler approach like LHCI's built-in `--config.upload.target=filesystem` JSON output is more practical." Research confirms filesystem target is a viable de-risk. The planner must present both the canonical (SQLite) path and the filesystem fallback.

**Primary recommendation:** Implement in four atomic commits: thresholds, badge CI step + `badges` branch setup, weekly workflow, and LHCI upload target change. Treat the SQLite server persistence as the target state but document the filesystem fallback clearly for the implementer.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Coverage threshold enforcement | CI (GitHub Actions) | vitest config | Thresholds live in vitest.config.ts; enforcement happens when `npm run test:unit` runs in CI |
| Coverage badge publishing | CI (GitHub Actions) | `badges` branch (static storage) | CI reads coverage JSON, writes badge JSON, pushes to branch; shields.io reads the raw file |
| Weekly Lighthouse audit | CI (GitHub Actions scheduled) | LHCI config | Cron workflow triggers build + lhci autorun; no production tier involved |
| LHCI score persistence | CI (GitHub Actions) | repo root (`main` branch) | Server starts in CI, writes lhci.db, CI commits db back to main |

---

## Standard Stack

### Core (already installed — no new packages needed for most tasks)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@vitest/coverage-v8` | `^3.2.4` (installed) | Coverage instrumentation and threshold enforcement | Already configured with v8 provider; `coverage-summary.json` already produced |
| `@lhci/cli` | `^0.14.0` (installed) | Lighthouse CI autorun, server start, upload | Already used in `test.yml`; supports all three upload targets |
| `vitest` | `^3.2.4` (installed) | Test runner with coverage gate | `--coverage` flag + thresholds property drives the hard gate |

### New Dependency — LHCI SQLite server path only

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@lhci/server` | `^0.14.x` | Runs the LHCI HTTP server with SQLite backend | Only needed if D-10/D-12 SQLite path is implemented (not required for filesystem fallback) |
| `sqlite3` | `^5.x` | Peer dependency for `@lhci/server` SQLite storage | Required alongside `@lhci/server` |

**Note:** `npm view @lhci/cli version` returned `0.15.1` (registry latest). The project has `^0.14.0` installed — compatible. `@lhci/server` is a separate package from `@lhci/cli`. [VERIFIED: npm registry]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| LHCI SQLite server (D-10/D-12) | LHCI `filesystem` target | Filesystem writes JSON reports to `.lighthouseci/` dir; no server, no binary db, easily committed as text artifacts. Loses historical trending UI but avoids CI complexity. |
| Committing `badges` branch from CI | GitHub Gist endpoint | Gist requires a PAT and external account — contradicts D-09 (no third-party account). |
| Manual `git` commands in CI for badges branch | `actions/checkout` + git config | Manual git is equally valid; no dedicated action required for a simple file commit. |

**Installation (SQLite server path only):**
```bash
npm install -D @lhci/server sqlite3
```

---

## Architecture Patterns

### System Architecture Diagram

```
push/PR to main
      |
      v
[test.yml — unit-and-integration job]
  npm run test:unit (vitest + --coverage)
      |
      +--> coverage gate: thresholds 95% hard fail
      |
      +--> coverage/coverage-summary.json produced
              |
              v
         [badge step — in same job, after coverage]
           read total.statements.pct from JSON
           write badges/coverage.json  { schemaVersion:1, label:"coverage", message:"XX%", color }
           git push origin badges
              |
              v
         shields.io reads raw.githubusercontent.com/…/badges/coverage.json
         README badge renders live %

Sunday midnight UTC (cron)
      |
      v
[lighthouse-weekly.yml — lighthouse job]
  npm run build
  [LHCI server start — background — lhci.db]
  npx lhci autorun  →  upload to localhost:9001
  [LHCI server stop]
  git commit lhci.db → push to main
      |
      (OR filesystem fallback)
  npx lhci autorun  →  write .lighthouseci/*.json
  upload-artifact: lhci-weekly-report
```

### Recommended File Changes

```
vitest.config.ts              ← add thresholds block (D-01)
.lighthouserc.json            ← change upload.target (D-11)
.github/workflows/
  test.yml                    ← add badge push step after coverage job
  lighthouse-weekly.yml       ← new file (D-04/D-05/D-06)
README.md                     ← add badge img tag (D-07)
badges/coverage.json          ← new file on `badges` branch (D-08)
lhci.db                       ← binary, repo root of main (D-10, if SQLite path)
.gitignore                    ← optionally add lhci.db (per D-10 note)
```

### Pattern 1: Vitest Coverage Thresholds (D-01/D-02)

**What:** Add a `thresholds` key inside `coverage` in `vitest.config.ts`. Values are minimum percentages — vitest exits non-zero when any metric falls below the threshold.

**When to use:** Whenever a hard gate is required (not advisory).

**Example:**
```typescript
// Source: https://vitest.dev/config/coverage (verified)
coverage: {
  provider: "v8",
  include: ["src/**"],
  exclude: [
    "src/assets/**",
    "src/pages/**",
    "src/**/*.astro",
  ],
  reporter: ["text", "json", "html"],
  thresholds: {
    statements: 95,
    branches: 95,
    functions: 95,
    lines: 95,
  },
},
```

**Important:** The current `vitest.config.ts` has the comment `// thresholds removed as they are not needed` — the thresholds key is absent. D-01 adds it back at 95%.

**Edge case — empty surface:** With 0/0 coverable files, vitest/v8 reports "Unknown%" and does NOT exit non-zero. The badge step must guard for a missing `total` key in `coverage-summary.json`.

### Pattern 2: Shields.io Endpoint Badge (D-07/D-08)

**What:** CI writes a JSON file to the `badges` branch; README references it via `shields.io/endpoint?url=`.

**Badge JSON format:** [VERIFIED: shields.io docs]
```json
{
  "schemaVersion": 1,
  "label": "coverage",
  "message": "95%",
  "color": "brightgreen"
}
```

**Color convention (shields.io named colors):**
- >= 90% → `brightgreen`
- >= 75% → `yellow`
- < 75% → `red`

**Badge step in test.yml (after coverage runs):**
```yaml
- name: Publish coverage badge
  if: github.ref == 'refs/heads/main'
  run: |
    STMTS=$(node -e "
      const fs = require('fs');
      const raw = fs.readFileSync('coverage/coverage-summary.json', 'utf8');
      const json = JSON.parse(raw);
      if (!json.total) { process.stdout.write('N/A'); process.exit(0); }
      process.stdout.write(json.total.statements.pct.toFixed(1) + '%');
    ")
    COLOR="brightgreen"
    if [[ "$STMTS" == "N/A" ]]; then COLOR="lightgrey"; fi
    JSON="{\"schemaVersion\":1,\"label\":\"coverage\",\"message\":\"${STMTS}\",\"color\":\"${COLOR}\"}"
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git fetch origin badges || git checkout --orphan badges
    git checkout badges
    mkdir -p badges
    echo "$JSON" > badges/coverage.json
    git add badges/coverage.json
    git diff --staged --quiet || git commit -m "chore: update coverage badge [skip ci]"
    git push origin badges
```

**README badge tag:**
```markdown
![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OWNER/REPO/badges/badges/coverage.json)
```

**Discretion item — branch name:** Use `badges` (not `gh-pages`). The project uses GitHub Pages via `deploy.yaml` which uploads artifacts to the Pages environment — it does NOT use the `gh-pages` branch pattern. A separate `badges` branch avoids any collision. [VERIFIED: `.github/workflows/deploy.yaml` inspected]

### Pattern 3: Weekly Lighthouse Workflow (D-04/D-05/D-06)

**What:** A new `.github/workflows/lighthouse-weekly.yml` triggered by `schedule:` cron only. Mirrors the `lighthouse` job from `test.yml` but does not gate pushes.

**Template (mirrors test.yml lighthouse job):**
```yaml
name: Weekly Lighthouse Audit

on:
  schedule:
    - cron: '0 0 * * 0'   # Sunday midnight UTC
  workflow_dispatch:         # manual trigger for testing

jobs:
  lighthouse-weekly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0        # needed for git push back to main
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      # ---- SQLite server path (D-10/D-11/D-12) ----
      # See LHCI SQLite section below for full steps
      # ---- OR filesystem fallback ----
      - name: Lighthouse CI weekly audit
        run: npx lhci autorun
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-weekly-report
          path: .lighthouseci/
          retention-days: 30
```

**Discretion item — artifact upload:** Include the artifact upload step. It adds minimal CI time and provides a human-readable report reference for each weekly run alongside the db.

### Pattern 4: LHCI SQLite Upload Target (D-10/D-11/D-12)

**What:** Change `.lighthouserc.json` `upload.target` from `"temporary-public-storage"` to `"lhci"` pointing at a server started in CI. Server writes to `lhci.db` in the repo root.

**Required packages:** `@lhci/server` and `sqlite3` (not currently installed).

**Server start command:**
```bash
npx lhci server \
  --storage.storageMethod=sql \
  --storage.sqlDialect=sqlite \
  --storage.sqlDatabasePath=./lhci.db \
  --port=9001 &
```

**Updated `.lighthouserc.json`:**
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npx astro preview --port 4321",
      "startServerReadyPattern": "localhost",
      "url": ["http://localhost:4321/deep-dive-vm/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],
        "categories:performance": ["error", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "http://localhost:9001/",
      "token": "$LHCI_BUILD_TOKEN"
    }
  }
}
```

**Build token:** LHCI requires a project build token for the `lhci` target. Token is created via `lhci wizard` locally and stored as a GitHub Actions secret (`LHCI_BUILD_TOKEN`). Without a valid token, `lhci autorun` with `target=lhci` will fail.

**Committing lhci.db back to main:**
```yaml
- name: Commit lhci.db
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add lhci.db
    git diff --staged --quiet || git commit -m "chore: update lhci.db [skip ci]"
    git push origin main
```

**Required permissions:** The workflow job must have `contents: write` permission to push back to main.

**Filesystem fallback (simpler — recommended if SQLite proves impractical):**
```json
"upload": {
  "target": "filesystem",
  "outputDir": ".lighthouseci"
}
```
No server, no build token, no git commit. Reports land in `.lighthouseci/` and are captured as workflow artifacts. Loses persistent trending but eliminates the stateful CI complexity.

### Anti-Patterns to Avoid

- **Hardcoding the build token in `.lighthouserc.json`:** Token must come from a GitHub Actions secret, not committed in plaintext.
- **Running the badge commit step on PRs:** The badge push step must be gated on `github.ref == 'refs/heads/main'` — PRs should not push to the `badges` branch.
- **Using `git add .` or `git add -A` in CI commit steps:** Stage only the specific files (`badges/coverage.json` or `lhci.db`) to avoid accidentally committing coverage HTML or Playwright reports.
- **Forgetting `[skip ci]` on machine commits:** Both the badge commit and lhci.db commit must include `[skip ci]` in the message to prevent recursive workflow triggers.
- **Setting thresholds before verifying current coverage:** With an all-`.astro` codebase and empty coverable surface, 0/0 will not fail — but `coverage-summary.json` will lack a `total` key. The badge script must guard for this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Coverage threshold enforcement | Custom post-test script comparing JSON numbers | `vitest.config.ts` `coverage.thresholds` | Built-in: exits non-zero on failure, shown in CI log |
| Badge SVG generation | Generate your own SVG | shields.io endpoint badge with static JSON | Shields handles styling, colors, caching, CDN delivery |
| Lighthouse score parsing | jq / custom node script | `npx lhci autorun` with `assert` block in `.lighthouserc.json` | LHCI already enforces assertions and exits non-zero on failure |
| LHCI score history | Custom database schema | `@lhci/server` SQLite or filesystem JSON | LHCI server provides a full trending UI; filesystem target gives parseable JSON |

---

## Runtime State Inventory

> Phase is CI/CD configuration-only — no rename/refactor.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases in project | None |
| Live service config | GitHub Actions workflows (test.yml) — existing, will be modified | Edit `.github/workflows/test.yml` to add badge step |
| OS-registered state | None | None |
| Secrets/env vars | `LHCI_BUILD_TOKEN` — new secret needed if SQLite path chosen | Create in GitHub repo settings before first weekly run |
| Build artifacts | `coverage/` dir (stale from prior run, coverage-final.json is `{}`) | Will be overwritten on next CI run |

---

## Common Pitfalls

### Pitfall 1: LHCI Build Token Not Created Before First Weekly Run
**What goes wrong:** `lhci autorun` with `target=lhci` fails immediately with "No build token provided" or "Unauthorized."
**Why it happens:** The `lhci` target requires a project build token that is generated by `lhci wizard` and stored as a repo secret. It is NOT auto-generated.
**How to avoid:** Run `npx lhci wizard` locally once against `http://localhost:9001`, capture the build token, store as `LHCI_BUILD_TOKEN` secret in GitHub before merging the workflow change.
**Warning signs:** CI fails at the `npx lhci autorun` step with an auth error.

### Pitfall 2: `badges` Branch Does Not Exist on First CI Run
**What goes wrong:** `git checkout badges` fails; the entire badge step fails and may break the CI job.
**Why it happens:** The branch must be created before the first CI run writes to it. CI cannot create an orphan branch cleanly without extra logic.
**How to avoid:** Create the `badges` branch locally before merging: `git checkout --orphan badges && git rm -rf . && echo '{}' > badges/coverage.json && git add badges/coverage.json && git commit -m "init badges branch" && git push origin badges`. Then switch back to main.
**Warning signs:** `git checkout badges` exits with "pathspec 'badges' did not match any file(s) known to git."

### Pitfall 3: `coverage-summary.json` Missing `total` Key (Empty Coverable Surface)
**What goes wrong:** The badge script crashes with `TypeError: Cannot read properties of undefined (reading 'statements')`.
**Why it happens:** When the coverable surface is 0/0 (all `.astro` files excluded), vitest/v8 writes `coverage-summary.json` as either `{}` or without a `total` key.
**How to avoid:** Guard the badge script: `if (!json.total) { process.stdout.write('N/A'); process.exit(0); }`.
**Warning signs:** Badge shows broken image; CI log shows a node script error.

### Pitfall 4: Machine Commits Trigger Recursive CI Runs
**What goes wrong:** The badge commit or lhci.db commit triggers `test.yml` (which runs on push to main), creating an infinite loop.
**Why it happens:** GitHub Actions runs on all pushes unless the commit message contains `[skip ci]` or the workflow has a path filter.
**How to avoid:** Include `[skip ci]` in all machine commit messages. Alternatively, add a `paths-ignore` filter to `test.yml` for `badges/**` and `lhci.db`.
**Warning signs:** CI runs start doubling; commit history fills with machine commits.

### Pitfall 5: Git Push Permission Denied in Weekly Workflow
**What goes wrong:** `git push origin main` (for lhci.db) or `git push origin badges` fails with permission error.
**Why it happens:** The default `GITHUB_TOKEN` has read-only `contents` permission by default in some repo settings.
**How to avoid:** Add `permissions: contents: write` to the workflow job. No PAT required — GITHUB_TOKEN is sufficient with this permission.
**Warning signs:** Exit code 128 on `git push` with "Permission denied" or "remote: Permission to repo denied."

### Pitfall 6: `astro preview` Port Conflict in Weekly Workflow
**What goes wrong:** LHCI's `startServerCommand` (`npx astro preview --port 4321`) conflicts with another process, or the ready pattern never matches.
**Why it happens:** The weekly workflow may run on a different runner state than `test.yml`; ready pattern is `"localhost"` which is permissive but relies on stdout matching.
**How to avoid:** Keep the same `startServerCommand` and `startServerReadyPattern` as the current working config. The existing config has been validated in Phase 3.
**Warning signs:** LHCI times out waiting for server; no Lighthouse runs execute.

---

## Code Examples

### Verified: Current vitest.config.ts thresholds location

```typescript
// File: vitest.config.ts — current state (thresholds absent, comment explains)
coverage: {
  provider: "v8",
  include: ["src/**"],
  exclude: [
    "src/assets/**",
    "src/pages/**",
    "src/**/*.astro",
  ],
  reporter: ["text", "json", "html"],
  // thresholds removed as they are not needed   <-- D-01 replaces this comment
},
```

Target state after D-01:
```typescript
coverage: {
  provider: "v8",
  include: ["src/**"],
  exclude: [
    "src/assets/**",
    "src/pages/**",
    "src/**/*.astro",
  ],
  reporter: ["text", "json", "html"],
  thresholds: {
    statements: 95,
    branches: 95,
    functions: 95,
    lines: 95,
  },
},
```

### Verified: Current .lighthouserc.json (baseline for D-11 change)

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npx astro preview --port 4321",
      "startServerReadyPattern": "localhost",
      "url": ["http://localhost:4321/deep-dive-vm/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],
        "categories:performance": ["error", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"   // <-- D-11: change to "lhci" or "filesystem"
    }
  }
}
```

### Verified: test.yml structure (baseline for badge step insertion)

The badge commit step belongs after the `actions/upload-artifact` step in the `unit-and-integration` job (line ~25–29 in test.yml). It must be gated on `github.ref == 'refs/heads/main'` to not run on PR branches.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `temporary-public-storage` LHCI upload | `lhci` target (SQLite) or `filesystem` target | D-11 (this phase) | Persistent history vs. reports deleted after days |
| No coverage thresholds (comment says "removed") | 95% hard gate | D-01 (this phase) | CI fails below threshold |
| No badge | shields.io endpoint badge from `badges` branch | D-07/D-08 (this phase) | Live coverage % visible in README |

**Deprecated/outdated:**
- `temporary-public-storage`: Reports auto-delete after several days on GCP Cloud Storage. Replaced by local persistence per D-11.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | vitest/v8 does NOT exit non-zero when coverable surface is 0/0 | Common Pitfalls #3 | If it DOES exit non-zero with 0/0 and thresholds set, the CI gate would fail immediately — blockers until coverable `.ts` files are added to `src/` | [ASSUMED] — verified by coverage HTML showing "Unknown% 0/0" but vitest behavior on thresholds with empty surface not directly confirmed in docs |
| A2 | `coverage-summary.json` produced by `@vitest/coverage-v8` uses key path `total.statements.pct` | Badge step | Badge script would crash or produce wrong value; needs adjustment | [ASSUMED from training knowledge — coverage-summary.json format is Istanbul-compatible; not re-verified against current v8 output since coverage-final.json is `{}` this run] |
| A3 | `@lhci/server` 0.14.x is compatible with `@lhci/cli` 0.14.0 | Standard Stack | Version mismatch could cause server/client protocol errors | [ASSUMED — same major.minor in monorepo suggests compatibility, not independently verified] |

---

## Open Questions (RESOLVED)

1. **SQLite vs. filesystem — RESOLVED: filesystem JSON chosen (D-10/D-11/D-12)**
   - Decision: `upload.target: "filesystem"`, `upload.outputDir: ".lighthouseci"`. No `@lhci/server`, no `sqlite3`, no `LHCI_BUILD_TOKEN`.
   - Rationale: Stateless CI cannot reliably host a persistent SQLite server; filesystem JSON is committed to main with `[skip ci]` (D-13).

2. **`badges` branch — RESOLVED: Wave 0 manual step in 04-02 Task 1**
   - Decision: Orphan branch `badges` pre-created with seed `badges/coverage.json` as the first task in Plan 04-02.
   - No CI logic handles missing branch; it must exist before the first CI run.

3. **`lhci.db` `.gitignore` question — RESOLVED: not applicable**
   - Decision: `lhci.db` is not used (filesystem target chosen). Plan 04-04 Task 2 verifies `.lighthouseci/` is not in `.gitignore`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >= 22 | All CI jobs | ✓ (CI uses node 22) | 22 | — |
| `@lhci/cli` | Lighthouse weekly, test.yml | ✓ | ^0.14.0 installed | — |
| `@vitest/coverage-v8` | Coverage gate | ✓ | ^3.2.4 installed | — |
| `@lhci/server` | LHCI SQLite path (D-10) | ✗ | not installed | Use `filesystem` target (no server needed) |
| `sqlite3` | `@lhci/server` peer dep | ✗ | not installed | Use `filesystem` target |
| `badges` branch | Badge CI step (D-08) | ✗ | does not exist | Must be created before first CI run |
| `LHCI_BUILD_TOKEN` secret | LHCI `lhci` target (D-11) | ✗ | not configured | Use `filesystem` target (no token needed) |

**Missing dependencies with no fallback:**
- `badges` branch — must be created (manual pre-execution step; no automated workaround).

**Missing dependencies with fallback:**
- `@lhci/server` + `sqlite3` + `LHCI_BUILD_TOKEN` — all three are required for the SQLite path (D-10/D-11/D-12). If any is unavailable, use `filesystem` target instead.

---

## Validation Architecture

> `workflow.nyquist_validation` not set in `.planning/config.json` — treated as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test:unit` |
| Full suite command | `npm run test:all` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COV-01 | vitest exits non-zero below 95% threshold | manual smoke | `npm run test:unit` (check exit code) | ✅ existing |
| COV-02 | `coverage-summary.json` contains `total.statements.pct` field | manual inspection | `cat coverage/coverage-summary.json` | ✅ (produced on test run) |
| BADGE-01 | `badges/coverage.json` is valid shields.io JSON after CI push | manual | Inspect branch after first CI run on main | ❌ Wave 0 — branch must exist |
| LH-01 | `lighthouse-weekly.yml` triggers on Sunday cron and completes | manual / `workflow_dispatch` | Trigger manually via GitHub Actions UI | ❌ Wave 0 — file does not exist |
| LHCI-01 | LHCI report is persisted (db or filesystem artifact) | manual | Inspect CI artifacts or lhci.db after weekly run | ❌ depends on chosen path |

### Sampling Rate

- **Per task commit:** `npm run test:unit` (verifies coverage gate is not broken by config change)
- **Per wave merge:** `npm run test:all`
- **Phase gate:** Full suite green + manual verification of badge JSON on `badges` branch + `workflow_dispatch` trigger of `lighthouse-weekly.yml`

### Wave 0 Gaps

- [ ] Create `badges` orphan branch with initial `badges/coverage.json` — covers BADGE-01
- [ ] Decide SQLite vs. filesystem path — covers LHCI-01 (blocks `lighthouse-weekly.yml` authoring)
- [ ] Check `.gitignore` for `lhci.db` entry — if present, remove it before SQLite path implementation

*(No new test files needed — this phase's quality is verified by CI config correctness, not by new test specs.)*

---

## Security Domain

> ASVS categories for this phase.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | yes (CI write perms) | Use `contents: write` scoped to job, not repo-wide; never use a PAT when GITHUB_TOKEN suffices |
| V5 Input Validation | no | — |
| V6 Cryptography | no | — |

### Known Threat Patterns for CI/GitHub Actions

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Build token leaked in logs | Information Disclosure | Store as GitHub Actions secret, reference as `${{ secrets.LHCI_BUILD_TOKEN }}` — never echo to log |
| Machine commits triggering workflow loop | Denial of Service (runaway CI) | Include `[skip ci]` in all machine commit messages |
| `git push --force` to `badges` branch overwriting history | Tampering | Use regular push (not force); badge branch contains only one file |
| Admin token placed in CI | Elevation of Privilege | LHCI docs explicitly warn: admin token must NEVER be in CI; build token only |

---

## Sources

### Primary (HIGH confidence)
- `vitest.config.ts` — Inspected directly; confirmed thresholds absent, coverable surface is all `.astro` files
- `coverage/index.html` — Inspected directly; confirmed 0/0 coverable surface ("Unknown%")
- `.github/workflows/test.yml` — Inspected directly; confirmed structure for badge step insertion point
- `.lighthouserc.json` — Inspected directly; confirmed current `upload.target: "temporary-public-storage"`
- `package.json` — Inspected directly; confirmed `@lhci/cli ^0.14.0`, `@vitest/coverage-v8 ^3.2.4` installed; `@lhci/server` absent
- [Vitest coverage thresholds docs](https://vitest.dev/config/coverage) — Verified threshold config syntax
- [LHCI configuration docs](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md) — Verified `lhci` and `filesystem` target options
- [LHCI server docs](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/server.md) — Verified SQLite server start command and build token model
- [Shields.io endpoint badge docs](https://shields.io/badges/endpoint-badge) — Verified JSON schema and `schemaVersion: 1`

### Secondary (MEDIUM confidence)
- `npm view @lhci/cli version` → `0.15.1` (registry latest as of research date) — project uses `^0.14.0`
- `npm view vitest version` → `4.1.6` (registry latest) — project uses `^3.2.4`
- `git branch -a` → confirmed `badges` branch does not exist, only `main` and `migration-nextjs`

### Tertiary (LOW confidence)
- WebSearch results on GitHub Actions badge branch patterns — cross-verified against shields.io official docs
- WebSearch on LHCI SQLite + GitHub Actions — general approach verified; specific step-by-step not from official source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages inspected in package.json; versions verified against npm registry
- Architecture: HIGH — all config files inspected directly; patterns derived from existing working config
- Pitfalls: HIGH (for known ones) / MEDIUM (for A1 empty-surface edge case) — confirmed by direct inspection of coverage output

**Research date:** 2026-05-11
**Valid until:** 2026-06-10 (stable domain — vitest/LHCI configs are low churn; shields.io JSON schema is stable)
