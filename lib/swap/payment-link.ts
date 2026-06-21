// No-account payment requests. A request is encoded entirely in a URL hash
// fragment (never sent to a server), so anyone can be asked to pay across chains
// with zero accounts on either side. The payer's swap delivers to the
// requester's address.

export interface PaymentRequest {
  v: 1
  /** Asset the requester wants to receive (1Click assetId). */
  destAssetId: string
  /** Requester's receiving address on the destination chain. */
  recipient: string
  /** Optional fixed amount of the destination asset. */
  amount?: string
  /** Optional human label / memo. */
  label?: string
}

function toBase64Url(input: string): string {
  // UTF-8 safe: btoa() only accepts Latin1, so a label like "Café ☕" must be
  // encoded to bytes first.
  const bytes = new TextEncoder().encode(input)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const b64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(input, "utf8").toString("base64")
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/")
  if (typeof atob === "function") {
    const binary = atob(b64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }
  return Buffer.from(b64, "base64").toString("utf8")
}

export function encodeRequest(req: PaymentRequest): string {
  return toBase64Url(JSON.stringify(req))
}

export function decodeRequest(encoded: string): PaymentRequest | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as PaymentRequest
    if (parsed.v !== 1 || !parsed.destAssetId || !parsed.recipient) return null
    return parsed
  } catch {
    return null
  }
}

/** Build a shareable pay link. The payload lives in the hash so it never hits a server. */
export function buildPayLink(origin: string, req: PaymentRequest): string {
  return `${origin}/pay#req=${encodeRequest(req)}`
}

/** Read a request from a URL hash like "#req=...". */
export function readRequestFromHash(hash: string): PaymentRequest | null {
  const match = hash.replace(/^#/, "").match(/(?:^|&)req=([^&]+)/)
  if (!match) return null
  // A malformed percent-escape (e.g. a stray "%") makes decodeURIComponent throw;
  // fall back to the raw value so a crafted link can never crash the pay page.
  let value: string
  try {
    value = decodeURIComponent(match[1])
  } catch {
    value = match[1]
  }
  return decodeRequest(value)
}
