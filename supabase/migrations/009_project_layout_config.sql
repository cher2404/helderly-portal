-- Dashboard layout config per project (widget order + visibility)
alter table public.projects
  add column if not exists layout_config jsonb default null;

comment on column public.projects.layout_config is 'Widget layout: { "widgets": [ { "id": string, "visible": boolean, "position": number } ] }';
