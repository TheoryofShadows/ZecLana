import { describe, it, expect } from "vitest"
import { toSmallestUnit, fromSmallestUnit } from "@/lib/swap/amount"

describe("toSmallestUnit", () => {
  it("converts whole and fractional amounts at various decimals", () => {
    expect(toSmallestUnit("1", 8)).toBe("100000000")
    expect(toSmallestUnit("1.25", 8)).toBe("125000000")
    expect(toSmallestUnit("0.00052", 8)).toBe("52000")
    expect(toSmallestUnit("1", 0)).toBe("1")
    expect(toSmallestUnit("0", 8)).toBe("0")
  })

  it("handles leading/trailing zeros and a bare leading dot", () => {
    expect(toSmallestUnit("01.50", 6)).toBe("1500000")
    expect(toSmallestUnit(".5", 8)).toBe("50000000")
    expect(toSmallestUnit("0.0", 8)).toBe("0")
  })

  it("truncates excess precision rather than rounding", () => {
    // 9 fractional digits at 8 decimals -> last digit dropped, no round-up
    expect(toSmallestUnit("1.999999999", 8)).toBe("199999999")
    expect(toSmallestUnit("0.123456789", 6)).toBe("123456")
  })

  it("supports very large values and high-decimal chains (NEAR=24)", () => {
    expect(toSmallestUnit("1", 24)).toBe("1000000000000000000000000")
    expect(toSmallestUnit("1000000.5", 18)).toBe("1000000500000000000000000")
  })

  it("trims surrounding whitespace", () => {
    expect(toSmallestUnit("  1.5  ", 8)).toBe("150000000")
  })

  it.each(["", ".", "abc", "1.5.5", "1e9", "-1", "0x10", "1,5", "1 5"])(
    "rejects invalid input %j",
    (bad) => {
      expect(() => toSmallestUnit(bad, 8)).toThrow()
    },
  )
})

describe("fromSmallestUnit", () => {
  it("round-trips with toSmallestUnit", () => {
    for (const [human, decimals] of [
      ["1", 8],
      ["1.25", 8],
      ["0.00052", 8],
      ["123.456", 6],
    ] as const) {
      const raw = toSmallestUnit(human, decimals)
      expect(fromSmallestUnit(raw, decimals)).toBe(human)
    }
  })

  it("strips trailing zeros and caps fraction digits", () => {
    expect(fromSmallestUnit("100000000", 8)).toBe("1")
    expect(fromSmallestUnit("125000000", 8)).toBe("1.25")
    // maxFractionDigits default 6 truncates an 8-decimal value
    expect(fromSmallestUnit("123456789", 8)).toBe("1.234567")
  })

  it("formats sub-one values with a leading zero", () => {
    expect(fromSmallestUnit("52000", 8)).toBe("0.00052")
    expect(fromSmallestUnit("1", 8)).toBe("0")
  })

  it("preserves negative sign", () => {
    expect(fromSmallestUnit("-150000000", 8)).toBe("-1.5")
  })
})

describe("decimal fuzz", () => {
  // Property: a value built from smallest units always round-trips losslessly
  // when read back at the same (capped) precision.
  it("round-trips random small-unit values", () => {
    const decimals = 8
    for (let i = 0; i < 500; i++) {
      const raw = String(Math.floor(Math.random() * 1e12))
      const human = fromSmallestUnit(raw, decimals, decimals)
      // re-encoding the human-readable form must not exceed the original
      const back = toSmallestUnit(human, decimals)
      expect(BigInt(back)).toBeLessThanOrEqual(BigInt(raw))
    }
  })
})
