-- Helderly: Profile theme, accent color, logo
-- Run after 005.

alter table public.profiles
  add column if not exists accent_color text default '#3b82f6',
  add column if not exists logo_url text,
  add column if not exists theme text default 'system' check (theme in ('light', 'dark', 'system'));

-- Storage bucket for freelancer logos (optional: create via Dashboard if preferred)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "Admins can upload logo" on storage.objects;
create policy "Admins can upload logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
  );

drop policy if exists "Anyone can read logos" on storage.objects;
create policy "Anyone can read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "Admins can update own logo" on storage.objects;
create policy "Admins can update own logo"
  on storage.objects for update
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'logos');

drop policy if exists "Admins can delete own logo" on storage.objects;
create policy "Admins can delete own logo"
  on storage.objects for delete
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
