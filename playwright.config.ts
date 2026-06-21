import { defineConfig, devices } from "@playwright/test"

// E2E runs against a production build (`next start`) so we exercise the real
// app without dev-mode overlays or double effects. All /api/swap/* calls are
// mocked per-test (see tests/e2e/mocks.ts), so no external network is needed.
const PORT = Number(process.env.PORT || 3210)

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The app is a static export; build it and serve out/ with a tiny static server.
    command: `pnpm build && node tests/serve-out.mjs`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
})
