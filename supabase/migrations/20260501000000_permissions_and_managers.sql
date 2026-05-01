-- =============================================
-- Permissions & Project Managers — Phase 1
-- Adds: manager_id, project_assistants, pending_completion,
--       RLS helper functions, full RLS replacement
-- =============================================

BEGIN;

-- ──────────────────────────────────────────
-- 1. Add manager_id to projects
-- ──────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_manager_id_idx
  ON public.projects (manager_id);

-- ──────────────────────────────────────────
-- 2. Create project_assistants table
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_assistants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, profile_id)
);

CREATE INDEX IF NOT EXISTS project_assistants_project_id_idx
  ON public.project_assistants (project_id);

CREATE INDEX IF NOT EXISTS project_assistants_profile_id_idx
  ON public.project_assistants (profile_id);

-- ──────────────────────────────────────────
-- 3. Add pending_completion columns to project_stages
-- ──────────────────────────────────────────
ALTER TABLE public.project_stages
  ADD COLUMN IF NOT EXISTS pending_completion     boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pending_completion_by  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pending_completion_at  timestamptz;

-- ──────────────────────────────────────────
-- 4. Data migration: assign manager_id to existing projects
-- ──────────────────────────────────────────

-- First pass: use created_by if they are an admin
UPDATE public.projects p
SET manager_id = p.created_by
WHERE p.manager_id IS NULL
  AND p.created_by IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = p.created_by
      AND pr.role = 'admin'
  );

-- Second pass: for remaining projects, assign to the oldest admin in the system
UPDATE public.projects p
SET manager_id = (
  SELECT pr.id
  FROM public.profiles pr
  WHERE pr.role = 'admin'
  ORDER BY pr.created_at ASC
  LIMIT 1
)
WHERE p.manager_id IS NULL;

-- ──────────────────────────────────────────
-- 5. RLS helper functions (SECURITY DEFINER so they bypass RLS on profiles)
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_project_access(p_project_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    is_admin(p_user_id)
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = p_project_id AND manager_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM project_assistants
      WHERE project_id = p_project_id AND profile_id = p_user_id
    );
$$;

-- ──────────────────────────────────────────
-- 6. Enable RLS on all relevant tables
-- ──────────────────────────────────────────
ALTER TABLE public.projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_requirements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contacts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_steps    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assistants   ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
-- 7. Drop old policies (auth_* pattern + "Authenticated full access" variants)
-- ──────────────────────────────────────────

-- projects
DROP POLICY IF EXISTS "auth_select_projects"             ON public.projects;
DROP POLICY IF EXISTS "auth_insert_projects"             ON public.projects;
DROP POLICY IF EXISTS "auth_update_projects"             ON public.projects;
DROP POLICY IF EXISTS "auth_delete_projects"             ON public.projects;
DROP POLICY IF EXISTS "Authenticated full access on projects" ON public.projects;

-- project_stages
DROP POLICY IF EXISTS "auth_select_stages"               ON public.project_stages;
DROP POLICY IF EXISTS "auth_insert_stages"               ON public.project_stages;
DROP POLICY IF EXISTS "auth_update_stages"               ON public.project_stages;
DROP POLICY IF EXISTS "Authenticated users can delete project stages" ON public.project_stages;
DROP POLICY IF EXISTS "auth_select_project_stages"       ON public.project_stages;
DROP POLICY IF EXISTS "auth_insert_project_stages"       ON public.project_stages;
DROP POLICY IF EXISTS "auth_update_project_stages"       ON public.project_stages;
DROP POLICY IF EXISTS "auth_delete_project_stages"       ON public.project_stages;
DROP POLICY IF EXISTS "Authenticated full access on project_stages" ON public.project_stages;

-- status_requirements
DROP POLICY IF EXISTS "auth_select_status"               ON public.status_requirements;
DROP POLICY IF EXISTS "auth_insert_status"               ON public.status_requirements;
DROP POLICY IF EXISTS "auth_update_status"               ON public.status_requirements;
DROP POLICY IF EXISTS "Allow authenticated delete on status_requirements" ON public.status_requirements;
DROP POLICY IF EXISTS "auth_select_status_requirements"  ON public.status_requirements;
DROP POLICY IF EXISTS "auth_insert_status_requirements"  ON public.status_requirements;
DROP POLICY IF EXISTS "auth_update_status_requirements"  ON public.status_requirements;
DROP POLICY IF EXISTS "auth_delete_status_requirements"  ON public.status_requirements;
DROP POLICY IF EXISTS "Authenticated full access on status_requirements" ON public.status_requirements;

-- project_contacts
DROP POLICY IF EXISTS "auth_select_contacts"             ON public.project_contacts;
DROP POLICY IF EXISTS "auth_insert_contacts"             ON public.project_contacts;
DROP POLICY IF EXISTS "auth_update_contacts"             ON public.project_contacts;
DROP POLICY IF EXISTS "auth_delete_contacts"             ON public.project_contacts;
DROP POLICY IF EXISTS "auth_select_project_contacts"     ON public.project_contacts;
DROP POLICY IF EXISTS "auth_insert_project_contacts"     ON public.project_contacts;
DROP POLICY IF EXISTS "auth_update_project_contacts"     ON public.project_contacts;
DROP POLICY IF EXISTS "auth_delete_project_contacts"     ON public.project_contacts;
DROP POLICY IF EXISTS "Authenticated full access on project_contacts" ON public.project_contacts;

-- project_files
DROP POLICY IF EXISTS "auth_select_files"                ON public.project_files;
DROP POLICY IF EXISTS "auth_insert_files"                ON public.project_files;
DROP POLICY IF EXISTS "auth_delete_files"                ON public.project_files;
DROP POLICY IF EXISTS "auth_select_project_files"        ON public.project_files;
DROP POLICY IF EXISTS "auth_insert_project_files"        ON public.project_files;
DROP POLICY IF EXISTS "auth_update_project_files"        ON public.project_files;
DROP POLICY IF EXISTS "auth_delete_project_files"        ON public.project_files;
DROP POLICY IF EXISTS "Authenticated full access on project_files" ON public.project_files;

-- project_tasks
DROP POLICY IF EXISTS "auth_select_project_tasks"        ON public.project_tasks;
DROP POLICY IF EXISTS "auth_insert_project_tasks"        ON public.project_tasks;
DROP POLICY IF EXISTS "auth_update_project_tasks"        ON public.project_tasks;
DROP POLICY IF EXISTS "auth_delete_project_tasks"        ON public.project_tasks;
DROP POLICY IF EXISTS "Authenticated full access on project_tasks" ON public.project_tasks;

-- todos
DROP POLICY IF EXISTS "Authenticated users can manage todos" ON public.todos;
DROP POLICY IF EXISTS "auth_select_todos"                ON public.todos;
DROP POLICY IF EXISTS "auth_insert_todos"                ON public.todos;
DROP POLICY IF EXISTS "auth_update_todos"                ON public.todos;
DROP POLICY IF EXISTS "auth_delete_todos"                ON public.todos;
DROP POLICY IF EXISTS "Authenticated full access on todos" ON public.todos;

-- requirement_steps
DROP POLICY IF EXISTS "auth_select_requirement_steps"    ON public.requirement_steps;
DROP POLICY IF EXISTS "auth_insert_requirement_steps"    ON public.requirement_steps;
DROP POLICY IF EXISTS "auth_update_requirement_steps"    ON public.requirement_steps;
DROP POLICY IF EXISTS "auth_delete_requirement_steps"    ON public.requirement_steps;
DROP POLICY IF EXISTS "Authenticated full access on requirement_steps" ON public.requirement_steps;

-- project_assistants (new table — safety drop in case of re-run)
DROP POLICY IF EXISTS "perm_select_project_assistants"   ON public.project_assistants;
DROP POLICY IF EXISTS "perm_insert_project_assistants"   ON public.project_assistants;
DROP POLICY IF EXISTS "perm_update_project_assistants"   ON public.project_assistants;
DROP POLICY IF EXISTS "perm_delete_project_assistants"   ON public.project_assistants;

-- ──────────────────────────────────────────
-- 8. New RLS policies
-- ──────────────────────────────────────────

-- ---- projects ----
CREATE POLICY "perm_select_projects" ON public.projects
  FOR SELECT USING (
    public.has_project_access(id, auth.uid())
  );

CREATE POLICY "perm_insert_projects" ON public.projects
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

CREATE POLICY "perm_update_projects" ON public.projects
  FOR UPDATE USING (
    public.has_project_access(id, auth.uid())
  );

CREATE POLICY "perm_delete_projects" ON public.projects
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- ---- project_stages ----
CREATE POLICY "perm_select_project_stages" ON public.project_stages
  FOR SELECT USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_insert_project_stages" ON public.project_stages
  FOR INSERT WITH CHECK (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_update_project_stages" ON public.project_stages
  FOR UPDATE USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_delete_project_stages" ON public.project_stages
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- ---- status_requirements ----
CREATE POLICY "perm_select_status_requirements" ON public.status_requirements
  FOR SELECT USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_insert_status_requirements" ON public.status_requirements
  FOR INSERT WITH CHECK (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_update_status_requirements" ON public.status_requirements
  FOR UPDATE USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_delete_status_requirements" ON public.status_requirements
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- ---- project_contacts (all ops: has_project_access) ----
CREATE POLICY "perm_all_project_contacts" ON public.project_contacts
  FOR ALL
  USING (public.has_project_access(project_id, auth.uid()))
  WITH CHECK (public.has_project_access(project_id, auth.uid()));

-- ---- project_files ----
CREATE POLICY "perm_select_project_files" ON public.project_files
  FOR SELECT USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_insert_project_files" ON public.project_files
  FOR INSERT WITH CHECK (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_delete_project_files" ON public.project_files
  FOR DELETE USING (
    public.is_admin(auth.uid())
    OR uploaded_by = auth.uid()
  );

-- ---- project_tasks (all ops: has_project_access) ----
CREATE POLICY "perm_all_project_tasks" ON public.project_tasks
  FOR ALL
  USING (public.has_project_access(project_id, auth.uid()))
  WITH CHECK (public.has_project_access(project_id, auth.uid()));

-- ---- todos ----
-- Admin sees/modifies all; employee sees/modifies todos they created or linked to their projects
CREATE POLICY "perm_select_todos" ON public.todos
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR created_by = auth.uid()
    OR (
      project_id IS NOT NULL
      AND public.has_project_access(project_id, auth.uid())
    )
  );

CREATE POLICY "perm_insert_todos" ON public.todos
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "perm_update_todos" ON public.todos
  FOR UPDATE USING (
    public.is_admin(auth.uid())
    OR created_by = auth.uid()
    OR (
      project_id IS NOT NULL
      AND public.has_project_access(project_id, auth.uid())
    )
  );

CREATE POLICY "perm_delete_todos" ON public.todos
  FOR DELETE USING (
    public.is_admin(auth.uid())
    OR created_by = auth.uid()
  );

-- ---- requirement_steps ----
CREATE POLICY "perm_select_requirement_steps" ON public.requirement_steps
  FOR SELECT USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_insert_requirement_steps" ON public.requirement_steps
  FOR INSERT WITH CHECK (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_update_requirement_steps" ON public.requirement_steps
  FOR UPDATE USING (
    public.has_project_access(project_id, auth.uid())
  );

CREATE POLICY "perm_delete_requirement_steps" ON public.requirement_steps
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- ---- project_assistants ----
CREATE POLICY "perm_select_project_assistants" ON public.project_assistants
  FOR SELECT USING (
    public.is_admin(auth.uid())
    OR profile_id = auth.uid()
  );

CREATE POLICY "perm_insert_project_assistants" ON public.project_assistants
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid())
  );

CREATE POLICY "perm_update_project_assistants" ON public.project_assistants
  FOR UPDATE USING (
    public.is_admin(auth.uid())
  );

CREATE POLICY "perm_delete_project_assistants" ON public.project_assistants
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

COMMIT;
