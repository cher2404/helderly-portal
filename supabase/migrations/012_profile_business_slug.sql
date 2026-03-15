-- Helderly: Business name and client login slug for freelancers
-- Run after 011.

alter table public.profiles
  add column if not exists business_name text,
  add column if not exists slug text;

-- Unique slug (only one freelancer per slug); allow null for clients
create unique index if not exists profiles_slug_key on public.profiles (slug) where slug is not null and slug != '';

comment on column public.profiles.business_name is 'Display name for freelancer business (e.g. Fotografie Studio Maan)';
comment on column public.profiles.slug is 'URL slug for client login page (e.g. fotografiestudiomaan) → helderly.io/fotografiestudiomaan';
