-- Project slug for readable URLs: /dashboard/project/build-helderly-io instead of UUID
alter table public.projects
  add column if not exists slug text;

-- Unique per owner (two freelancers can have same project slug)
create unique index if not exists projects_owner_slug_key
  on public.projects (owner_id, slug)
  where slug is not null and slug != '';

comment on column public.projects.slug is 'URL slug for project (e.g. build-helderly-io). Unique per owner.';

-- Backfill: generate slug from name (lowercase, non-alphanumeric → dash)
update public.projects
set slug = lower(regexp_replace(regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
where slug is null and name is not null and name != '';

-- Uniqueness per owner: append short id to duplicates
update public.projects p
set slug = p.slug || '-' || left(p.id::text, 8)
from (
  select id from (
    select id, row_number() over (partition by owner_id, slug order by created_at) as rn
    from public.projects where slug is not null
  ) sub where rn > 1
) dups
where p.id = dups.id;
