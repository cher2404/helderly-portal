-- Allow clients to upload files into `assets` and into the `project-assets` bucket.
-- Object naming convention: <project_id>/<filename>

-- Assets insert: clients can create assets for projects where they are the client.
drop policy if exists "Clients can insert assets for own projects" on public.assets;
create policy "Clients can insert assets for own projects"
  on public.assets for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = assets.project_id
        and p.client_id = auth.uid()
    )
  );

-- Storage objects insert: clients can upload objects whose first path segment matches
-- a project where they are the client.
drop policy if exists "Clients can upload to project-assets" on storage.objects;
create policy "Clients can upload to project-assets"
  on storage.objects for insert
  with check (
    bucket_id = 'project-assets'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.projects p
      where p.client_id = auth.uid()
        and p.id = (
          case
            when split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            then split_part(name, '/', 1)::uuid
            else null
          end
        )
    )
  );

