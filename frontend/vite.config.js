import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Asegúrate que coincida con tu estructura
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  }
});