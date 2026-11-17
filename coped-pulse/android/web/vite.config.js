import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../app/src/main/assets',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    host: true,
  },
});
