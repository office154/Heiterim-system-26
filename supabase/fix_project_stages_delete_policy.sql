-- Fix: allow authenticated users to delete project_stages rows
-- Run this in Supabase SQL Editor

create policy "Authenticated users can delete project stages"
  on public.project_stages
  for delete
  using (auth.role() = 'authenticated');
