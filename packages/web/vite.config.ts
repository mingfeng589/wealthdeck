import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const base = process.env.GITHUB_PAGES === 'true' ? '/wealthdeck/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'WealthDeck',
        short_name: 'WealthDeck',
        description: '个人资产管理台',
        theme_color: '#1f5eff',
        background_color: '#f4f6f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        icons: [
          { src: `${base}icons/icon-48.png`, sizes: '48x48', type: 'image/png' },
          { src: `${base}icons/icon-72.png`, sizes: '72x72', type: 'image/png' },
          { src: `${base}icons/icon-96.png`, sizes: '96x96', type: 'image/png' },
          { src: `${base}icons/icon-144.png`, sizes: '144x144', type: 'image/png' },
          { src: `${base}icons/icon-168.png`, sizes: '168x168', type: 'image/png' },
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/qt\.gtimg\.cn\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/push2\.eastmoney\.com\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@wealthdeck/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
