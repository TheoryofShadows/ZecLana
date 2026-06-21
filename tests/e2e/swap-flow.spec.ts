import { test, expect } from "@playwright/test"
import { installSwapMocks, DEPOSIT_ADDRESS, VALID_SOL_RECIPIENT, VALID_ZEC_REFUND } from "./mocks"
import { reserveDefaultSwap } from "./fixtures"

test.describe("swap configuration → reserve", () => {
  test("shows an indicative quote after entering an amount", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")

    await page.getByLabel("Amount to send").fill("10")
    // Indicative output appears (10 * 0.199 = 1.9900) along with the rate detail.
    await expect(page.getByText("1.9900")).toBeVisible()
    await expect(page.getByText(/Indicative rate/i)).toBeVisible()
  })

  test("button is gated until amount + valid addresses are present", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")

    const button = page.getByRole("button")
    await expect(page.getByRole("button", { name: "Enter an amount" })).toBeVisible()

    await page.getByLabel("Amount to send").fill("5")
    await expect(page.getByRole("button", { name: "Enter your addresses" })).toBeVisible()

    await page.locator("#swap-recipient").fill(VALID_SOL_RECIPIENT)
    await page.locator("#swap-refund").fill(VALID_ZEC_REFUND)
    await expect(page.getByRole("button", { name: "Get deposit address" })).toBeEnabled()
    void button
  })

  test("reserving shows the deposit address, QR, and live tracking", async ({ page }) => {
    await installSwapMocks(page, { statuses: ["PENDING_DEPOSIT"] })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)

    await expect(page.getByText("Complete your swap")).toBeVisible()
    await expect(page.getByText(DEPOSIT_ADDRESS)).toBeVisible()
    await expect(page.locator("svg[height='168']")).toBeVisible()
    await expect(page.getByText(/Status: PENDING_DEPOSIT/)).toBeVisible()
    await expect(page.getByText("Live tracking")).toBeVisible()
    await expect(page.getByText(/Quote valid for/)).toBeVisible()
  })

  test("rejects an invalid recipient address (button stays gated)", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")
    await page.getByLabel("Amount to send").fill("1")
    await page.locator("#swap-recipient").fill("not-a-real-address")
    await page.locator("#swap-refund").fill(VALID_ZEC_REFUND)
    await expect(page.getByRole("button", { name: "Enter your addresses" })).toBeDisabled()
  })

  test("an empty token feed still allows configuring (fallback note shown)", async ({ page }) => {
    await installSwapMocks(page, { tokensFail: true })
    await page.goto("/zolana")
    await expect(page.getByText(/Live price feed unavailable/i)).toBeVisible()
  })
})
