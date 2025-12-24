import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  publicDir: 'public',
  envDir: '../../',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/data': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
});
