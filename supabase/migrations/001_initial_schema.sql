-- Helderly: profiles (role), projects, assets + RLS
-- Run this in the Supabase SQL Editor.

-- Enable UUID extension if not exists
create extension if not exists "uuid-ossp";

-- Profiles: one row per user, stores role (admin = freelancer/owner, client = client)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('admin', 'client')),
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Projects: owner_id = admin/freelancer, client_id = client who sees the project
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold', 'draft')),
  progress_percentage int not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  client_id uuid references auth.users(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Assets: files linked to a project
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  file_name text not null,
  file_url text not null,
  status text not null default 'pending' check (status in ('approved', 'pending')),
  created_at timestamptz default now() not null
);

-- Create profile on signup (role comes from raw_user_meta_data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  if user_role not in ('admin', 'client') then
    user_role := 'client';
  end if;
  insert into public.profiles (user_id, role, full_name)
  values (
    new.id,
    user_role,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: enable on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.assets enable row level security;

-- Profiles: users can read/update their own row only
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Projects: admin (owner) can do everything for their projects; client can only select where client_id = self
drop policy if exists "Admins can manage own projects" on public.projects;
create policy "Admins can manage own projects"
  on public.projects for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Clients can view own projects" on public.projects;
create policy "Clients can view own projects"
  on public.projects for select
  using (auth.uid() = client_id);

-- Assets: admins manage assets for projects they own; clients can only select assets for projects where they are client_id
drop policy if exists "Admins can manage assets for own projects" on public.assets;
create policy "Admins can manage assets for own projects"
  on public.assets for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = assets.project_id and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = assets.project_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "Clients can view assets for own projects" on public.assets;
create policy "Clients can view assets for own projects"
  on public.assets for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = assets.project_id and p.client_id = auth.uid()
    )
  );

-- Realtime: allow clients to subscribe to project and asset changes (RLS will filter)
-- Only add if not already in publication (safe to re-run migration)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'projects') then
    alter publication supabase_realtime add table public.projects;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'assets') then
    alter publication supabase_realtime add table public.assets;
  end if;
end $$;

-- Storage bucket for project assets (run in SQL or create via Dashboard)
-- Here we create a bucket and policy so owner can upload and client can read.
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload to project-assets" on storage.objects;
create policy "Admins can upload to project-assets"
  on storage.objects for insert
  with check (
    bucket_id = 'project-assets'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Anyone authenticated can read project-assets" on storage.objects;
create policy "Anyone authenticated can read project-assets"
  on storage.objects for select
  using (
    bucket_id = 'project-assets'
    and auth.role() = 'authenticated'
  );
