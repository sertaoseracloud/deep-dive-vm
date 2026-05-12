# Phase 4: Continuous Validation - Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 6 new/modified files
**Analogs found:** 5 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `vitest.config.ts` | config | batch | `vitest.config.ts` (self — modify existing) | exact (self-modification) |
| `.lighthouserc.json` | config | request-response | `.lighthouserc.json` (self — modify existing) | exact (self-modification) |
| `.github/workflows/lighthouse-weekly.yml` | config (CI workflow) | event-driven (cron) | `.github/workflows/test.yml` lighthouse job (lines 76–97) | role-match |
| `.github/workflows/test.yml` | config (CI workflow) | event-driven (push/PR) | `.github/workflows/test.yml` (self — append step) | exact (self-modification) |
| `README.md` | config (documentation) | — | `README.md` (self — append badge line) | exact (self-modification) |
| `badges/coverage.json` | config (static data) | request-response | none — first static JSON on orphan branch | no analog |

---

## Pattern Assignments

### `vitest.config.ts` (config, batch)

**Analog:** `vitest.config.ts` — self-modification of the existing `coverage` block.

**Current state** (lines 30–41) — read from file:
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
      // thresholds removed as they are not needed
    },
```

**Target state — replace the comment on line 39 with the thresholds block:**
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

**Change scope:** Single-property addition. Replace line 39 (`// thresholds removed as they are not needed`) with the `thresholds` object above. No other lines change.

**Edge case:** With an all-`.astro` coverable surface (currently 0/0), vitest/v8 reports "Unknown%" and does NOT exit non-zero. The gate is valid and will enforce quality as coverable `.ts` files are added.

---

### `.lighthouserc.json` (config, request-response)

**Analog:** `.lighthouserc.json` — self-modification of the `upload` block.

**Current state** (lines 17–19) — read from file:
```json
    "upload": {
      "target": "temporary-public-storage"
    }
```

**Target state (filesystem path — D-10/D-11 as decided in CONTEXT.md):**
```json
    "upload": {
      "target": "filesystem",
      "outputDir": ".lighthouseci"
    }
```

**Change scope:** Replace lines 17–19 only. The `collect` and `assert` blocks are unchanged.

**Note on SQLite path:** RESEARCH.md documents the full SQLite server path (D-10 original) but CONTEXT.md D-11 canonically specifies `filesystem` with `outputDir: ".lighthouseci"`. CONTEXT.md supersedes RESEARCH.md where they differ — use `filesystem`.

**No `.gitignore` entry needed:** `.lighthouseci/` is not in `.gitignore`. The result `.json` files must be committed (per D-12). Only transient lock files should be ignored if they appear.

---

### `.github/workflows/lighthouse-weekly.yml` (config, event-driven — cron)

**Analog:** `.github/workflows/test.yml` — `lighthouse` job (lines 76–97).

**Analog excerpt — lighthouse job from test.yml** (lines 76–97):
```yaml
  lighthouse:
    runs-on: ubuntu-latest
    needs: unit-and-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - name: SEO static tests
        run: npx vitest run tests/seo
      - name: Lighthouse CI (SEO >= 90)
        run: npx lhci autorun
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-report
          path: .lighthouseci/
          retention-days: 30
```

**Trigger pattern — from deploy.yaml** (lines 6–7, discretion reference):
```yaml
  workflow_dispatch: # Allows manual trigger from Actions tab
```

**Target file — copy and adapt the lighthouse job pattern:**
```yaml
name: Weekly Lighthouse Audit

on:
  schedule:
    - cron: '0 0 * * 0'   # Sunday midnight UTC
  workflow_dispatch:        # manual trigger for testing

permissions:
  contents: write            # required for git push of .lighthouseci/ JSON

jobs:
  lighthouse-weekly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0    # needed if committing results back to main
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - name: Lighthouse CI weekly audit
        run: npx lhci autorun
      - name: Commit LHCI filesystem results
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .lighthouseci/
          git diff --staged --quiet || git commit -m "chore: update lhci results [skip ci]"
          git push origin main
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-weekly-report
          path: .lighthouseci/
          retention-days: 30
```

**Key differences from test.yml lighthouse job:**
- `on:` uses `schedule:` + `workflow_dispatch:` instead of `push:`/`pull_request:`
- No `needs:` dependency (standalone job)
- `permissions: contents: write` added for git push
- `actions/checkout@v4` gets `fetch-depth: 0` and explicit `token:`
- Machine commit step added with `[skip ci]` — mandatory per D-13
- SEO static tests step omitted (redundant in weekly; gatekeeping happens in test.yml)
- Artifact upload retained (discretion decision: include for human-readable report reference)

---

### `.github/workflows/test.yml` (config, event-driven — push/PR)

**Analog:** `.github/workflows/test.yml` — self-modification, append badge step after the `upload-artifact` step in `unit-and-integration` job.

**Insertion point** (after line 30, after the coverage artifact upload step):
```yaml
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
```

**Step to append immediately after (new lines 31–53):**
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
          PCT=${STMTS//%/}
          if [[ "$STMTS" != "N/A" ]] && (( $(echo "$PCT < 75" | bc -l) )); then COLOR="red"
          elif [[ "$STMTS" != "N/A" ]] && (( $(echo "$PCT < 90" | bc -l) )); then COLOR="yellow"; fi
          JSON="{\"schemaVersion\":1,\"label\":\"coverage\",\"message\":\"${STMTS}\",\"color\":\"${COLOR}\"}"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git fetch origin badges
          git checkout badges
          mkdir -p badges
          echo "$JSON" > badges/coverage.json
          git add badges/coverage.json
          git diff --staged --quiet || git commit -m "chore: update coverage badge [skip ci]"
          git push origin badges
          git checkout main
```

**Guard conditions:**
- `if: github.ref == 'refs/heads/main'` — PRs must NOT push to `badges` branch (anti-pattern from RESEARCH.md)
- `if (!json.total)` — handles empty coverable surface producing `{}` in `coverage-summary.json`
- `[skip ci]` in commit message — mandatory per D-13

**Job-level permissions note:** The `unit-and-integration` job does not currently declare `permissions`. Adding `contents: write` at the job level is required for the git push to `badges`. Add before the `steps:` line:
```yaml
  unit-and-integration:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
```

---

### `README.md` (config/documentation)

**Analog:** `README.md` — self-modification, prepend badge to the top of the file.

**Current line 1:**
```markdown
# Astro Starter Kit: Basics
```

**Target — insert badge after heading on line 3 (blank line after heading):**
```markdown
# Astro Starter Kit: Basics

![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/OWNER/REPO/badges/badges/coverage.json)
```

**Substitution required:** Replace `OWNER/REPO` with the actual GitHub repository slug (e.g., `engcfraposo/deep-dive-vm`). The planner must instruct the executor to resolve the real owner/repo from `git remote -v`.

**Pattern source:** shields.io endpoint badge format verified in RESEARCH.md (Pattern 2).

---

### `badges/coverage.json` (static data, on `badges` orphan branch)

**No analog found.** This is the first file on a new orphan branch. There are no existing orphan branches or static badge files in the repo.

**Required format** (shields.io endpoint JSON schema, verified in RESEARCH.md):
```json
{
  "schemaVersion": 1,
  "label": "coverage",
  "message": "N/A",
  "color": "lightgrey"
}
```

**Initial state:** `message: "N/A"`, `color: "lightgrey"` — placeholder values until CI overwrites on first `main` push.

**Pre-creation requirement (Wave 0 manual step):** The `badges` branch must be created as an orphan branch before the first CI run. CI's `git checkout badges` will fail if the branch does not exist remotely. Creation command sequence:
```bash
git checkout --orphan badges
git rm -rf .
mkdir -p badges
echo '{"schemaVersion":1,"label":"coverage","message":"N/A","color":"lightgrey"}' > badges/coverage.json
git add badges/coverage.json
git commit -m "init: create badges branch [skip ci]"
git push origin badges
git checkout main
```

---

## Shared Patterns

### Machine Commit Pattern (D-13 — MANDATORY)

**Source:** Derived from CONTEXT.md D-13 and RESEARCH.md Anti-Patterns.
**Apply to:** Every CI step that commits generated files.

```yaml
- name: Commit generated file
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add <specific-file-only>          # NEVER git add . or git add -A
    git diff --staged --quiet || git commit -m "chore: <description> [skip ci]"
    git push origin <branch>
```

**Rules:**
- `[skip ci]` is mandatory in every machine commit message — omission causes infinite CI loop (Pitfall 4 in RESEARCH.md)
- Stage only the specific file (`badges/coverage.json` or `.lighthouseci/`) — never `git add -A`
- `git diff --staged --quiet ||` guards against empty commits when no change occurred

### Workflow Job Permissions Pattern

**Source:** `.github/workflows/deploy.yaml` (lines 8–11) — the only existing workflow with explicit permissions.
**Apply to:** `lighthouse-weekly.yml` job and `unit-and-integration` job in `test.yml` (badge step).

```yaml
permissions:
  contents: write
```

For `lighthouse-weekly.yml` — set at workflow level (only one job).
For `test.yml` — set at `unit-and-integration` job level only (not workflow-wide, to avoid granting write to other jobs).

### CI Checkout Pattern

**Source:** `.github/workflows/test.yml` (lines 13–17) and `deploy.yaml` (lines 18–24).
**Apply to:** `lighthouse-weekly.yml`.

```yaml
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - run: npm ci
```

Weekly workflow uses the same Node 22 + npm cache pattern. Adds `fetch-depth: 0` to checkout for git push capability.

### Artifact Upload Pattern

**Source:** `.github/workflows/test.yml` (lines 25–29 and 92–96).
**Apply to:** `lighthouse-weekly.yml`.

```yaml
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: <artifact-name>
          path: <path>
          retention-days: 30
```

`if: always()` ensures artifacts are uploaded even when the preceding step fails — consistent across all jobs in `test.yml`. `retention-days: 30` matches existing lighthouse artifact convention.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `badges/coverage.json` | config (static data) | — | No orphan branches or static badge files exist in the repo. First file of its kind. |

---

## Metadata

**Analog search scope:** `.github/workflows/`, `vitest.config.ts`, `.lighthouserc.json`, `.gitignore`, `README.md`
**Files scanned:** 6
**Pattern extraction date:** 2026-05-12

**Critical pre-conditions (Wave 0) identified during mapping:**
1. `badges` orphan branch must be created manually before first CI run (BADGE-01 blocker)
2. `permissions: contents: write` must be added to `unit-and-integration` job and `lighthouse-weekly` job
3. `lhci.db` is NOT in `.gitignore` — no cleanup needed for filesystem path
4. LHCI upload target: CONTEXT.md D-11 specifies `filesystem` (overrides RESEARCH.md D-11 which says `lhci`/SQLite) — use `filesystem`
