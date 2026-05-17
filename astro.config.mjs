import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  outDir: 'dist',
  integrations: [sitemap()],
});
