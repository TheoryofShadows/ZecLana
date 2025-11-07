-- Create admin user table for compliance officers and support staff
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null, -- 'super_admin', 'compliance_officer', 'support_agent'
  permissions jsonb, -- store specific permissions
  created_at timestamp with time zone default now(),
  last_login timestamp,
  is_active boolean default true
);

create index idx_admin_users_role on public.admin_users(role);
create index idx_admin_users_is_active on public.admin_users(is_active);
