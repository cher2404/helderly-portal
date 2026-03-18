-- Signed URL support for storage-backed assets (1 hour TTL)
-- We store the storage object path in `assets.file_path` and repurpose
-- `assets.file_url` to store that same path for backward compatibility.

alter table public.assets
  add column if not exists file_path text;

-- Backfill file_path from existing public URLs
-- Expected format from Supabase getPublicUrl:
--   .../storage/v1/object/public/project-assets/<path>
update public.assets
set file_path = coalesce(
  file_path,
  regexp_replace(
    file_url,
    '^.*?/project-assets/([^?]+).*$',
    '\\1'
  )
)
where file_path is null and file_url is not null;

-- Hide public URLs by storing the object path in file_url too
update public.assets
set file_url = file_path
where file_path is not null;

