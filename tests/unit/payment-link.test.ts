import { describe, it, expect } from "vitest"
import {
  encodeRequest,
  decodeRequest,
  buildPayLink,
  readRequestFromHash,
  type PaymentRequest,
} from "@/lib/swap/payment-link"

const base: PaymentRequest = {
  v: 1,
  destAssetId: "nep141:zec.omft.near",
  recipient: "t1KzZxbwUNB4Hu1Hg3a4qWxGpGT5Bo4Mr8w",
}

describe("encode/decode round-trip", () => {
  it("round-trips a minimal request", () => {
    expect(decodeRequest(encodeRequest(base))).toEqual(base)
  })

  it("round-trips optional amount and label", () => {
    const req: PaymentRequest = { ...base, amount: "1.5", label: "Invoice #42" }
    expect(decodeRequest(encodeRequest(req))).toEqual(req)
  })

  it("round-trips unicode/emoji labels (UTF-8 safe)", () => {
    const req: PaymentRequest = { ...base, label: "Café ☕ — 日本語 🚀" }
    expect(decodeRequest(encodeRequest(req))?.label).toBe(req.label)
  })

  it("round-trips a very long label", () => {
    const req: PaymentRequest = { ...base, label: "x".repeat(2000) }
    expect(decodeRequest(encodeRequest(req))?.label?.length).toBe(2000)
  })

  it("produces URL-safe base64 (no +/= chars)", () => {
    const enc = encodeRequest({ ...base, label: "??>>__" })
    expect(enc).not.toMatch(/[+/=]/)
  })
})

describe("decodeRequest rejection", () => {
  it("returns null for garbage / non-base64", () => {
    expect(decodeRequest("!!!notbase64!!!")).toBeNull()
    expect(decodeRequest("")).toBeNull()
  })
  it("returns null for valid base64 that is not a v1 request", () => {
    const wrongVersion = encodeRequest({ ...base, v: 2 as unknown as 1 })
    expect(decodeRequest(wrongVersion)).toBeNull()
  })
  it("returns null when required fields are missing", () => {
    const noRecipient = Buffer.from(JSON.stringify({ v: 1, destAssetId: "x" })).toString("base64url")
    expect(decodeRequest(noRecipient)).toBeNull()
  })
})

describe("buildPayLink / readRequestFromHash", () => {
  it("builds a /pay link with the payload in the hash", () => {
    const link = buildPayLink("https://example.com", base)
    expect(link.startsWith("https://example.com/pay#req=")).toBe(true)
  })

  it("reads the request back from a hash", () => {
    const link = buildPayLink("https://example.com", { ...base, label: "Hi" })
    const hash = link.slice(link.indexOf("#"))
    expect(readRequestFromHash(hash)).toEqual({ ...base, label: "Hi" })
  })

  it("survives URL-encoding of the hash fragment", () => {
    const enc = encodeRequest(base)
    expect(readRequestFromHash(`#req=${encodeURIComponent(enc)}`)).toEqual(base)
  })

  it("returns null for a hash with no req param", () => {
    expect(readRequestFromHash("#foo=bar")).toBeNull()
    expect(readRequestFromHash("")).toBeNull()
  })
})

describe("fuzz: decode never throws", () => {
  it("returns null (never throws) on random input", () => {
    for (let i = 0; i < 1000; i++) {
      const len = Math.floor(Math.random() * 40)
      let s = ""
      for (let j = 0; j < len; j++) s += String.fromCharCode(33 + Math.floor(Math.random() * 94))
      expect(() => decodeRequest(s)).not.toThrow()
      expect(() => readRequestFromHash("#req=" + s)).not.toThrow()
    }
  })
})
