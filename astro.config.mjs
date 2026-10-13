import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fontes hospedadas no próprio site (baixadas do Google no build): sem
// requisição a terceiros no navegador e com fallbacks de métricas ajustadas,
// para a troca de fonte não deslocar o layout (CLS).
const google = fontProviders.google();

export default defineConfig({
  site: 'https://mentoria.sertaoseracloud.com',
  outDir: 'dist',
  fonts: [
    {
      provider: google,
      name: 'Space Grotesk',
      cssVariable: '--font-body',
      weights: ['300 700'],
      styles: ['normal'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: google,
      name: 'Chakra Petch',
      cssVariable: '--font-display',
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: google,
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: ['300 600'],
      styles: ['normal'],
      fallbacks: ['monospace'],
    },
    {
      // Só é baixada quando a opção "Fonte mais legível" do painel ♿ está ligada.
      provider: google,
      name: 'Atkinson Hyperlegible',
      cssVariable: '--font-legivel',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [
    sitemap({
      // Excluir a rota raiz do hub do sitemap — apenas /deep-dive-vm/ deve ser indexada
      filter: (page) => !page.endsWith('https://mentoria.sertaoseracloud.com/'),
    }),
  ],
});
