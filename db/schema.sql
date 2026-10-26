CREATE TABLE IF NOT EXISTS safety_plans (
  user_id TEXT PRIMARY KEY,
  contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  checked_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saheli's Express server uses a privileged Supabase PostgreSQL connection and
-- scopes every query to the verified Clerk user ID. Browser clients get no
-- table policies, so the public Supabase key cannot read saved safety plans.
ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE safety_plans IS
  'Private Saheli plans. Access through the server API, scoped to the verified Clerk user ID.';
