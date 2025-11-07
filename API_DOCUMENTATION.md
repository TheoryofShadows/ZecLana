# Zolana API Documentation

## Authentication
All endpoints require a valid Supabase session token (JWT) in the Authorization header.

\`\`\`bash
Authorization: Bearer eyJhbGc...
\`\`\`

## Endpoints

### Remittances

#### Send Remittance
\`\`\`
POST /api/remittances/send
Content-Type: application/json

{
  "recipientEmail": "recipient@example.com",
  "amount": 100,
  "currencySent": "USDC",
  "currencyReceived": "USD",
  "sourceWalletId": "wallet-id",
  "destinationType": "bank",
  "bankDetails": { "accountNumber": "...", "routingNumber": "..." }
}

Response: { id, status, amount_sent, fee_amount, total_amount }
\`\`\`

#### Get Remittance Status
\`\`\`
GET /api/remittances/status?id=remittance-id

Response: { id, status, sender_id, recipient_email, amount_sent, currency_sent, ... }
\`\`\`

### Wallets

#### Connect Wallet
\`\`\`
POST /api/wallets/connect
Content-Type: application/json

{
  "walletType": "solana",
  "walletAddress": "5a....",
  "publicKey": "5a...."
}

Response: { id, wallet_type, wallet_address, is_verified }
\`\`\`

### Compliance

#### Submit KYC Document
\`\`\`
POST /api/compliance/kyc/submit
Content-Type: multipart/form-data

- documentType: passport
- file: [binary PDF]

Response: { id, document_type, verification_status }
\`\`\`

#### Check AML Status
\`\`\`
POST /api/compliance/aml-check
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "country": "US"
}

Response: { aml_pass, sanctions_risk, suspicious_patterns }
\`\`\`

### Payments

#### Create Stripe Checkout
\`\`\`
POST /api/payments/create-checkout
Content-Type: application/json

{
  "remittanceId": "remittance-id",
  "amount": 100,
  "currency": "USD"
}

Response: { sessionId, url }
\`\`\`

### Analytics

#### Track Event
\`\`\`
POST /api/analytics/events
Content-Type: application/json

{
  "event_type": "remittance_sent",
  "event_data": { ... },
  "page_url": "/send"
}

Response: { success: true }
\`\`\`

### Blockchain

#### Bridge ZEC to SOL
\`\`\`
POST /api/blockchain/solana/bridge
Content-Type: application/json

{
  "amount": 10,
  "sourceChain": "zcash",
  "destinationChain": "solana",
  "destinationAddress": "5a...."
}

Response: { transaction_id, status, message }
\`\`\`

## Error Codes

- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 400: Bad request (invalid parameters)
- 429: Too many requests (rate limited)
- 500: Server error
