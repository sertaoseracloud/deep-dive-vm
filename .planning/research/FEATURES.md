# Features Research: Linktree Hub + Social Sharing

**Project:** mentoria.sertaoseracloud.com — Hub page + multi-landing-page platform
**Domain:** Linktree-style link-in-bio hub for a Brazilian Portuguese educational/mentorship brand
**Researched:** 2026-05-16
**Overall confidence:** HIGH (WhatsApp/OG specs), MEDIUM (conversion patterns)

---

## Table Stakes (must-have for v1.3)

Features without which the hub fails its job: getting a click from WhatsApp/Instagram/LinkedIn to the right landing page.

| Feature | Why Non-Negotiable | Complexity | Notes |
|---|---|---|---|
| Profile photo | Establishes instructor identity; trust signal before any text is read | Low | Cláudio Filipe — same photo used across social bios |
| Name + one-line bio | Anchors who this is and why they matter | Low | "Microsoft MVP · Docker Captain · O Sertão será Cloud" — terse, credentialed |
| Link cards (3–5 max) | The core job of the page: route visitors to the right course or offer | Low–Med | Each card = course title + brief descriptor; ordered by priority, not alphabetically |
| Mobile-first layout | >90% of social traffic arrives on mobile; hub must be usable at 375px with thumb navigation | Low | Single-column, large tap targets (min 48×48px), no hover-dependent interactions |
| Sub-2s load time | Every second of load time adds ~32% bounce probability; social visitors have zero patience | Med | Static Astro output, no client-side JS required for hub itself; inline critical CSS |
| Open Graph meta tags | Without them, WhatsApp/Instagram show a bare URL — no image, no title, no click | Low | See "Open Graph Minimum Viable Set" below |
| og:image (1200×630) | The preview image IS the first impression on WhatsApp; no image = no engagement | Med | Must be pre-rendered static PNG, <300KB, served via HTTPS |
| Accessible tap targets | Link cards must be keyboard-navigable and screen-reader-labelled (WCAG 2.1 AA) | Low | aria-label on each card link; color contrast ≥4.5:1 |
| HTTPS + canonical URL | WhatsApp refuses to render og:image from non-HTTPS origins; also required for deduplication | Low | Astro site.url config + `<link rel="canonical">` |

---

## Differentiators (nice-to-have)

Features that improve conversion but are not blocking for v1.3 launch.

| Feature | Value Proposition | Complexity | Notes |
|---|---|---|---|
| Social icons row | WhatsApp, Instagram, LinkedIn, GitHub — direct follow shortcuts below link cards | Low | SVG icons only; no third-party script; 5 max |
| Brief credentialing strip | "Microsoft MVP · Docker Captain · 54h de formação" — authority signal above link cards | Low | JetBrains Mono label style from design system — reads as metadata, not marketing |
| Thumbnail per link card | Small course logo/image per card helps scannability on mobile | Med | Optional, adds visual weight — only worth it if images are production-quality |
| Click analytics (Plausible) | Understanding which link gets clicked most informs which course to surface first | Low | Plausible.io script tag — lightweight, GDPR-friendly, no cookie banner needed |
| Subtle entrance animation | Cards fade/slide in on load — brand coherence with existing landing page motion system | Low | Use `motion/react` (already a project dependency); respect `prefers-reduced-motion` |
| Pinned "top offer" card | One card styled differently (Solid Core button from design system) to signal priority | Low | Useful if one course is in active launch; remove when no active promotion |
| `theme-color` meta tag | Android Chrome colors the browser chrome to match brand; small but visible polish | Low | `<meta name="theme-color" content="#0a0f1e">` |

---

## Anti-Features (don't add)

Things that seem like features but actively hurt this use case.

| Anti-Feature | Why It Hurts | What to Do Instead |
|---|---|---|
| More than 7 link cards | Choice paralysis kills conversion; visitors scroll, get overwhelmed, close the tab | Curate to 3–5 active offers; archive inactive courses |
| Email capture / newsletter signup | Visitors arriving from WhatsApp have a specific intent (find a course); adding friction before they reach it breaks the funnel | Email capture belongs on the landing pages, not the hub |
| Embedded video | Videos trigger autoplay negotiation, add JS weight, and break the minimal contract of the hub | Link to a YouTube/course intro from a card instead |
| Popup or interstitial | Any element that blocks the link cards defeats the entire purpose of the page | Never |
| Cookie consent banner | Triggers if you add tracking pixels (Meta Pixel, Google Analytics); adds visual noise and legal friction | Use Plausible (cookieless) — no banner required |
| Client-side rendering (SPA behavior) | React-rendered hub means no OG tags in initial HTML; WhatsApp's crawler does not execute JS | Astro static output; all meta tags must be in the initial HTML response |
| Dark/light mode toggle | Adds a UI element that serves the developer's preference, not the visitor's task | The existing design system is dark by conviction — stay dark; rely on OS `prefers-color-scheme` if ever needed |
| Social share counts | Vanity metric; if counts are low, they signal low interest and undermine trust | Omit entirely |
| Heavy web font loading | Multiple font files slow the initial render; social visitors are impatient | Subset the three existing fonts (Chakra Petch, Space Grotesk, JetBrains Mono) to Latin + Latin Extended only; use `font-display: swap` |

---

## Open Graph Minimum Viable Set

Exact tags needed for a rich WhatsApp, LinkedIn, and Instagram preview. All must be present in the initial HTML `<head>` — WhatsApp's crawler does not execute JavaScript.

### Required (without these, no preview renders)

```html
<!-- Page identity -->
<meta property="og:title" content="O Sertão será Cloud · Mentoria e Formação Azure" />
<meta property="og:description" content="Formação técnica de elite com Cláudio Filipe — Microsoft MVP e Docker Captain. Engenheiros que viram Arquitetos." />
<meta property="og:url" content="https://mentoria.sertaoseracloud.com/" />
<meta property="og:image" content="https://mentoria.sertaoseracloud.com/og-hub.png" />

<!-- Type -->
<meta property="og:type" content="website" />
```

### Strongly Recommended (WhatsApp + LinkedIn parity)

```html
<!-- Explicit image dimensions prevent layout recalculation on render -->
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />

<!-- Locale -->
<meta property="og:locale" content="pt_BR" />

<!-- Site name (appears under title in some renderers) -->
<meta property="og:site_name" content="O Sertão será Cloud" />
```

### Twitter/X Cards (add for completeness; minimal overhead)

```html
<!-- Twitter/X falls back to og: tags but needs this to trigger card rendering -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@sertaoseracloud" />
```

### Android Chrome browser chrome color

```html
<meta name="theme-color" content="#0a0f1e" />
```

---

### og:image Specifications

| Property | Requirement | Rationale |
|---|---|---|
| Dimensions | 1200×630px | Universal standard for Facebook, LinkedIn, WhatsApp full-width preview |
| Aspect ratio | 1.91:1 (1200×630) | Consistent rendering without cropping across all major platforms |
| File size | <300KB (hard), target <150KB | WhatsApp refuses images over 600KB; smaller = faster CDN delivery |
| Format | PNG preferred (has text); JPEG acceptable for photo-only | PNG preserves text sharpness; JPEG compresses poorly around text edges |
| Protocol | HTTPS required | WhatsApp will not load og:image from HTTP origins |
| Accessibility | No critical information in image-only form | Screen readers cannot read the og:image; all key info must also be in title/description tags |

### og:image Design Guidance (aligned to existing design system)

- Background: Abismo Profundo (`#0a0f1e`) — matches the existing dark-by-conviction system
- Headline: Chakra Petch, ≥48px at 1200×630, color `#ffffff` — the Display type role
- Sub-label: JetBrains Mono, UPPERCASE, Núcleo Elétrico (`#00ffff`) — the Label type role
- Profile photo: instructor photo, circular crop, positioned left or centered
- Text covers ≤25% of image surface — treat it as a billboard, not a brochure
- Add cyan hairline border or grid texture as brand marker (matches landing page aesthetic)
- Do not use the `#000000` black as background — use Abismo (`#0a0f1e`) to maintain palette coherence

### og:title and og:description Copy Constraints

| Tag | WhatsApp truncates at | Recommended length | Priority |
|---|---|---|---|
| og:title | ~65 characters | 40–60 chars | Brand name first, then descriptor |
| og:description | ~130 characters (mobile) | 80–120 chars | One punchy sentence — credentialed claim, not generic pitch |

Example title (52 chars): `O Sertão será Cloud · Formação Azure`
Example description (118 chars): `Formação técnica de elite com Microsoft MVP e Docker Captain. Engenheiros que viram Arquitetos de Nuvem.`

---

## Feature Dependencies

```
og:image static asset   →  og:image meta tag (image must exist before tag points to it)
HTTPS certificate       →  og:image rendering in WhatsApp (hard dependency)
Static Astro output     →  OG tags in initial HTML (SPA/CSR breaks WhatsApp crawler)
Link cards ordered      →  Credentialing strip above (authority must precede action)
Mobile layout           →  All other features (hub is accessed on mobile first)
```

## MVP Recommendation for v1.3

Build in this order:

1. Static Astro hub page (`/index.astro`) — profile photo, name, credentialing label, 3–5 link cards
2. Open Graph meta tags (all required + recommended fields above)
3. og:image static asset — 1200×630 PNG, <150KB, brand-consistent design
4. `theme-color` and Twitter Card tags — zero effort, meaningful polish

Defer:
- Click analytics (Plausible) — configure after launch, does not affect initial social sharing
- Thumbnail images per link card — only if course assets are production-quality; default to text-only cards
- Entrance animations — after the above is solid; motion adds brand coherence but does not affect conversion

---

## Sources

- [WhatsApp Link Preview Requirements — ogrilla.com](https://www.ogrilla.com/blog/whatsapp-link-preview-guide)
- [WhatsApp Open Graph Meta Tags & Specs — ogpreview.app](https://ogpreview.app/open-graph/whatsapp/)
- [Open Graph image size best practices — digital.ink](https://www.digital.ink/blog/open-graph-image/)
- [Open Graph Image Sizes 2026 — krumzi.com](https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2026-guide)
- [Twitter Cards vs Open Graph — ogcheck.com](https://ogcheck.com/blog/twitter-cards-vs-open-graph)
- [Link-in-bio optimization guide — the-bithub.com](https://the-bithub.com/blog/link-in-bio-optimization-guide-2025)
- [Link in Bio 2.0 — linkdrip.com](https://www.linkdrip.com/blog/link-in-bio-2-0-how-to-build-a-high-converting-social-hub-with-branded-short-links)
- [Why is Linktree slow — biotree.bio](https://biotree.bio/blog/why-is-linktree-slow)
- [Linktree features overview — thesocialcat.com](https://thesocialcat.com/glossary/linktree)
- [How to Get Social Media Previews Right on Astro — lirantal.com](https://lirantal.com/blog/getting-social-media-previews-right-with-opengraph-meta-tags)
