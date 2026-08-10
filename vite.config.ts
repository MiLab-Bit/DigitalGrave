import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages deploy base for this repo is /DigitalGrave/.
// emptyOutDir is disabled because the sandbox's safe-delete hook blocks
// Vite from trashing the existing dist/ folder on rebuild.
export default defineConfig({
  base: '/DigitalGrave/',
  plugins: [react()],
  build: {
    emptyOutDir: false,
  },
});
