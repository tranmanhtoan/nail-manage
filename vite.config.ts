import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'MCC Nail & Spa',
        short_name: 'MCC Nail',
        description: 'Nail salon management tool',
        theme_color: '#ec4899',
        background_color: '#ec4899',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: ['es2020', 'safari14'],
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase client — large lib, separate chunk
          'vendor-supabase': ['@supabase/supabase-js'],
          // State management
          'vendor-zustand': ['zustand'],
          // i18n framework (translations loaded dynamically)
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
  resolve: {
    alias: { '@': '/src' },
  },
})
