-- Helderly: deadline, client_email, project_stages, project_messages
-- Run in Supabase SQL Editor after 001 and 002.

-- Projects: add deadline and client_email; allow client_id to be null (pending invite)
alter table public.projects
  add column if not exists deadline date,
  add column if not exists client_email text;

alter table public.projects
  alter column client_id drop not null;

-- Timeline stages per project (e.g. Concept, Feedback, Final Delivery)
create table if not exists public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  sort_order int not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists idx_project_stages_project_id on public.project_stages(project_id);

-- Feedback/messages per project (optional: link to asset)
create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  message text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_project_messages_project_id on public.project_messages(project_id);

-- RLS project_stages
alter table public.project_stages enable row level security;

drop policy if exists "Admins manage stages for own projects" on public.project_stages;
create policy "Admins manage stages for own projects"
  on public.project_stages for all
  using (
    exists (select 1 from public.projects p where p.id = project_stages.project_id and p.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = project_stages.project_id and p.owner_id = auth.uid())
  );

drop policy if exists "Clients view stages for own projects" on public.project_stages;
create policy "Clients view stages for own projects"
  on public.project_stages for select
  using (
    exists (select 1 from public.projects p where p.id = project_stages.project_id and p.client_id = auth.uid())
  );

-- RLS project_messages
alter table public.project_messages enable row level security;

drop policy if exists "Admins manage messages for own projects" on public.project_messages;
create policy "Admins manage messages for own projects"
  on public.project_messages for all
  using (
    exists (select 1 from public.projects p where p.id = project_messages.project_id and p.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = project_messages.project_id and p.owner_id = auth.uid())
  );

drop policy if exists "Clients view and insert messages for own projects" on public.project_messages;
create policy "Clients view and insert messages for own projects"
  on public.project_messages for select
  using (
    exists (select 1 from public.projects p where p.id = project_messages.project_id and p.client_id = auth.uid())
  );

drop policy if exists "Clients insert messages for own projects" on public.project_messages;
create policy "Clients insert messages for own projects"
  on public.project_messages for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.projects p where p.id = project_messages.project_id and p.client_id = auth.uid())
  );

-- Realtime (safe to re-run)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'project_stages') then
    alter publication supabase_realtime add table public.project_stages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'project_messages') then
    alter publication supabase_realtime add table public.project_messages;
  end if;
end $$;
