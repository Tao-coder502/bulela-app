import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: Number(process.env.PORT) || 3000,
        host: '0.0.0.0',
        cors: true,
        fs: {
          strict: false
        },
        hmr: false,
      },
      plugins: [
        react(), 
        tailwindcss(),
        viteStaticCopy({
          targets: [
            {
              src: 'node_modules/@xenova/transformers/dist/*.wasm',
              dest: 'wasm'
            }
          ]
        }),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          workbox: {
            // This ensures all your AI models and assets are cached for offline
            globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wasm}'],
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Increased to 10MB for AI models
          },
          manifest: {
            name: 'Bulela AI Tutor',
            short_name: 'Bulela',
            description: 'Learn Zambian languages with a Wise Elder AI',
            theme_color: '#083124',
            background_color: '#041d15',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              }
            ],
          },
        }),
      ],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || env.CLERK_PUBLISHABLE_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
