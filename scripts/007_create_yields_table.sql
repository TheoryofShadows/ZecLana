-- Create yield/staking opportunities table
create table if not exists public.yield_opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  protocol text not null, -- 'orca', 'raydium', 'marinade', 'zenZEC'
  asset text not null, -- 'SOL', 'USDC', 'ZEC'
  apy numeric not null,
  tvl numeric, -- Total Value Locked
  risk_level text default 'medium', -- low, medium, high
  minimum_stake numeric,
  lock_period integer, -- in days
  is_active boolean default true,
  kyc_required boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_yield_opportunities_protocol on public.yield_opportunities(protocol);
create index idx_yield_opportunities_asset on public.yield_opportunities(asset);
create index idx_yield_opportunities_is_active on public.yield_opportunities(is_active);

-- User yield positions
create table if not exists public.yield_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.yield_opportunities(id) on delete restrict,
  amount_staked numeric not null,
  earned_amount numeric default 0,
  status text default 'active', -- active, unstaking, completed
  started_at timestamp,
  unstaking_at timestamp,
  completed_at timestamp,
  created_at timestamp with time zone default now()
);

alter table public.yield_positions enable row level security;

create policy "yield_positions_select_own"
  on public.yield_positions for select
  using (auth.uid() = user_id);

create policy "yield_positions_insert_own"
  on public.yield_positions for insert
  with check (auth.uid() = user_id);

create index idx_yield_positions_user_id on public.yield_positions(user_id);
create index idx_yield_positions_status on public.yield_positions(status);
