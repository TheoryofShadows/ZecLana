-- Create audit and compliance logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null, -- 'login', 'kyc_submission', 'transaction_initiated', 'settings_changed'
  resource_type text, -- 'profile', 'wallet', 'remittance'
  resource_id text,
  changes jsonb, -- what changed
  ip_address inet,
  user_agent text,
  status text default 'success', -- success, failed
  error_message text,
  created_at timestamp with time zone default now()
);

create index idx_audit_logs_user_id on public.audit_logs(user_id);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_created_at on public.audit_logs(created_at);

-- Compliance monitoring table
create table if not exists public.compliance_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  alert_type text not null, -- 'high_transaction', 'suspicious_activity', 'kyc_expired', 'sanctions_match'
  severity text default 'medium', -- low, medium, high, critical
  description text,
  resolution_status text default 'open', -- open, resolved, false_alarm
  created_at timestamp with time zone default now(),
  resolved_at timestamp
);

create index idx_compliance_alerts_user_id on public.compliance_alerts(user_id);
create index idx_compliance_alerts_severity on public.compliance_alerts(severity);
create index idx_compliance_alerts_resolution_status on public.compliance_alerts(resolution_status);
