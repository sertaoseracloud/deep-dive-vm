# QUAL-03 Audit — Cumulative Layout Shift (CLS) Gate

**Data:** 2026-05-16
**Auditor:** Agente executor 05-03
**Ferramenta:** Lighthouse CLI v13.3.0
**Escopo:** Build local completa com todas as animações v1.2 presentes

---

## Método de Execução

Conforme D-AUDIT-03: Lighthouse executado diretamente contra o servidor de preview local.
NÃO foi usado `npm run lighthouse:ci` (que aponta para produção).
NÃO foi usado `npm run lighthouse` (que aponta para produção).

**Sequência executada:**

```bash
# Passo 1 — Build do projeto
npm run build

# Passo 2 — Iniciar preview server em background
npx astro preview --port 4321 &
sleep 5

# Passo 3 — Verificar que servidor responde (HTTP 200)
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/deep-dive-vm/
# Resultado: 200

# Passo 4 — Executar Lighthouse contra localhost
npx lighthouse http://localhost:4321/deep-dive-vm/ \
  --output json \
  --output-path lighthouse-report.json \
  --chrome-flags="--headless --no-sandbox --disable-gpu"

# Passo 5 — Encerrar servidor de preview
pkill -f "astro preview"
```

---

## Resultado Lighthouse

| Campo | Valor |
|-------|-------|
| **URL auditada** | `http://localhost:4321/deep-dive-vm/` |
| **fetchTime** | 2026-05-16T17:13:47.639Z |
| **CLS numericValue** | **0** |
| **CLS score** | **1** (= 1.0, perfeito) |
| **CLS displayValue** | `0` |
| **Threshold** | <= 0.1 |

**Confirmação de URL local:**
- `requestedUrl` contém `localhost:4321` — relatório gerado contra build local, NÃO produção (T-05-04 mitigado)

---

## Verificação Automatizada

```bash
node -e "const r=require('./lighthouse-report.json'); const cls=r.audits['cumulative-layout-shift'].numericValue; const pass=cls<=0.1; console.log('CLS:', cls, pass?'PASS':'FAIL'); process.exit(pass?0:1)"
```

**Saída:** `CLS: 0 PASS`
**Exit code:** 0

---

## Análise

CLS = 0 confirma que nenhuma das animações v1.2 causa Cumulative Layout Shift:

- **`[data-reveal]`** — usa `opacity` + `transform: translateY(20px)`. Elementos com `opacity: 0` já ocupam o mesmo espaço de layout, não causam shift quando revelados.
- **`[data-stagger]` / `@keyframes fade-up`** — usa `opacity` + `transform: translateY(16px)`. Mesmo princípio: propriedades compositor-friendly que não alteram o fluxo de layout.
- **`.hero-stagger-item`** — aplicada via JavaScript (HeroMotion.tsx), mas também usa apenas `opacity` + `transform`. Sem alteração de dimensões.
- **`motion.span` (SettingsToggle)** — spring com `x` (`transform: translateX`) e `opacity`. Zero impacto no layout.

Animações CSS baseadas em `opacity` e `transform` são **compositor-friendly por definição** — o browser pode executá-las na GPU sem tocar no layout, garantindo CLS = 0.

---

## Veredicto

**QUAL-03 PASS**

CLS numericValue = 0 (threshold: <= 0.1). Margem de segurança de 100%.

---

## Resumo dos 3 Gates da Fase 05

| Gate | Descrição | Resultado |
|------|-----------|-----------|
| **QUAL-01** | CSS Performance: will-change scopado, sem layout thrashing, compositor-friendly | **PASS** |
| **QUAL-02** | Reduced-motion: 4/4 testes Playwright passando com `emulateMedia({ reducedMotion: 'reduce' })` | **PASS** |
| **QUAL-03** | CLS <= 0.1: numericValue = 0, score = 1.0, auditado contra build local | **PASS** |

**Fase 05 — Quality Audit: FECHADA. Todos os 3 gates verdes.**

Os gates confirmam que as animações implementadas na fase v1.2 atendem integralmente aos requisitos QUAL-01, QUAL-02 e QUAL-03 sem necessidade de correções.
