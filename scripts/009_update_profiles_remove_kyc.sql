-- Remove KYC status from profiles table
alter table public.profiles drop column if exists kyc_status;
