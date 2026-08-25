-- =============================================================================
-- ⚠️  LOCAL DEVELOPMENT SEED ONLY
-- =============================================================================
-- DO NOT run this against the production Supabase project.
-- This file seeds demo records for local development and testing purposes.
-- To apply schema changes to production, run migrations only:
--
--   supabase db push
--
-- To seed locally:
--   supabase db reset   (applies migrations + seed.sql against local Supabase)
-- =============================================================================

-- Workspace: Janai Tours & Service Operations (dev/local only)
INSERT INTO workspaces (id, name, slug, created_at)
VALUES (
  'ws-janai-dev-001',
  'Janai Tours & Service Operations',
  'janai-ops',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Dev admin user profile
INSERT INTO user_profiles (id, email, full_name, role, workspace_id, created_at)
VALUES (
  'usr-admin-01',
  'ops.admin@rivet.internal',
  'Suresh M. (Ops Admin)',
  'admin',
  'ws-janai-dev-001',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Workspace membership for dev admin
INSERT INTO workspace_members (id, workspace_id, user_id, role, joined_at)
VALUES (
  gen_random_uuid(),
  'ws-janai-dev-001',
  'usr-admin-01',
  'admin',
  NOW()
)
ON CONFLICT DO NOTHING;
