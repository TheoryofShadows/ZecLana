"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RecipientStep } from "./steps/recipient-step"
import { AmountStep } from "./steps/amount-step"
import { ReviewStep } from "./steps/review-step"
import { ArrowLeft, Check, CheckCircle2, Shield } from "lucide-react"
import type { RemittanceData, Step } from "./types"

const INITIAL_DATA: RemittanceData = {
  recipientName: "",
  recipientEmail: "",
  recipientCountry: "",
  recipientWallet: "",
  amount: "",
  currency: "USD",
  exchangeRate: 1,
  receiveAmount: "",
  note: "",
}

export function SendRemittanceForm() {
  const [currentStep, setCurrentStep] = useState<Step>("recipient")
  const [data, setData] = useState<RemittanceData>(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState<{ data: RemittanceData; txId: string } | null>(null)

  const handleStepChange = useCallback((step: Step) => {
    setCurrentStep(step)
  }, [])

  const handleDataChange = useCallback((updates: Partial<RemittanceData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    // Surface a confirmation screen, then reset the form state.
    const txId = `zol_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
    setCompleted({ data, txId })
    setData(INITIAL_DATA)
    setCurrentStep("recipient")
  }

  const handleSendAnother = () => {
    setCompleted(null)
  }

  if (completed) {
    const { data: sent, txId } = completed
    return (
      <div className="w-full max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 shield-glow">
            <CheckCircle2 size={36} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Remittance Sent</h2>
          <p className="text-muted-foreground mb-6">
            Your private transfer to {sent.recipientName} is on its way.
          </p>

          <div className="space-y-3 text-left rounded-lg border border-border p-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Recipient</span>
              <span className="font-medium">{sent.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">You sent</span>
              <span className="font-medium">
                {sent.amount} {sent.currency}
              </span>
            </div>
            {sent.receiveAmount && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Recipient receives</span>
                <span className="font-medium text-secondary">
                  {sent.receiveAmount} {sent.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-xs">{txId}</span>
            </div>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
            <Shield size={14} className="text-secondary" />
            Encrypted end-to-end. Usually completes in 5-10 minutes.
          </p>

          <Button onClick={handleSendAnother} className="w-full">
            Send Another
          </Button>
        </Card>
      </div>
    )
  }

  const isRecipientValid = data.recipientName && data.recipientEmail && data.recipientWallet && data.recipientCountry

  const isAmountValid = data.amount && Number.parseFloat(data.amount) > 0

  const canProceedToAmount = isRecipientValid
  const canProceedToReview = isRecipientValid && isAmountValid

  return (
    <div className="w-full max-w-2xl">
      <Card className="p-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: "recipient", label: "Recipient", icon: "👤" },
              { id: "amount", label: "Amount", icon: "💰" },
              { id: "review", label: "Review", icon: "✓" },
            ].map((step, idx, arr) => (
              <div key={step.id} className="flex items-center gap-2 w-full">
                <button
                  onClick={() => {
                    if (
                      step.id === "recipient" ||
                      (step.id === "amount" && canProceedToAmount) ||
                      (step.id === "review" && canProceedToReview)
                    ) {
                      handleStepChange(step.id as Step)
                    }
                  }}
                  disabled={step.id === "amount" && !canProceedToAmount}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : step.id === "recipient" ||
                          (step.id === "amount" && canProceedToAmount) ||
                          (step.id === "review" && canProceedToReview)
                        ? "bg-secondary/20 text-secondary hover:bg-secondary/30 cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {step.icon}
                </button>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition ${currentStep === step.id || currentStep === arr[idx + 1].id ? "bg-secondary" : "bg-muted"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-medium">
            <span>Recipient</span>
            <span>Amount</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="mb-8">
          {currentStep === "recipient" && <RecipientStep data={data} onChange={handleDataChange} />}
          {currentStep === "amount" && <AmountStep data={data} onChange={handleDataChange} />}
          {currentStep === "review" && <ReviewStep data={data} onEdit={(step) => handleStepChange(step)} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          {currentStep !== "recipient" && (
            <Button
              variant="outline"
              onClick={() => handleStepChange(currentStep === "amount" ? "recipient" : "amount")}
              className="gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
          )}
          <div className="ml-auto flex gap-4">
            {currentStep === "recipient" && (
              <Button onClick={() => handleStepChange("amount")} disabled={!canProceedToAmount} className="gap-2">
                Next
              </Button>
            )}
            {currentStep === "amount" && (
              <Button onClick={() => handleStepChange("review")} disabled={!canProceedToReview} className="gap-2">
                Review
              </Button>
            )}
            {currentStep === "review" && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-secondary hover:bg-secondary/90"
              >
                {isSubmitting ? "Sending..." : "Send Remittance"}
                {!isSubmitting && <Check size={18} />}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
