-- Helderly: 30-day trial (trial_starts_at on signup)
-- Run after 006.

alter table public.profiles
  add column if not exists trial_starts_at timestamptz;

-- Set trial_starts_at for existing users who don't have it (treat as trial started at created_at)
update public.profiles
set trial_starts_at = created_at
where trial_starts_at is null;

-- Update trigger: set trial_starts_at on new user signup
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
  insert into public.profiles (user_id, role, full_name, trial_starts_at)
  values (
    new.id,
    user_role,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    now()
  );
  return new;
end;
$$;
