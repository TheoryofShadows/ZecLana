-- Replaced KYC documents table with privacy-preserving preference tracking
create table if not exists public.privacy_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mixing_enabled boolean default true, -- Enable Zcash coin mixing
  privacy_level text default 'maximum', -- 'standard', 'enhanced', 'maximum'
  anonymity_set_size integer default 16, -- Zcash anonymity set
  privacy_fade_time integer default 72, -- Hours before tx metadata expires
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.privacy_preferences enable row level security;

create policy "privacy_preferences_select_own"
  on public.privacy_preferences for select
  using (auth.uid() = user_id);

create policy "privacy_preferences_update_own"
  on public.privacy_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_privacy_preferences_user_id on public.privacy_preferences(user_id);
