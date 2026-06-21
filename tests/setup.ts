import { afterEach, beforeEach } from "vitest"

// jsdom provides window/localStorage. Ensure each test starts with clean
// storage and no leftover mock wallet providers from a previous test.

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
  // Remove any injected wallet providers a test installed on window.
  delete (window as unknown as Record<string, unknown>).phantom
  delete (window as unknown as Record<string, unknown>).solana
  delete (window as unknown as Record<string, unknown>).ethereum
})
