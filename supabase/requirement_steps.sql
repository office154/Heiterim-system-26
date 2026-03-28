-- Run this in Supabase SQL Editor
create table if not exists public.requirement_steps (
  id             uuid        primary key default gen_random_uuid(),
  requirement_id uuid        not null references public.status_requirements(id) on delete cascade,
  project_id     uuid        not null references public.projects(id) on delete cascade,
  detail         text        not null default '',
  step_date      date        null,
  done           boolean     not null default false,
  order_index    integer     not null default 1,
  created_at     timestamptz not null default now()
);

alter table public.requirement_steps enable row level security;

create policy "Authenticated full access on requirement_steps"
  on public.requirement_steps
  for all
  using (auth.role() = 'authenticated');
