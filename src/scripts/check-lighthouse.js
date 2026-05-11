import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPORT_PATH = resolve(__dirname, '../../lighthouse-report.json');

const THRESHOLDS = {
  seo: { label: 'SEO', min: 90, unit: '%', mode: 'gte' },
  fcp: { label: 'FCP', max: 1000, unit: 'ms', mode: 'lt' },
  lcp: { label: 'LCP', max: 2500, unit: 'ms', mode: 'lt' },
  cls: { label: 'CLS', max: 0.1, unit: '', mode: 'lte' },
};

function formatValue(key, raw) {
  if (key === 'seo') return `${Math.round(raw)}%`;
  if (key === 'cls') return raw.toFixed(3);
  return `${Math.round(raw)}ms`;
}

function checkThreshold(key, value) {
  const t = THRESHOLDS[key];
  let pass;
  let thresholdLabel;

  if (t.mode === 'gte') {
    pass = value >= t.min;
    thresholdLabel = `${t.min}${t.unit}`;
    const op = pass ? '>=' : '<';
    return {
      pass,
      line: `${t.label}: ${formatValue(key, value)} ${op} ${thresholdLabel} — ${pass ? 'PASS' : 'FAIL'}`,
    };
  } else if (t.mode === 'lt') {
    pass = value < t.max;
    thresholdLabel = `${t.max}${t.unit}`;
    const op = pass ? '<' : '>=';
    return {
      pass,
      line: `${t.label}: ${formatValue(key, value)} ${op} ${thresholdLabel} — ${pass ? 'PASS' : 'FAIL'}`,
    };
  } else if (t.mode === 'lte') {
    pass = value <= t.max;
    thresholdLabel = `${t.max}`;
    const op = pass ? '<=' : '>';
    return {
      pass,
      line: `${t.label}: ${formatValue(key, value)} ${op} ${thresholdLabel} — ${pass ? 'PASS' : 'FAIL'}`,
    };
  }

  return { pass: false, line: `${t.label}: unknown threshold mode — FAIL` };
}

function main() {
  if (!existsSync(REPORT_PATH)) {
    console.error(
      `Error: lighthouse-report.json not found at ${REPORT_PATH}\n` +
      'Run "npm run lighthouse" with a local server running to generate the report.'
    );
    process.exit(1);
  }

  let report;
  try {
    const raw = readFileSync(REPORT_PATH, 'utf8');
    report = JSON.parse(raw);
  } catch (err) {
    console.error(`Error: Failed to parse lighthouse-report.json — ${err.message}`);
    process.exit(1);
  }

  const seoRaw = (report?.categories?.seo?.score ?? null);
  const fcpRaw = report?.audits?.['first-contentful-paint']?.numericValue ?? null;
  const lcpRaw = report?.audits?.['largest-contentful-paint']?.numericValue ?? null;
  const clsRaw = report?.audits?.['cumulative-layout-shift']?.numericValue ?? null;

  const missing = [];
  if (seoRaw === null) missing.push('categories.seo.score');
  if (fcpRaw === null) missing.push('audits.first-contentful-paint.numericValue');
  if (lcpRaw === null) missing.push('audits.largest-contentful-paint.numericValue');
  if (clsRaw === null) missing.push('audits.cumulative-layout-shift.numericValue');

  if (missing.length > 0) {
    console.error(`Error: lighthouse-report.json is missing required fields:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }

  const seoScore = seoRaw * 100;

  const results = [
    checkThreshold('seo', seoScore),
    checkThreshold('fcp', fcpRaw),
    checkThreshold('lcp', lcpRaw),
    checkThreshold('cls', clsRaw),
  ];

  console.log('\nLighthouse Threshold Check');
  console.log('==========================');
  for (const r of results) {
    console.log(r.line);
  }
  console.log('');

  const anyFailed = results.some((r) => !r.pass);
  if (anyFailed) {
    console.error('Result: FAIL — one or more thresholds not met');
    process.exit(1);
  } else {
    console.log('Result: PASS — all thresholds met');
    process.exit(0);
  }
}

main();
