-- Add Stripe subscription fields to profiles
-- Run in Supabase SQL Editor after 001_initial_schema.sql

alter table public.profiles
  add column if not exists subscription_status text not null default 'free' check (subscription_status in ('free', 'active')),
  add column if not exists stripe_customer_id text;

create index if not exists idx_profiles_stripe_customer_id on public.profiles(stripe_customer_id);

comment on column public.profiles.subscription_status is 'free | active (pro)';
comment on column public.profiles.stripe_customer_id is 'Stripe Customer ID for billing portal';
