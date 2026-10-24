import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relatieve paden, zodat de build werkt onder https://<user>.github.io/<repo>/
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
