import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Aura Style 智能衣橱',
        short_name: 'AuraStyle',
        description: 'AI 智能穿搭助手',
        theme_color: '#c46d9c',
        background_color: '#faf9fb',
        display: 'standalone',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: './',
  build: {
    outDir: '../05-构建产物',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api/mimo': {
        target: 'https://api.xiaomimimo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mimo/, ''),
        secure: false
      }
    }
  }
})
