import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { installSwapMocks, VALID_ZEC_REFUND } from "./mocks"
import { encodeRequest } from "../../lib/swap/payment-link"

const ZEC_NATIVE = "nep141:zec.omft.near"

async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")
  return serious
}

test.describe("accessibility (no serious/critical violations)", () => {
  test("landing page", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/")
    expect(await scan(page)).toEqual([])
  })

  test("swap page", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/zolana")
    await page.getByLabel("Amount to send").fill("1")
    expect(await scan(page)).toEqual([])
  })

  test("request page", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto("/request")
    expect(await scan(page)).toEqual([])
  })

  test("pay page (locked request)", async ({ page }) => {
    await installSwapMocks(page)
    await page.goto(`/pay#req=${encodeRequest({ v: 1, destAssetId: ZEC_NATIVE, recipient: VALID_ZEC_REFUND })}`)
    await page.getByText("Pay this request").waitFor()
    expect(await scan(page)).toEqual([])
  })
})
