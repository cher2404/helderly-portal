-- Intake submissions: publieke aanvragen via /intake/[slug]
create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid references public.profiles(user_id) on delete cascade not null,
  name text not null,
  email text not null,
  description text not null,
  budget text,
  timeline text,
  status text not null default 'new',  -- new | read | converted
  created_at timestamptz default now() not null
);

alter table public.intake_submissions enable row level security;

-- Alleen de freelancer zelf kan zijn eigen submissions lezen
create policy "Freelancer can manage own intake submissions"
  on public.intake_submissions for all
  using (
    freelancer_id = (
      select user_id from public.profiles where user_id = auth.uid()
    )
  );

-- Anonieme gebruikers mogen submissions aanmaken (het formulier is publiek)
create policy "Anyone can submit intake"
  on public.intake_submissions for insert
  with check (true);
