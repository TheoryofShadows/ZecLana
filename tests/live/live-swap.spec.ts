import { test, expect } from "@playwright/test"
import { VALID_SOL_RECIPIENT, VALID_ZEC_REFUND } from "../e2e/mocks"

// Live, non-hermetic smoke against the real 1Click solver network. Skipped
// unless LIVE_SOLVER=1 so CI and the default suite stay deterministic.
//   LIVE_SOLVER=1 pnpm test:live
const LIVE = process.env.LIVE_SOLVER === "1"

test.describe("live solver", () => {
  test.skip(!LIVE, "set LIVE_SOLVER=1 to run against the real 1Click API")

  test("reserves a real deposit address end-to-end", async ({ page }) => {
    test.setTimeout(90_000)
    await page.goto("/zolana")
    await page.getByLabel("Amount to send").fill("0.5")
    await page.locator("#swap-recipient").fill(VALID_SOL_RECIPIENT)
    await page.locator("#swap-refund").fill(VALID_ZEC_REFUND)

    const reserve = page.getByRole("button", { name: "Get deposit address" })
    await expect(reserve).toBeEnabled()
    await reserve.click()

    // A real deposit address and QR should appear (or a clear solver-busy error).
    await expect(page.getByText("Complete your swap")).toBeVisible({ timeout: 60_000 })
    await expect(page.locator("svg[height='168']")).toBeVisible()
  })
})
