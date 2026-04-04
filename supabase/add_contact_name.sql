-- Add contact_name column to clients table
alter table public.clients add column if not exists contact_name text;
