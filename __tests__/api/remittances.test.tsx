describe("Remittances API", () => {
  it("should create remittance with valid data", async () => {
    const response = await fetch("/api/remittances/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientEmail: "recipient@example.com",
        amount: 100,
        currencySent: "USDC",
        currencyReceived: "USD",
        sourceWalletId: "test-wallet-id",
        destinationType: "bank",
      }),
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBeDefined()
    expect(data.status).toBe("pending")
  })

  it("should reject without auth", async () => {
    const response = await fetch("/api/remittances/send", {
      method: "POST",
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(401)
  })
})
