"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SendRemittanceForm } from "@/components/send/send-remittance-form"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock child components
jest.mock("@/components/send/steps/recipient-step", () => {
  return function MockRecipientStep({ data, onChange }: any) {
    return (
      <div data-testid="recipient-step">
        <input
          placeholder="Recipient Name"
          value={data.recipientName}
          onChange={(e) => onChange({ recipientName: e.target.value })}
        />
        <input
          placeholder="Recipient Email"
          value={data.recipientEmail}
          onChange={(e) => onChange({ recipientEmail: e.target.value })}
        />
        <input
          placeholder="Recipient Wallet"
          value={data.recipientWallet}
          onChange={(e) => onChange({ recipientWallet: e.target.value })}
        />
        <input
          placeholder="Recipient Country"
          value={data.recipientCountry}
          onChange={(e) => onChange({ recipientCountry: e.target.value })}
        />
      </div>
    )
  }
})

jest.mock("@/components/send/steps/amount-step", () => {
  return function MockAmountStep({ data, onChange }: any) {
    return (
      <div data-testid="amount-step">
        <input placeholder="Amount" value={data.amount} onChange={(e) => onChange({ amount: e.target.value })} />
      </div>
    )
  }
})

jest.mock("@/components/send/steps/review-step", () => {
  return function MockReviewStep({ data, onEdit }: any) {
    return (
      <div data-testid="review-step">
        <p>Review: {data.recipientName}</p>
      </div>
    )
  }
})

describe("SendRemittanceForm Component", () => {
  it("should render with recipient step by default", () => {
    render(<SendRemittanceForm />)
    expect(screen.getByTestId("recipient-step")).toBeInTheDocument()
  })

  it("should display progress steps", () => {
    render(<SendRemittanceForm />)
    expect(screen.getByText(/Recipient/i)).toBeInTheDocument()
    expect(screen.getByText(/Amount/i)).toBeInTheDocument()
    expect(screen.getByText(/Review/i)).toBeInTheDocument()
  })

  it("should not allow progression without valid recipient data", async () => {
    render(<SendRemittanceForm />)
    const nextButton = screen.getByRole("button", { name: /Next/i })
    expect(nextButton).toBeDisabled()
  })

  it("should allow progression with valid recipient data", async () => {
    const user = userEvent.setup()
    render(<SendRemittanceForm />)

    const nameInput = screen.getByPlaceholderText("Recipient Name")
    const emailInput = screen.getByPlaceholderText("Recipient Email")
    const walletInput = screen.getByPlaceholderText("Recipient Wallet")
    const countryInput = screen.getByPlaceholderText("Recipient Country")

    await user.type(nameInput, "John Doe")
    await user.type(emailInput, "john@example.com")
    await user.type(walletInput, "abc123wallet")
    await user.type(countryInput, "Philippines")

    const nextButton = screen.getByRole("button", { name: /Next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it("should have back button on amount step", async () => {
    const user = userEvent.setup()
    render(<SendRemittanceForm />)

    // Fill in recipient data
    await user.type(screen.getByPlaceholderText("Recipient Name"), "John Doe")
    await user.type(screen.getByPlaceholderText("Recipient Email"), "john@example.com")
    await user.type(screen.getByPlaceholderText("Recipient Wallet"), "abc123wallet")
    await user.type(screen.getByPlaceholderText("Recipient Country"), "Philippines")

    // Go to amount step
    const nextButton = screen.getByRole("button", { name: /Next/i })
    fireEvent.click(nextButton)

    // Amount step should be visible
    expect(screen.getByTestId("amount-step")).toBeInTheDocument()
    const backButton = screen.getByRole("button", { name: /Back/i })
    expect(backButton).toBeInTheDocument()
  })

  it("should have send button on review step", async () => {
    const user = userEvent.setup()
    render(<SendRemittanceForm />)

    // Fill in recipient data
    await user.type(screen.getByPlaceholderText("Recipient Name"), "John Doe")
    await user.type(screen.getByPlaceholderText("Recipient Email"), "john@example.com")
    await user.type(screen.getByPlaceholderText("Recipient Wallet"), "abc123wallet")
    await user.type(screen.getByPlaceholderText("Recipient Country"), "Philippines")

    // Go to amount step
    fireEvent.click(screen.getByRole("button", { name: /Next/i }))

    // Fill in amount
    await user.type(screen.getByPlaceholderText("Amount"), "100")

    // Go to review step
    fireEvent.click(screen.getByRole("button", { name: /Review/i }))

    // Review step should be visible with send button
    expect(screen.getByTestId("review-step")).toBeInTheDocument()
    const sendButton = screen.getByRole("button", { name: /Send Remittance/i })
    expect(sendButton).toBeInTheDocument()
  })
})
