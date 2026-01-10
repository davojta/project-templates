import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Cypress-specific Vite config for component testing
// Excludes TanStack Router plugin since we don't need route generation for isolated component tests
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/client/src'),
    },
  },
});
