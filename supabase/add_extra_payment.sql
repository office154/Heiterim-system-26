-- Add extra_payment column to project_stages
-- Run this in Supabase SQL Editor

alter table public.project_stages
  add column if not exists extra_payment numeric not null default 0;
