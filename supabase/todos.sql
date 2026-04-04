-- =============================================
-- Todos table
-- Run this in Supabase SQL Editor
-- =============================================

create table public.todos (
  id                    uuid        primary key default gen_random_uuid(),
  task                  text        not null,
  project_id            uuid        references public.projects(id) on delete cascade,
  project_title         text        not null default '',
  source_requirement_id uuid        references public.status_requirements(id) on delete set null,
  done                  boolean     not null default false,
  created_by            uuid        references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now()
);

alter table public.todos enable row level security;

-- All authenticated users can read, insert, update, delete todos
create policy "Authenticated users can manage todos"
  on public.todos
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
