import { defineConfig } from 'vitest/config'

// Unit tests cover framework-free modules only, so they run without the SvelteKit plugin.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
