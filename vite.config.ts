import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
        })
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
