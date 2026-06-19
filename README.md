# Solana Zcash App

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nfts-ol/v0-solana-zcash-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/o9oSTmuA4ck)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/nfts-ol/v0-solana-zcash-app](https://vercel.com/nfts-ol/v0-solana-zcash-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/o9oSTmuA4ck](https://v0.app/chat/o9oSTmuA4ck)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## ZEC ⇄ Solana Swap

The `/zolana` page is a working, non-custodial swap that moves ZEC between
Zcash and Solana (and back), with no account and no KYC. It is backed by the
[NEAR Intents 1Click API](https://docs.near-intents.org), where a decentralized
solver network settles the swap.

### How a swap flows

1. Pick a direction (e.g. native **ZEC → ZEC on Solana (szEC)**, or SOL / USDC),
   enter an amount, and get a live quote.
2. Enter your **recipient** address (where you receive) and a **refund** address
   (where funds return if the swap can't complete).
3. Reserve a quote — the solver returns a one-time **deposit address**.
4. Send the exact origin amount to that address. The widget polls status until
   the destination asset is delivered to your recipient address.

Because native ZEC can't live in a Solana wallet, the ZEC side always uses a
deposit-address flow — this is inherent to cross-chain swaps, not a limitation
of the app.

### Configuration

No setup is required — the 1Click API is public. Optional overrides live in
`.env.example` (copy to `.env.local`):

- `ONECLICK_BASE_URL` — override the API endpoint.
- `ONECLICK_JWT` — optional token for better solver rates (not required).

### Code map

- `lib/swap/` — typed 1Click client, curated asset list, decimal-safe math.
- `app/api/swap/{tokens,quote,status}` — server routes that proxy 1Click.
- `components/swap/swap-widget.tsx` — the swap UI (quote → deposit → tracking).

### Notes & limits

- Quotes come from a live solver network; if solvers are briefly slow, the
  preview shows an *indicative* spot-price estimate, but a real deposit address
  is only reserved from a live solver quote.
- Fiat off-ramp (ZEC → cash) is intentionally **not** included yet, to keep the
  flow no-KYC. It would require a regulated provider with identity checks.
