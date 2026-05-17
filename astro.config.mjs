import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  outDir: 'dist',
  integrations: [
    sitemap({
      // Excluir a rota raiz do hub do sitemap — apenas /deep-dive-vm/ deve ser indexada
      filter: (page) => !page.endsWith('https://mentoria.sertaoseracloud.com/'),
    }),
    react(),
  ],
});
