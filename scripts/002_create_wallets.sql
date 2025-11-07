-- Create wallets table for Solana and Zcash addresses
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wallet_type text not null, -- 'solana', 'zcash', 'ethereum'
  wallet_address text not null,
  public_key text,
  is_primary boolean default false,
  is_verified boolean default false,
  verification_timestamp timestamp,
  balance_sol numeric default 0,
  balance_zec numeric default 0,
  balance_usdc numeric default 0,
  last_sync timestamp,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, wallet_type, wallet_address)
);

alter table public.wallets enable row level security;

create policy "wallets_select_own"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy "wallets_insert_own"
  on public.wallets for insert
  with check (auth.uid() = user_id);

create policy "wallets_update_own"
  on public.wallets for update
  using (auth.uid() = user_id);

create policy "wallets_delete_own"
  on public.wallets for delete
  using (auth.uid() = user_id);

create index idx_wallets_user_id on public.wallets(user_id);
create index idx_wallets_wallet_address on public.wallets(wallet_address);
create index idx_wallets_is_primary on public.wallets(is_primary);
