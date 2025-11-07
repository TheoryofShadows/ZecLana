# Zolana Test Suite

This directory contains the comprehensive test suite for the Zolana v2 remittance application.

## Test Structure

- `utils.test.ts` - Utility function tests (cn, etc.)
- `components/` - Component unit tests
  - `hero.test.tsx` - Hero section tests
  - `features.test.tsx` - Features component tests
  - `send-remittance-form.test.tsx` - Send remittance form tests
- `integration/` - Integration tests
  - `home-page.test.tsx` - Home page composition tests

## Running Tests

### Watch mode (development)
\`\`\`bash
npm test
\`\`\`

### CI mode with coverage
\`\`\`bash
npm run test:ci
\`\`\`

### Coverage report only
\`\`\`bash
npm run test:coverage
\`\`\`

## Test Coverage

The test suite provides coverage for:
- Component rendering
- User interactions
- Form validation
- Navigation flows
- Data binding
- Conditional rendering

## Writing New Tests

1. Create test files in `__tests__` directory or within component folders
2. Use `.test.tsx` or `.test.ts` suffix
3. Follow the pattern: describe → it → expect
4. Mock external dependencies (Next.js Link, API calls, etc.)
5. Use React Testing Library for DOM testing

### Best Practices

- Test user behavior, not implementation details
- Use semantic queries (getByRole, getByText, getByLabelText)
- Mock Next.js specific features (Link, Router, etc.)
- Keep tests focused and isolated
- Use meaningful test descriptions

## Debugging Tests

Add debug output in tests:
\`\`\`tsx
import { render, screen } from '@testing-library/react'

it('debug example', () => {
  const { debug } = render(<YourComponent />)
  debug() // prints the DOM
})
\`\`\`

Run specific test file:
\`\`\`bash
npm test -- send-remittance-form.test
\`\`\`

Update snapshots:
\`\`\`bash
npm test -- -u
