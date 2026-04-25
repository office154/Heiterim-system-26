-- =============================================
-- Project Management Tab
-- Tables: project_contacts, project_tasks
-- Run this in Supabase SQL Editor
-- =============================================


-- ──────────────────────────────────────────
-- 1. project_contacts
-- ──────────────────────────────────────────

create table public.project_contacts (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references public.projects(id) on delete cascade,
  name        text        not null,
  role        text,
  company     text,
  phone       text,
  email       text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.project_contacts enable row level security;

create policy "Authenticated full access on project_contacts"
  on public.project_contacts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index project_contacts_project_id_idx
  on public.project_contacts (project_id);


-- ──────────────────────────────────────────
-- 2. project_tasks
-- ──────────────────────────────────────────

create table public.project_tasks (
  id                    uuid        primary key default gen_random_uuid(),
  project_id            uuid        not null references public.projects(id) on delete cascade,
  title                 text        not null,
  description           text,
  priority              text        not null default 'normal'
                          check (priority in ('critical', 'high', 'normal', 'low')),
  status                text        not null default 'open'
                          check (status in ('open', 'in_progress', 'waiting', 'done')),
  urgency               text        not null default 'later'
                          check (urgency in ('today', 'week', 'later')),
  deadline              date,
  contact_id            uuid        references public.project_contacts(id) on delete set null,
  waiting_on_contact_id uuid        references public.project_contacts(id) on delete set null,
  phase                 text        not null default 'planning'
                          check (phase in ('planning', 'approvals', 'client_decisions', 'submission')),
  party                 text        not null default 'internal'
                          check (party in ('internal', 'client', 'authority', 'consultants')),
  tags                  text[]      not null default '{}',
  subtasks              jsonb       not null default '[]'::jsonb,
  created_at            timestamptz not null default now(),
  completed_at          timestamptz
);

alter table public.project_tasks enable row level security;

create policy "Authenticated full access on project_tasks"
  on public.project_tasks
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index project_tasks_project_id_idx
  on public.project_tasks (project_id);
