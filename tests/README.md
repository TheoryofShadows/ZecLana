# Tests

Comprehensive, hermetic coverage for the ZEC ⇄ Solana swap feature.

## Layout

- `unit/` — Vitest (jsdom). Pure logic and browser-module behavior: amount math,
  privacy assessment, chain/address validation, payment-link encode/decode (with
  fuzzing), curated assets, spot estimate, local history, wallet connector, the
  1Click client (`fetch` mocked), and the browser swap client (`client.ts`).
- `e2e/` — Playwright against the static export (served by `serve-out.mjs`), with
  **all 1Click API calls mocked** (`mocks.ts`) for determinism. Covers the full
  configure→reserve
  flow, every status screen (SUCCESS/FAILED/REFUNDED/EXPIRED, expiry, progression),
  payment requests, the privacy meter, Phantom autofill, responsiveness, a route
  smoke check, and accessibility (`@axe-core/playwright`).
- `live/` — one gated smoke test that hits the **real** 1Click solver. Skipped
  unless `LIVE_SOLVER=1`, so CI and the default suite stay hermetic.

## Running

```bash
pnpm test:unit     # Vitest
pnpm test:e2e      # Playwright (builds + starts the app automatically)
pnpm test:a11y     # accessibility specs only
pnpm test:live     # LIVE_SOLVER=1 — real solver, run manually
```

CI (`.github/workflows/ci.yml`) runs lint → typecheck → build → unit, then the
mocked e2e + a11y suite.
