import { test, expect } from "@playwright/test"
import { installSwapMocks } from "./mocks"
import { reserveDefaultSwap } from "./fixtures"

// These terminal screens are effectively unreachable against the live solver in
// a test; mocking the status feed lets us verify them deterministically.

test.describe("status screens", () => {
  test("SUCCESS shows the completion screen and explorer link", async ({ page }) => {
    await installSwapMocks(page, { statuses: ["SUCCESS"], destinationTxHash: "ABC123" })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)

    await expect(page.getByText("Swap complete")).toBeVisible()
    await expect(page.getByText(/ZEC delivered/i)).toBeVisible()
    await expect(page.getByText(/Sent to your Solana address/i)).toBeVisible()
    const link = page.getByRole("link", { name: /View transaction/i })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", /solscan\.io\/tx\/ABC123/)
  })

  test("FAILED shows the refund message", async ({ page }) => {
    await installSwapMocks(page, { statuses: ["FAILED"] })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)

    await expect(page.getByText(/Swap failed/i)).toBeVisible()
    await expect(page.getByText(/funds are returned to your refund address/i)).toBeVisible()
  })

  test("REFUNDED shows a terminal message", async ({ page }) => {
    await installSwapMocks(page, { statuses: ["REFUNDED"] })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)
    await expect(page.getByText(/Swap refunded/i)).toBeVisible()
  })

  test("EXPIRED shows a terminal message", async ({ page }) => {
    await installSwapMocks(page, { statuses: ["EXPIRED"] })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)
    await expect(page.getByText(/Swap expired/i)).toBeVisible()
  })

  test("progresses PENDING → PROCESSING → SUCCESS as the feed advances", async ({ page }) => {
    await installSwapMocks(page, { statuses: ["PENDING_DEPOSIT", "PROCESSING", "SUCCESS"], destinationTxHash: "XYZ" })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)

    await expect(page.getByText(/Status: PENDING_DEPOSIT/)).toBeVisible()
    // Polls every 8s; allow the sequence to advance to the success screen.
    await expect(page.getByText("Swap complete")).toBeVisible({ timeout: 25_000 })
  })

  test("an expired live quote warns not to send", async ({ page }) => {
    await installSwapMocks(page, {
      statuses: ["PENDING_DEPOSIT"],
      liveDeadline: new Date(Date.now() - 60_000).toISOString(),
    })
    await page.goto("/zolana")
    await reserveDefaultSwap(page)
    await expect(page.getByText(/This quote has expired/i)).toBeVisible()
  })
})
