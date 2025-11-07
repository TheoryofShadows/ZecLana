import { cn } from "@/lib/utils"

describe("Utils - cn function", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "px-4")
    expect(result).toContain("py-1")
    expect(result).toContain("px-4")
    expect(result).not.toContain("px-2")
  })

  it("should handle empty strings", () => {
    const result = cn("px-2", "", "py-1")
    expect(result).toBe("px-2 py-1")
  })

  it("should handle conditional classes", () => {
    const isActive = true
    const result = cn("base-class", isActive && "active-class")
    expect(result).toContain("base-class")
    expect(result).toContain("active-class")
  })

  it("should handle false conditions", () => {
    const isActive = false
    const result = cn("base-class", isActive && "active-class")
    expect(result).toBe("base-class")
  })
})
