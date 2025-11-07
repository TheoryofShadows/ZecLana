-- Create KYC documents table for compliance
create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null, -- 'passport', 'driver_license', 'national_id', 'proof_of_address'
  document_url text not null,
  document_hash text,
  verification_status text default 'pending', -- pending, verified, rejected
  rejection_reason text,
  verified_by uuid references public.profiles(id),
  verified_at timestamp,
  expires_at timestamp,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.kyc_documents enable row level security;

create policy "kyc_documents_select_own"
  on public.kyc_documents for select
  using (auth.uid() = user_id);

create policy "kyc_documents_insert_own"
  on public.kyc_documents for insert
  with check (auth.uid() = user_id);

create index idx_kyc_documents_user_id on public.kyc_documents(user_id);
create index idx_kyc_documents_verification_status on public.kyc_documents(verification_status);
