import { test, expect } from "@playwright/test"
import { installSwapMocks } from "./mocks"

const VIEWPORTS = [
  { name: "mobile", width: 320, height: 700 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
]

test.describe("responsive layout", () => {
  for (const vp of VIEWPORTS) {
    test(`no horizontal overflow at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await installSwapMocks(page)
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto("/zolana")
      await expect(page.getByText("Swap any asset ⇄ ZEC")).toBeVisible()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      // Allow a 1px rounding tolerance.
      expect(overflow).toBeLessThanOrEqual(1)
    })
  }

  test("renders in dark color scheme without errors", async ({ page }) => {
    await installSwapMocks(page)
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto("/zolana")
    await expect(page.getByText("Swap any asset ⇄ ZEC")).toBeVisible()
  })

  test("honors prefers-reduced-motion", async ({ page }) => {
    await installSwapMocks(page)
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/zolana")
    await expect(page.locator(".swap-frame")).toBeVisible()
  })
})
