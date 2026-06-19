export type Step = "recipient" | "amount" | "review"

export interface RemittanceData {
  recipientName: string
  recipientEmail: string
  recipientCountry: string
  recipientWallet: string
  amount: string
  currency: string
  exchangeRate: number
  receiveAmount: string
  note: string
}
