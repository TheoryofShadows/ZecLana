// Privacy & Encryption Utilities for Zolana
import crypto from "crypto"

// AES-256 encryption for sensitive data
export function encryptSensitiveData(data: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(encryptionKey).digest(), iv)

  let encrypted = cipher.update(data, "utf-8", "hex")
  encrypted += cipher.final("hex")

  return iv.toString("hex") + ":" + encrypted
}

export function decryptSensitiveData(encryptedData: string, encryptionKey: string): string {
  const parts = encryptedData.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const encrypted = parts[1]

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(encryptionKey).digest(),
    iv,
  )

  let decrypted = decipher.update(encrypted, "hex", "utf-8")
  decrypted += decipher.final("utf-8")

  return decrypted
}

// Hash sensitive information for compliance
export function hashForCompliance(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

// Generate encryption key from master key
export function deriveKey(masterKey: string, salt: string): string {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, "sha256").toString("hex")
}
