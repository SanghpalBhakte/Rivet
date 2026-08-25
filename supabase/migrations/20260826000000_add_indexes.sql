-- ============================================================================
-- RIVET CRM — Performance B-Tree Indexes Migration
-- Migration: 20260826000000_add_indexes.sql
-- ============================================================================

-- Workspace Scoped Query Indexes
CREATE INDEX IF NOT EXISTS idx_customers_workspace_id ON public.customers(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON public.leads(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_workspace_id ON public.jobs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON public.tasks(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_workspace_id ON public.payments(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_workspace_id ON public.notes(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace_id ON public.activity_logs(workspace_id, created_at DESC);

-- Domain Status & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(workspace_id, stage);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(workspace_id, status);

-- Entity Linkage Indexes
CREATE INDEX IF NOT EXISTS idx_notes_linked ON public.notes(linked_entity_id, linked_entity_type);
CREATE INDEX IF NOT EXISTS idx_tasks_linked ON public.tasks(linked_entity_id, linked_entity_type);
