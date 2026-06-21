import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"
import { VALID_SOL_RECIPIENT, VALID_ZEC_REFUND } from "./mocks"

// Fill the default ZEC -> szEC(Solana) swap form and reserve a deposit address.
// Assumes installSwapMocks() has already been called and the page is on /zolana.
export async function reserveDefaultSwap(page: Page, amount = "10") {
  await page.getByLabel("Amount to send").fill(amount)
  // Recipient is a Solana address; refund is a Zcash address (default pair).
  await page.locator("#swap-recipient").fill(VALID_SOL_RECIPIENT)
  await page.locator("#swap-refund").fill(VALID_ZEC_REFUND)

  const reserve = page.getByRole("button", { name: "Get deposit address" })
  await expect(reserve).toBeEnabled()
  await reserve.click()
}

/** Collect browser console errors and page errors for a "clean render" assertion. */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(err.message))
  return errors
}
