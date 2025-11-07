// Security utilities
import { headers } from "next/headers"

export async function getClientIP(): Promise<string> {
  const headersList = await headers()
  return headersList.get("x-forwarded-for")?.split(",")[0].trim() || headersList.get("x-real-ip") || "unknown"
}

export async function getUserAgent(): Promise<string> {
  const headersList = await headers()
  return headersList.get("user-agent") || "unknown"
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)")
  }

  return { valid: errors.length === 0, errors }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}
