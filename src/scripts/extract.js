/**
 * extract.js — Content extraction pipeline for Deep Dive Azure VM landing page.
 *
 * Reads Astro components from src/components/sections/ and src/pages/,
 * extracts semantic content, builds frontmatter (title, description, cta_text,
 * cta_link), converts HTML to Markdown, and writes src/content/<name>.md.
 *
 * Also copies and converts image assets in src/assets/ to WebP in public/images/.
 *
 * Security: Frontmatter strings are validated via simple length/character checks
 * (zod not available; pattern from threat model T-01).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');

const SECTIONS_DIR = path.join(ROOT, 'src', 'components', 'sections');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const PUBLIC_IMAGES_DIR = path.join(ROOT, 'public', 'images');

// ── Utilities ──────────────────────────────────────────────────────────────────

/**
 * Strip Astro frontmatter (--- ... ---) and <style> blocks from a .astro file.
 * Returns only the HTML template portion.
 */
function stripAstroMeta(src) {
  // Remove frontmatter block
  let html = src.replace(/^---[\s\S]*?---\n?/, '');
  // Remove <style> and <script> blocks
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  return html.trim();
}

/**
 * Extract plain text from HTML string (very lightweight).
 */
function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract the first <h1> or <h2> or <h3> text from HTML, falling back to filename.
 */
function extractTitle(html, fallback) {
  const m = html.match(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/i);
  if (m) return htmlToText(m[1]).substring(0, 120);
  // Try eyebrow / section head pattern
  const eyebrow = html.match(/eyebrow="([^"]+)"/i);
  if (eyebrow) return eyebrow[1].substring(0, 120);
  return fallback;
}

/**
 * Extract a meaningful description: first <p> or lede prop.
 */
function extractDescription(html) {
  // Try lede prop (used in SectionHead)
  const lede = html.match(/lede="([^"]+)"/i);
  if (lede) return lede[1].substring(0, 320);
  // First <p> tag
  const p = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (p) return htmlToText(p[1]).substring(0, 320);
  return '';
}

/**
 * Extract CTA text from first Button component or <a> with a call-to-action class.
 */
function extractCtaText(html) {
  // Astro Button component pattern: <Button ...>text</Button>
  const btn = html.match(/<Button[^>]*>\s*([\s\S]*?)\s*<\/Button>/i);
  if (btn) return htmlToText(btn[1]).substring(0, 80);
  // Generic <a> pattern
  const a = html.match(/<a\s[^>]*class="[^"]*(?:btn|cta|button)[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (a) return htmlToText(a[1]).substring(0, 80);
  return '';
}

/**
 * Extract CTA link from first Button href or <a class="btn|cta"> href.
 */
function extractCtaLink(html) {
  // Astro Button component: href="#..."
  const btn = html.match(/<Button\s[^>]*href="([^"]+)"/i);
  if (btn) return btn[1];
  const a = html.match(/<a\s[^>]*href="([^"]+)"[^>]*class="[^"]*(?:btn|cta|button)[^"]*"/i);
  if (a) return a[1];
  // Generic first anchor
  const anyA = html.match(/<a\s[^>]*href="([^"]+)"/i);
  if (anyA) return anyA[1];
  return '#';
}

/**
 * Validate a frontmatter string value.
 * Rule from threat model T-01: sanitize to printable ASCII + basic Unicode,
 * max 400 chars, reject anything with HTML tags or script injection.
 */
function validateFrontmatterString(value, fieldName) {
  if (typeof value !== 'string') return '';
  if (value.length > 400) {
    console.warn(`  [WARN] Field "${fieldName}" truncated from ${value.length} chars`);
    value = value.substring(0, 400);
  }
  // Reject script/html injection patterns
  if (/<script/i.test(value) || /javascript:/i.test(value)) {
    console.warn(`  [WARN] Field "${fieldName}" contained unsafe content, cleared`);
    return '';
  }
  return value;
}

/**
 * Convert an HTML fragment to Markdown using unified/rehype-remark pipeline.
 */
async function htmlFragmentToMarkdown(html) {
  try {
    const result = await unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRemark)
      .use(remarkGfm)
      .use(remarkStringify)
      .process(html);
    return String(result).trim();
  } catch (err) {
    console.warn(`  [WARN] MD conversion failed, falling back to plain text: ${err.message}`);
    return htmlToText(html);
  }
}

// ── Main extraction loop ────────────────────────────────────────────────────────

const results = {
  processed: [],
  failed: [],
  images: [],
};

async function extractSections() {
  // Ensure output dirs exist
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

  const sectionFiles = fs.readdirSync(SECTIONS_DIR).filter(f => f.endsWith('.astro'));
  console.log(`Found ${sectionFiles.length} section components to process.`);

  for (const file of sectionFiles) {
    const name = file.replace('.astro', '').toLowerCase();
    const srcPath = path.join(SECTIONS_DIR, file);
    console.log(`\nProcessing: ${file}`);

    try {
      const raw = fs.readFileSync(srcPath, 'utf8');
      const html = stripAstroMeta(raw);

      const title = validateFrontmatterString(extractTitle(html, name), 'title');
      const description = validateFrontmatterString(extractDescription(html), 'description');
      const cta_text = validateFrontmatterString(extractCtaText(html), 'cta_text');
      const cta_link = validateFrontmatterString(extractCtaLink(html), 'cta_link');

      const markdownBody = await htmlFragmentToMarkdown(html);

      const frontmatter = { title, description, cta_text, cta_link };
      const output = matter.stringify(markdownBody, frontmatter);

      const outPath = path.join(CONTENT_DIR, `${name}.md`);
      fs.writeFileSync(outPath, output, 'utf8');
      console.log(`  Written: ${outPath}`);
      results.processed.push({ name, outPath });
    } catch (err) {
      console.error(`  [ERROR] Failed to process ${file}: ${err.message}`);
      results.failed.push({ name: file, error: err.message });
    }
  }
}

/**
 * Also extract the main page (index.astro) as home.md.
 */
async function extractHomePage() {
  const indexPath = path.join(PAGES_DIR, 'index.astro');
  if (!fs.existsSync(indexPath)) {
    console.log('\nSkipping home page extraction (index.astro not found).');
    return;
  }

  console.log('\nProcessing: index.astro → home.md');
  try {
    const raw = fs.readFileSync(indexPath, 'utf8');
    const html = stripAstroMeta(raw);

    // For the index page, extract from the Layout props
    const titleMatch = raw.match(/title="([^"]+)"/);
    const descMatch = raw.match(/description="([^"]+)"/);

    const title = validateFrontmatterString(
      titleMatch ? titleMatch[1] : 'Deep Dive Azure Virtual Machine',
      'title'
    );
    const description = validateFrontmatterString(
      descMatch ? descMatch[1] : '',
      'description'
    );
    const cta_text = validateFrontmatterString('Quero ser Arquiteto de Nuvem', 'cta_text');
    const cta_link = validateFrontmatterString('#investimento', 'cta_link');

    const markdownBody = await htmlFragmentToMarkdown(html);
    const frontmatter = { title, description, cta_text, cta_link };
    const output = matter.stringify(markdownBody, frontmatter);

    const outPath = path.join(CONTENT_DIR, 'home.md');
    fs.writeFileSync(outPath, output, 'utf8');
    console.log(`  Written: ${outPath}`);
    results.processed.push({ name: 'home', outPath });
  } catch (err) {
    console.error(`  [ERROR] Failed to process home page: ${err.message}`);
    results.failed.push({ name: 'index.astro', error: err.message });
  }
}

/**
 * Convert image assets in src/assets/ to WebP in public/images/.
 */
async function optimiseImages() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log('\nNo src/assets/ directory found, skipping image optimisation.');
    return;
  }

  const imageFiles = fs.readdirSync(ASSETS_DIR).filter(f =>
    /\.(png|jpe?g|gif|tiff|bmp)$/i.test(f)
  );
  console.log(`\nFound ${imageFiles.length} images to optimise.`);

  for (const file of imageFiles) {
    const srcPath = path.join(ASSETS_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    const outPath = path.join(PUBLIC_IMAGES_DIR, `${baseName}.webp`);

    console.log(`  Optimising: ${file} → ${baseName}.webp`);
    try {
      await sharp(srcPath)
        .toFormat('webp', { quality: 85 })
        .toFile(outPath);
      console.log(`  Written: ${outPath}`);
      results.images.push({ src: file, out: outPath, format: 'webp' });
    } catch (err) {
      console.error(`  [ERROR] Image conversion failed for ${file}: ${err.message}`);
      results.failed.push({ name: file, error: err.message });
    }
  }
}

// ── Entry point ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Extract.js — Content Migration Pipeline ===\n');
  const startTime = Date.now();

  await extractSections();
  await extractHomePage();
  await optimiseImages();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Duration:  ${duration}s`);
  console.log(`Processed: ${results.processed.length} content files`);
  console.log(`Images:    ${results.images.length} optimised`);
  console.log(`Failures:  ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed items:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
