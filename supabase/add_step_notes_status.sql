-- Run this in Supabase SQL Editor
ALTER TABLE public.requirement_steps
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ממתין';
