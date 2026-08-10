import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js', 'tests/e2e/**/*.dom.test.js'],
    pool: 'threads',
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
