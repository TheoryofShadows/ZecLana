-- Create detailed transaction logs
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  transaction_type text not null, -- 'deposit', 'withdrawal', 'transfer', 'stake', 'unstake'
  amount numeric not null,
  currency text not null,
  from_wallet text,
  to_wallet text,
  status text default 'pending', -- pending, processing, completed, failed
  blockchain_hash text,
  gas_fee numeric default 0,
  platform_fee numeric default 0,
  total_fee numeric generated always as (gas_fee + platform_fee) stored,
  description text,
  metadata jsonb, -- store additional data like RPC endpoint used, etc
  created_at timestamp with time zone default now(),
  completed_at timestamp,
  updated_at timestamp with time zone default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_status on public.transactions(status);
create index idx_transactions_created_at on public.transactions(created_at);
create index idx_transactions_blockchain_hash on public.transactions(blockchain_hash);
