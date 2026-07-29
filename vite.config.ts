import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Enables proper SPA routing on Cloudflare Pages
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
