import { test, expect } from "@playwright/test"
import { installSwapMocks, VALID_SOL_RECIPIENT } from "./mocks"

// Registers a mock Wallet-Standard Solana wallet before the page loads, so the
// real detection path (Wallet Standard) fills the field — no app code is stubbed.
function injectMockSolanaWallet(address: string) {
  return `(() => {
    const wallet = {
      version: '1.0.0',
      name: 'MockWallet',
      icon: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      chains: ['solana:mainnet'],
      accounts: [],
      features: {
        'standard:connect': {
          version: '1.0.0',
          connect: async () => ({ accounts: [{ address: ${JSON.stringify(address)}, publicKey: new Uint8Array(), chains: ['solana:mainnet'], features: [] }] }),
        },
        'standard:events': { version: '1.0.0', on: () => () => {} },
      },
    }
    window.addEventListener('wallet-standard:app-ready', (e) => e.detail.register(wallet))
    window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: ({ register }) => register(wallet) }))
  })()`
}

test.describe("wallet address fill", () => {
  test("fills the Solana recipient from a detected Wallet-Standard wallet", async ({ page }) => {
    await installSwapMocks(page)
    await page.addInitScript(injectMockSolanaWallet(VALID_SOL_RECIPIENT))
    await page.goto("/zolana")

    await page.getByRole("button", { name: /Connect wallet/i }).first().click()
    await expect(page.locator("#swap-recipient")).toHaveValue(VALID_SOL_RECIPIENT)
  })

  test("offers install links when no wallet is present", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")

    await page.getByRole("button", { name: /Connect wallet/i }).first().click()
    await expect(page.getByRole("link", { name: /Install Phantom/i }).first()).toBeVisible()
  })
})
