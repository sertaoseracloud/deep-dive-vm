// Update PILOT_SECTIONS with actual GSC top-5 slugs before running
// src/scripts/capture-baselines.js.
// Each entry maps a human-readable slug (used for the PNG filename) to the CSS
// selector for the section element on BOTH the legacy page and the generated page.

export const PILOT_SECTIONS = [
  { slug: 'hero',       sectionId: '#top' },
  { slug: 'pricing',    sectionId: '#investimento' },
  { slug: 'curriculum', sectionId: '#ementa' },
  { slug: 'bonuses',    sectionId: '#bonus' },
  { slug: 'faq',        sectionId: '#faq' },
];
