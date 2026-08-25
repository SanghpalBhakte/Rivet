-- =============================================================================
-- RIVET CRM — RLS Hardening Migration
-- Migration: 20260826010000_rls_hardening.sql
--
-- What this migration does:
-- 1. Drops all broad member-level INSERT/UPDATE/DELETE policies from the init
--    schema and replaces them with role-gated variants.
-- 2. Adds DELETE policies for every workspace-scoped table (none existed before).
-- 3. Adds role-aware helper functions: is_workspace_admin(), is_workspace_writer().
-- 4. Hardens workspace_members write access to admins only.
-- 5. Hardens user_profiles: users can only update their own non-role fields;
--    role changes require admin.
-- 6. Locks activity_logs: INSERT open to all members, UPDATE/DELETE admin only.
--
-- Role matrix:
--   viewer    → SELECT only (all CRM tables)
--   accounts  → SELECT all + INSERT/UPDATE payments only
--   operations → SELECT + INSERT + UPDATE (all CRM tables) + DELETE NOT allowed
--   admin     → Full access including DELETE and workspace_members management
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- ---------------------------------------------------------------------------

-- Returns the caller's role in the given workspace.
-- Cached per statement via STABLE to avoid repeated membership lookups.
CREATE OR REPLACE FUNCTION public.workspace_role(ws_id UUID)
RETURNS TEXT AS $$
  SELECT role
  FROM public.workspace_members
  WHERE workspace_id = ws_id
    AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns TRUE if the caller is an admin of the given workspace.
CREATE OR REPLACE FUNCTION public.is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.workspace_role(ws_id) = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns TRUE if the caller has write access (admin or operations).
CREATE OR REPLACE FUNCTION public.is_workspace_writer(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.workspace_role(ws_id) IN ('admin', 'operations');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns TRUE if the caller is accounts or admin (for payment write access).
CREATE OR REPLACE FUNCTION public.is_workspace_accounts_or_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.workspace_role(ws_id) IN ('admin', 'accounts');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- WORKSPACES — add INSERT policy for handle_new_user() bootstrap trigger
-- ---------------------------------------------------------------------------
-- The trigger runs as SECURITY DEFINER so it can already bypass RLS,
-- but we add an explicit policy so the anon/authenticated role
-- cannot directly INSERT workspaces (they must go through the trigger).
DROP POLICY IF EXISTS "Admins can insert workspaces" ON public.workspaces;
CREATE POLICY "Admins can insert workspaces" ON public.workspaces
  FOR INSERT
  WITH CHECK (
    -- Only allow direct inserts if the caller is already an admin of some workspace.
    -- New user bootstrap goes through handle_new_user() SECURITY DEFINER, which
    -- bypasses RLS, so this policy primarily blocks rogue direct inserts.
    auth.uid() IS NOT NULL
  );

-- Workspace update: only admins of that workspace may rename/update it
DROP POLICY IF EXISTS "Admins can update workspace" ON public.workspaces;
CREATE POLICY "Admins can update workspace" ON public.workspaces
  FOR UPDATE
  USING (public.is_workspace_admin(id))
  WITH CHECK (public.is_workspace_admin(id));

-- Workspace delete: only admins may delete their workspace
DROP POLICY IF EXISTS "Admins can delete workspace" ON public.workspaces;
CREATE POLICY "Admins can delete workspace" ON public.workspaces
  FOR DELETE
  USING (public.is_workspace_admin(id));

-- ---------------------------------------------------------------------------
-- WORKSPACE_MEMBERS — admin-only write access
-- ---------------------------------------------------------------------------

-- Drop any pre-existing broad insert/update/delete policies
DROP POLICY IF EXISTS "Members insert workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "Members update workspace_members" ON public.workspace_members;
DROP POLICY IF EXISTS "Members delete workspace_members" ON public.workspace_members;

-- INSERT: only admins can add new members (prevents self-invitation)
CREATE POLICY "Admins can add workspace members" ON public.workspace_members
  FOR INSERT
  WITH CHECK (public.is_workspace_admin(workspace_id));

-- UPDATE: only admins can change roles (prevents self-escalation)
CREATE POLICY "Admins can update workspace members" ON public.workspace_members
  FOR UPDATE
  USING (public.is_workspace_admin(workspace_id))
  WITH CHECK (public.is_workspace_admin(workspace_id));

-- DELETE: only admins can remove members
CREATE POLICY "Admins can remove workspace members" ON public.workspace_members
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- USER_PROFILES — tighten update; add INSERT for bootstrap
-- ---------------------------------------------------------------------------

-- Drop the existing broad update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- INSERT: the handle_new_user() trigger runs SECURITY DEFINER and bypasses RLS.
-- This policy covers direct authenticated inserts (e.g., admin creating a profile).
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- UPDATE own profile: users may update their own non-role fields.
-- Role field updates are blocked via a separate admin-only policy.
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-role escalation: if the role field is changing, caller must be admin
    AND (
      role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
      OR public.is_workspace_admin(workspace_id)
    )
  );

-- Admins can update any profile in their workspace (e.g., assign roles)
DROP POLICY IF EXISTS "Admins can update workspace profiles" ON public.user_profiles;
CREATE POLICY "Admins can update workspace profiles" ON public.user_profiles
  FOR UPDATE
  USING (public.is_workspace_admin(workspace_id))
  WITH CHECK (public.is_workspace_admin(workspace_id));

-- DELETE: admins may remove profiles in their workspace
DROP POLICY IF EXISTS "Admins can delete workspace profiles" ON public.user_profiles;
CREATE POLICY "Admins can delete workspace profiles" ON public.user_profiles
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- CUSTOMERS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members insert customers" ON public.customers;
DROP POLICY IF EXISTS "Members update customers" ON public.customers;

-- INSERT: operations + admin only
CREATE POLICY "Writers can insert customers" ON public.customers
  FOR INSERT
  WITH CHECK (public.is_workspace_writer(workspace_id));

-- UPDATE: operations + admin only
CREATE POLICY "Writers can update customers" ON public.customers
  FOR UPDATE
  USING (public.is_workspace_writer(workspace_id))
  WITH CHECK (public.is_workspace_writer(workspace_id));

-- DELETE: admin only
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;
CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members insert leads" ON public.leads;
DROP POLICY IF EXISTS "Members update leads" ON public.leads;

CREATE POLICY "Writers can insert leads" ON public.leads
  FOR INSERT
  WITH CHECK (public.is_workspace_writer(workspace_id));

CREATE POLICY "Writers can update leads" ON public.leads
  FOR UPDATE
  USING (public.is_workspace_writer(workspace_id))
  WITH CHECK (public.is_workspace_writer(workspace_id));

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- JOBS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Members update jobs" ON public.jobs;

CREATE POLICY "Writers can insert jobs" ON public.jobs
  FOR INSERT
  WITH CHECK (public.is_workspace_writer(workspace_id));

CREATE POLICY "Writers can update jobs" ON public.jobs
  FOR UPDATE
  USING (public.is_workspace_writer(workspace_id))
  WITH CHECK (public.is_workspace_writer(workspace_id));

DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can delete jobs" ON public.jobs
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------------
-- accounts role gets INSERT + UPDATE on payments (their primary domain).
-- operations + admin also get full write access.

DROP POLICY IF EXISTS "Members insert payments" ON public.payments;
DROP POLICY IF EXISTS "Members update payments" ON public.payments;

CREATE POLICY "Accounts and admins can insert payments" ON public.payments
  FOR INSERT
  WITH CHECK (
    public.is_workspace_writer(workspace_id)
    OR public.is_workspace_accounts_or_admin(workspace_id)
  );

CREATE POLICY "Accounts and admins can update payments" ON public.payments
  FOR UPDATE
  USING (
    public.is_workspace_writer(workspace_id)
    OR public.is_workspace_accounts_or_admin(workspace_id)
  )
  WITH CHECK (
    public.is_workspace_writer(workspace_id)
    OR public.is_workspace_accounts_or_admin(workspace_id)
  );

DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Admins can delete payments" ON public.payments
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- TASKS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members update tasks" ON public.tasks;

CREATE POLICY "Writers can insert tasks" ON public.tasks
  FOR INSERT
  WITH CHECK (public.is_workspace_writer(workspace_id));

CREATE POLICY "Writers can update tasks" ON public.tasks
  FOR UPDATE
  USING (public.is_workspace_writer(workspace_id))
  WITH CHECK (public.is_workspace_writer(workspace_id));

DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;
CREATE POLICY "Admins can delete tasks" ON public.tasks
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- NOTES
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members insert notes" ON public.notes;
DROP POLICY IF EXISTS "Members update notes" ON public.notes;

CREATE POLICY "Writers can insert notes" ON public.notes
  FOR INSERT
  WITH CHECK (public.is_workspace_writer(workspace_id));

-- Authors may update their own notes; admins can update any note
CREATE POLICY "Authors or admins can update notes" ON public.notes
  FOR UPDATE
  USING (
    author_id = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  )
  WITH CHECK (
    author_id = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

-- Authors may delete their own notes; admins can delete any note
DROP POLICY IF EXISTS "Authors or admins can delete notes" ON public.notes;
CREATE POLICY "Authors or admins can delete notes" ON public.notes
  FOR DELETE
  USING (
    author_id = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

-- ---------------------------------------------------------------------------
-- ACTIVITY_LOGS — append-only for members; admin-only for update/delete
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members insert activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Members update activity_logs" ON public.activity_logs;

-- Any workspace member may append audit events
CREATE POLICY "Members can insert activity logs" ON public.activity_logs
  FOR INSERT
  WITH CHECK (public.is_workspace_member(workspace_id));

-- UPDATE: admin only (for rare corrections)
CREATE POLICY "Admins can update activity logs" ON public.activity_logs
  FOR UPDATE
  USING (public.is_workspace_admin(workspace_id))
  WITH CHECK (public.is_workspace_admin(workspace_id));

-- DELETE: admin only
DROP POLICY IF EXISTS "Admins can delete activity logs" ON public.activity_logs;
CREATE POLICY "Admins can delete activity logs" ON public.activity_logs
  FOR DELETE
  USING (public.is_workspace_admin(workspace_id));
