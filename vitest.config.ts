import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Dedicated Vitest config — kept separate from vite.config.ts so the PWA/tailwind
// plugins don't load during test runs. Alias mirrors tsconfig paths ("@/*" -> src).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/lib/database.types.ts'],
    },
  },
})
