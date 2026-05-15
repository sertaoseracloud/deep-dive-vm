import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  base: '/deep-dive-vm/',
  outDir: 'dist',
  integrations: [sitemap(), react()],
});
