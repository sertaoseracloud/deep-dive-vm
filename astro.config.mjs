import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sertaoseracloud.github.io',
  base: '/deep-dive-vm',
  outDir: 'dist',
  integrations: [sitemap()],
});
