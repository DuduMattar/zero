import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// VITE_BASE=/zero/ no deploy do GitHub Pages; "/" em desenvolvimento.
const base = process.env.VITE_BASE ?? '/';
// Identificador do build, visível em Ajustes → Sobre, para saber qual versão está rodando no aparelho.
const sha = (process.env.GITHUB_SHA ?? 'local').slice(0, 7);
const buildId = `${new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16)} · ${sha}`;

export default defineConfig({
  base,
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'ZERO',
        short_name: 'ZERO',
        description: 'Seu assistente pessoal para parar de fumar.',
        lang: 'pt-BR',
        display: 'standalone',
        start_url: './',
        scope: './',
        theme_color: '#0b0f14',
        background_color: '#0b0f14',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  build: { target: 'es2022', sourcemap: false },
});
