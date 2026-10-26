import { defineConfig } from 'vitest/config';

// Configuration dédiée aux tests d'architecture (ArchUnitTS).
// `globals: true` est requis par ArchUnitTS pour enregistrer `toPassAsync()`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['architecture/**/*.arch.spec.ts'],
    testTimeout: 60_000,
  },
});
