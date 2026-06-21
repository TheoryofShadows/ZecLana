import { test, expect } from "@playwright/test"
import { installSwapMocks } from "./mocks"
import { collectPageErrors } from "./fixtures"

const ROUTES = [
  "/",
  "/zolana",
  "/request",
  "/pay",
  "/privacy-2.0",
  "/dashboard",
  "/dashboard/wallet",
  "/dashboard/defi",
  "/dashboard/transactions",
  "/login",
  "/signup",
  "/send",
  "/tachyon",
]

test.describe("route smoke", () => {
  for (const route of ROUTES) {
    test(`${route} renders 200 with no hydration error`, async ({ page }) => {
      const errors = collectPageErrors(page)
      await installSwapMocks(page) // harmless for non-swap routes
      const res = await page.goto(route, { waitUntil: "domcontentloaded" })
      expect(res?.status(), `status for ${route}`).toBeLessThan(400)
      await expect(page.locator("body")).toBeVisible()
      // No React hydration mismatch should be logged.
      const hydration = errors.filter((e) => /hydrat/i.test(e))
      expect(hydration, `hydration errors on ${route}`).toEqual([])
    })
  }
})
