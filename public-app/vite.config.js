import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public/js/build',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.jsx'),
      },
      output: {
        entryFileNames: 'wp-schedule-manager-public.js',
        chunkFileNames: 'wp-schedule-manager-public-chunk-[name].js',
        assetFileNames: 'wp-schedule-manager-public-asset-[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Base path for assets when running in production
  base: '/wp-content/plugins/wp-schedule-manager/public/js/build/',
  // Development server config
  server: {
    port: 3001,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost',
    },
  },
});
