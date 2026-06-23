import { test, expect } from "@playwright/test"
import { installSwapMocks, VALID_ZEC_REFUND, SHIELDED_ZEC } from "./mocks"

// Flip direction so the destination chain is Zcash and the recipient address
// drives the privacy assessment.
test.describe("privacy meter", () => {
  test.beforeEach(async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")
    await page.getByRole("button", { name: "Swap direction" }).click()
  })

  test("transparent recipient flags a privacy leak with a shielding handoff", async ({ page }) => {
    await page.locator("#swap-recipient").fill(VALID_ZEC_REFUND) // t1… transparent
    await expect(page.getByText("Privacy leak risk")).toBeVisible()
    await expect(page.getByText(/transparent t-address/i)).toBeVisible()
    await expect(page.getByRole("link", { name: /shielded Zcash address/i })).toBeVisible()
  })

  test("shielded recipient yields strong privacy", async ({ page }) => {
    await page.locator("#swap-recipient").fill(SHIELDED_ZEC) // u1… shielded
    await expect(page.getByText("Strong privacy")).toBeVisible()
    await expect(page.getByText(/shielded pool/i)).toBeVisible()
  })
})
