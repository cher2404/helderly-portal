-- Helderly: Appointments, Contact Log, Milestone upgrades
-- Run in Supabase SQL Editor after 001, 002, 003.

-- Appointments (Meetings) per project
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  appointment_date date not null,
  appointment_time text,
  location text,
  status text not null default 'upcoming' check (status in ('upcoming', 'completed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_appointments_project_id on public.appointments(project_id);

-- Contact log (interaction history) per project
create table if not exists public.contact_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null,
  channel text not null,
  summary text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_contact_logs_project_id on public.contact_logs(project_id);

-- Upgrade project_stages: due_date and stage_status (blocked | in_progress | done)
alter table public.project_stages
  add column if not exists due_date date,
  add column if not exists stage_status text default 'in_progress' check (stage_status in ('blocked', 'in_progress', 'done'));

-- RLS appointments: owner full access, client read-only
alter table public.appointments enable row level security;

create policy "Admins manage appointments for own projects"
  on public.appointments for all
  using (exists (select 1 from public.projects p where p.id = appointments.project_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = appointments.project_id and p.owner_id = auth.uid()));

create policy "Clients view appointments for own projects"
  on public.appointments for select
  using (exists (select 1 from public.projects p where p.id = appointments.project_id and p.client_id = auth.uid()));

-- RLS contact_logs: owner full access, client read-only
alter table public.contact_logs enable row level security;

create policy "Admins manage contact_logs for own projects"
  on public.contact_logs for all
  using (exists (select 1 from public.projects p where p.id = contact_logs.project_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = contact_logs.project_id and p.owner_id = auth.uid()));

create policy "Clients view contact_logs for own projects"
  on public.contact_logs for select
  using (exists (select 1 from public.projects p where p.id = contact_logs.project_id and p.client_id = auth.uid()));

-- Realtime
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.contact_logs;
