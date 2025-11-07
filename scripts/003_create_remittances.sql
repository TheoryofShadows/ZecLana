-- Create remittances table for transaction records
create table if not exists public.remittances (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid references public.profiles(id) on delete set null,
  recipient_email text, -- for non-registered recipients
  recipient_phone text,
  recipient_country text,
  status text not null default 'pending', -- pending, processing, completed, failed, cancelled
  amount_sent numeric not null,
  amount_received numeric not null,
  currency_sent text default 'USDC', -- USDC, USDT, ZEC, SOL
  currency_received text default 'USD',
  exchange_rate numeric,
  source_wallet_id uuid references public.wallets(id),
  destination_wallet_id uuid references public.wallets(id),
  destination_type text, -- 'wallet', 'bank', 'cash_pickup'
  bank_details jsonb, -- for bank transfers
  payment_method text, -- 'crypto', 'bank_transfer', 'cash_pickup'
  transaction_hash text, -- Solana/Zcash transaction hash
  shielded boolean default true, -- using Zcash privacy
  fee_amount numeric default 0,
  total_amount numeric generated always as (amount_sent + fee_amount) stored,
  notes text,
  created_at timestamp with time zone default now(),
  completed_at timestamp,
  updated_at timestamp with time zone default now()
);

alter table public.remittances enable row level security;

create policy "remittances_select_own"
  on public.remittances for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "remittances_insert_own"
  on public.remittances for insert
  with check (auth.uid() = sender_id);

create policy "remittances_update_own"
  on public.remittances for update
  using (auth.uid() = sender_id);

create index idx_remittances_sender_id on public.remittances(sender_id);
create index idx_remittances_recipient_id on public.remittances(recipient_id);
create index idx_remittances_status on public.remittances(status);
create index idx_remittances_created_at on public.remittances(created_at);
create index idx_remittances_transaction_hash on public.remittances(transaction_hash);
