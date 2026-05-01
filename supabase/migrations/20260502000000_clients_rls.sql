-- =============================================
-- RLS for clients table
-- Employee sees only clients with at least one accessible project
-- =============================================

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop if re-running
DROP POLICY IF EXISTS "Authenticated full access on clients" ON public.clients;
DROP POLICY IF EXISTS "perm_select_clients"                 ON public.clients;
DROP POLICY IF EXISTS "perm_insert_clients"                 ON public.clients;
DROP POLICY IF EXISTS "perm_update_clients"                 ON public.clients;
DROP POLICY IF EXISTS "perm_delete_clients"                 ON public.clients;

-- SELECT: admin sees all; employee sees clients that have ≥1 accessible project
CREATE POLICY "perm_select_clients" ON public.clients
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.client_id = clients.id
        AND public.has_project_access(projects.id, auth.uid())
    )
  );

-- Only admins can create / edit / delete clients
CREATE POLICY "perm_insert_clients" ON public.clients
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "perm_update_clients" ON public.clients
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "perm_delete_clients" ON public.clients
  FOR DELETE USING (public.is_admin(auth.uid()));
