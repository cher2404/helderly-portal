-- Helderly: Trial/subscription on profiles, milestone created_by + status, ensure RLS
-- Run after 009. Idempotent (safe to re-run).

-- 1. Profiles: ensure trial_starts_at, subscription_status includes 'trial', accent_color, logo_url exist
alter table public.profiles
  add column if not exists trial_starts_at timestamptz default now(),
  add column if not exists subscription_status text default 'trial',
  add column if not exists accent_color text,
  add column if not exists logo_url text;

-- Allow 'trial' in subscription_status (may already be 'free'|'active' from 002)
do $$
begin
  alter table public.profiles drop constraint if exists profiles_subscription_status_check;
exception when others then null;
end $$;
alter table public.profiles
  add constraint profiles_subscription_status_check
  check (subscription_status in ('free', 'trial', 'active'));

-- Set default for new rows
alter table public.profiles alter column subscription_status set default 'trial';

-- 2. Milestones (project_stages): created_by + status for collaboration (pending_approval)
alter table public.project_stages
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists status text not null default 'active' check (status in ('active', 'pending_approval'));

create index if not exists idx_project_stages_created_by on public.project_stages(created_by);

-- 3. Projects: layout_config (already in 009, ensure it exists)
alter table public.projects
  add column if not exists layout_config jsonb default null;

-- 4. RLS: ensure enabled (already on from 001/003)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_stages enable row level security;

comment on column public.profiles.trial_starts_at is 'When the 30-day trial started';
comment on column public.profiles.subscription_status is 'free | trial | active (pro)';
comment on column public.project_stages.created_by is 'User who created this milestone (null = legacy)';
comment on column public.project_stages.status is 'active (visible) | pending_approval (customer-proposed)';
