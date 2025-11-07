# Zolana Testing Guide

## Unit Tests
\`\`\`bash
npm test
npm test -- --coverage
\`\`\`

## Integration Tests
\`\`\`bash
npm run test:ci
\`\`\`

## E2E Testing
\`\`\`bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test

# Run in UI mode
npx playwright test --ui
\`\`\`

## Manual Testing Checklist

### Authentication
- [ ] Sign up with email/password
- [ ] Verify email confirmation
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Password reset flow
- [ ] Session timeout after 24 hours

### KYC/Compliance
- [ ] Submit KYC document
- [ ] View verification status
- [ ] Receive rejection with reason
- [ ] Resubmit after rejection

### Remittances
- [ ] Connect wallet (Solana/Zcash)
- [ ] Send remittance (USDC to recipient)
- [ ] View transaction status
- [ ] Receive email confirmation
- [ ] Privacy verification (funds shielded)

### Payments
- [ ] Create Stripe checkout
- [ ] Complete payment
- [ ] Receive payment confirmation
- [ ] View transaction history

### Dashboard
- [ ] View transaction history
- [ ] Check privacy shield status
- [ ] View yield opportunities
- [ ] Enable 2FA

## Performance Testing

\`\`\`bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://your-domain.com
\`\`\`

Target metrics:
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- Cumulative Layout Shift: < 0.1
