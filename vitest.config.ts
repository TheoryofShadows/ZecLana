import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

// Unit tests run in jsdom (so localStorage / window-based modules work). The
// `@/*` path alias from tsconfig is mapped manually here, and `server-only` is
// stubbed so the server-side 1Click client's pure helpers can be exercised.
const root = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": root.replace(/\/$/, ""),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
})
