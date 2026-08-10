import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this repo at /DigitalGrave/ (needs that base).
// Cloudflare Pages serves at the domain root (needs base '/').
// Override per-target with BUILD_BASE, e.g. `BUILD_BASE=/ npm run build`.
export default defineConfig({
  base: process.env.BUILD_BASE || '/DigitalGrave/',
  plugins: [react()],
  build: {
    emptyOutDir: false,
  },
});
