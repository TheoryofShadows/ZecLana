import { test, expect } from "@playwright/test"
import { installSwapMocks, VALID_ZEC_REFUND } from "./mocks"
import { encodeRequest } from "../../lib/swap/payment-link"

const ZEC_NATIVE = "nep141:zec.omft.near"

function payLink(req: Parameters<typeof encodeRequest>[0]) {
  return `/pay#req=${encodeRequest(req)}`
}

test.describe("payment requests", () => {
  test("request page generates a shareable /pay link", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/request")
    await page.getByPlaceholder(/Zcash address/i).fill(VALID_ZEC_REFUND)
    await expect(page.getByText(/\/pay#req=/)).toBeVisible()
  })

  test("a valid link prefills the locked pay widget", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto(payLink({ v: 1, destAssetId: ZEC_NATIVE, recipient: VALID_ZEC_REFUND, label: "Invoice 7" }))

    await expect(page.getByText("Pay this request")).toBeVisible()
    await expect(page.getByText("Invoice 7", { exact: false })).toBeVisible()
    await expect(page.getByText(VALID_ZEC_REFUND)).toBeVisible()
    // Destination select is locked so the payer cannot redirect funds.
    await expect(page.getByText(/Recipient \(Zcash\)/)).toBeVisible()
  })

  test("a malformed link shows the not-found state", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/pay#req=%E0%A4%A")
    await expect(page.getByText(/No payment request found/i)).toBeVisible()
  })

  test("a link for an uncurated asset is rejected", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto(payLink({ v: 1, destAssetId: "nope:not:curated", recipient: VALID_ZEC_REFUND }))
    await expect(page.getByText(/No payment request found/i)).toBeVisible()
  })

  test("a malicious label renders inert (no script execution)", async ({ page }) => {
    await installSwapMocks(page)
    let dialogFired = false
    page.on("dialog", async (d) => {
      dialogFired = true
      await d.dismiss()
    })
    const xss = "<img src=x onerror=alert(1)>"
    await page.goto(payLink({ v: 1, destAssetId: ZEC_NATIVE, recipient: VALID_ZEC_REFUND, label: xss }))
    await expect(page.getByText("Pay this request")).toBeVisible()
    // The label is shown as literal text, and no alert dialog ever fires.
    await expect(page.getByText(xss)).toBeVisible()
    expect(dialogFired).toBe(false)
  })
})
