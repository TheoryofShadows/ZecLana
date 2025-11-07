"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RecipientStep } from "./steps/recipient-step"
import { AmountStep } from "./steps/amount-step"
import { ReviewStep } from "./steps/review-step"
import { ArrowLeft, Check } from "lucide-react"

type Step = "recipient" | "amount" | "review"

interface RemittanceData {
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

  const handleStepChange = (step: Step) => {
    setCurrentStep(step)
  }

  const handleDataChange = (updates: Partial<RemittanceData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    // Reset form after successful submission
    setData(INITIAL_DATA)
    setCurrentStep("recipient")
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
