-- Notifications for in-app bell (milestone proposed/approved, new doc, etc.)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read_at on public.notifications(user_id, read_at) where read_at is null;

alter table public.notifications enable row level security;

create policy "Users see and update own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own read_at"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow any authenticated user to insert (server creates notifications for others)
create policy "Authenticated can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

comment on table public.notifications is 'In-app notifications for milestone updates, new docs, etc.';
