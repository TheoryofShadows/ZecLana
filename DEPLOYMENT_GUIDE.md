# Zolana Production Deployment Guide

## Pre-Deployment Checklist

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] DATABASE_URL (for Supabase)
- [ ] NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (for dev only)

### Database Migrations
\`\`\`bash
# Run all migrations in order
psql -U postgres -d zolana_db -f scripts/001_create_profiles.sql
psql -U postgres -d zolana_db -f scripts/002_create_wallets.sql
psql -U postgres -d zolana_db -f scripts/003_create_remittances.sql
psql -U postgres -d zolana_db -f scripts/004_create_kyc_documents.sql
psql -U postgres -d zolana_db -f scripts/005_create_transactions.sql
psql -U postgres -d zolana_db -f scripts/006_create_compliance_logs.sql
psql -U postgres -d zolana_db -f scripts/007_create_yields_table.sql
psql -U postgres -d zolana_db -f scripts/008_create_admin_users.sql
\`\`\`

## Deployment Steps

### 1. Vercel Deployment
\`\`\`bash
# Push to GitHub
git add .
git commit -m "Production deployment"
git push origin main

# Deploy via Vercel CLI
vercel --prod
\`\`\`

### 2. Post-Deployment

#### Enable RLS on all tables
\`\`\`bash
# Connect to Supabase
supabase projects list
supabase start

# RLS is already enabled in migration scripts
\`\`\`

#### Configure Stripe Webhook
\`\`\`bash
# Get webhook signing secret
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Set in environment variables
\`\`\`

#### Create Admin User
\`\`\`sql
INSERT INTO public.admin_users (id, role, is_active)
VALUES ('admin-user-id', 'super_admin', true);
\`\`\`

## Monitoring

### Health Check
\`\`\`bash
curl https://your-domain.com/api/health/check
\`\`\`

### Logging
All requests are logged in Supabase audit_logs table via RLS policies.

## Scaling Considerations

- Supabase connection pooling: Enable PgBouncer for high traffic
- Stripe rate limits: Default 100 requests/second
- Solana RPC: Use Helius or Triton for redundancy
- Database backups: Enable automated daily backups
