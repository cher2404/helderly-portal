-- Helderly: Decisions, Project FAQ, Internal Notes, Project hours & health
-- Run after 004.

-- Add estimated_hours, actual_hours, health_status to projects
alter table public.projects
  add column if not exists estimated_hours integer,
  add column if not exists actual_hours integer default 0,
  add column if not exists health_status text default 'on_track' check (health_status in ('on_track', 'needs_attention', 'blocked'));

-- Decisions (agreed outcomes; client can confirm)
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  decision_date date not null,
  rationale text,
  confirmed_by_client boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_decisions_project_id on public.decisions(project_id);

alter table public.decisions enable row level security;

create policy "Admins manage decisions for own projects"
  on public.decisions for all
  using (exists (select 1 from public.projects p where p.id = decisions.project_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = decisions.project_id and p.owner_id = auth.uid()));

create policy "Clients view and confirm decisions for own projects"
  on public.decisions for select
  using (exists (select 1 from public.projects p where p.id = decisions.project_id and p.client_id = auth.uid()));

-- Allow clients to update only confirmed_by_client (via service role or a dedicated policy)
create policy "Clients can update decision confirmation"
  on public.decisions for update
  using (exists (select 1 from public.projects p where p.id = decisions.project_id and p.client_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = decisions.project_id and p.client_id = auth.uid()));

-- Project FAQs (accordion content)
create table if not exists public.project_faqs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_project_faqs_project_id on public.project_faqs(project_id);

alter table public.project_faqs enable row level security;

create policy "Admins manage faqs for own projects"
  on public.project_faqs for all
  using (exists (select 1 from public.projects p where p.id = project_faqs.project_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_faqs.project_id and p.owner_id = auth.uid()));

create policy "Clients view faqs for own projects"
  on public.project_faqs for select
  using (exists (select 1 from public.projects p where p.id = project_faqs.project_id and p.client_id = auth.uid()));

-- Internal notes (scratchpad) — owner only, NEVER visible to client
create table if not exists public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  content text not null default '',
  updated_at timestamptz default now() not null,
  unique(project_id, owner_id)
);

create index if not exists idx_internal_notes_project_owner on public.internal_notes(project_id, owner_id);

alter table public.internal_notes enable row level security;

-- Only project owner can read/write their own internal notes; clients have no access
create policy "Owners full access own project internal notes"
  on public.internal_notes for all
  using (
    exists (select 1 from public.projects p where p.id = internal_notes.project_id and p.owner_id = auth.uid())
    and internal_notes.owner_id = auth.uid()
  )
  with check (
    exists (select 1 from public.projects p where p.id = internal_notes.project_id and p.owner_id = auth.uid())
    and internal_notes.owner_id = auth.uid()
  );

-- Realtime for decisions (optional, for live updates)
alter publication supabase_realtime add table public.decisions;
alter publication supabase_realtime add table public.project_faqs;
