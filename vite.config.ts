import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    sourcemap: false, // disables sourcemaps for production
  },
  server: {
    fs: { strict: false },
  },
  esbuild: {
    sourcemap: false, // optional: prevents dev sourcemap warnings
  },
});