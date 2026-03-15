-- Helderly: Templates, asset status (needs_changes), client can update asset status
-- Run after 007.

-- 1. Asset status: add 'needs_changes'
alter table public.assets drop constraint if exists assets_status_check;
alter table public.assets add constraint assets_status_check
  check (status in ('pending', 'approved', 'needs_changes'));

-- Clients may update asset status (approve / request revision)
drop policy if exists "Clients can view assets for own projects" on public.assets;
create policy "Clients can view assets for own projects"
  on public.assets for select
  using (
    exists (select 1 from public.projects p where p.id = assets.project_id and p.client_id = auth.uid())
  );

create policy "Clients can update asset status for own projects"
  on public.assets for update
  using (
    exists (select 1 from public.projects p where p.id = assets.project_id and p.client_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = assets.project_id and p.client_id = auth.uid())
  );

-- 2. Templates (power-user): save project structure for reuse
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.template_stages (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.templates(id) on delete cascade not null,
  title text not null,
  sort_order int not null default 0
);

create table if not exists public.template_faqs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.templates(id) on delete cascade not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

create index if not exists idx_templates_owner on public.templates(owner_id);
create index if not exists idx_template_stages_template on public.template_stages(template_id);
create index if not exists idx_template_faqs_template on public.template_faqs(template_id);

alter table public.templates enable row level security;
alter table public.template_stages enable row level security;
alter table public.template_faqs enable row level security;

create policy "Admins manage own templates"
  on public.templates for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Admins manage template_stages for own templates"
  on public.template_stages for all
  using (exists (select 1 from public.templates t where t.id = template_stages.template_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from public.templates t where t.id = template_stages.template_id and t.owner_id = auth.uid()));

create policy "Admins manage template_faqs for own templates"
  on public.template_faqs for all
  using (exists (select 1 from public.templates t where t.id = template_faqs.template_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from public.templates t where t.id = template_faqs.template_id and t.owner_id = auth.uid()));
