import { test, expect } from "@playwright/test"
import { installSwapMocks, VALID_SOL_RECIPIENT } from "./mocks"

test.describe("Phantom wallet autofill", () => {
  test("fills the Solana recipient from an injected Phantom provider", async ({ page }) => {
    await installSwapMocks(page)
    await page.addInitScript((addr) => {
      ;(window as unknown as Record<string, unknown>).phantom = {
        solana: { isPhantom: true, connect: async () => ({ publicKey: { toString: () => addr } }) },
      }
    }, VALID_SOL_RECIPIENT)

    await page.goto("/zolana")
    await page.getByRole("button", { name: /Use Phantom/i }).first().click()
    await expect(page.locator("#swap-recipient")).toHaveValue(VALID_SOL_RECIPIENT)
  })

  test("offers an install link when no wallet is present", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")
    await page.getByRole("button", { name: /Use Phantom/i }).first().click()
    await expect(page.getByRole("link", { name: /Install Phantom/i }).first()).toBeVisible()
  })
})
