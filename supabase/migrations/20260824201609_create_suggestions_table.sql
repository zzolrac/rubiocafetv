/*
# Create suggestions table for complaints and suggestions module

1. New Tables
- `suggestions`
  - `id` (uuid, primary key)
  - `name` (text, nullable — name of the person submitting, optional for anonymity)
  - `email` (text, nullable — contact email, optional)
  - `type` (text, not null — 'complaint' or 'suggestion', indicates whether it's a complaint or a suggestion)
  - `subject` (text, not null — short subject/title)
  - `message` (text, not null — the full message body)
  - `location_id` (uuid, nullable — optional reference to a location/sucursal)
  - `status` (text, not null, default 'new' — 'new', 'read', 'resolved' to track review state)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `suggestions`.
- This is a single-tenant app with no sign-in screen. The public form (anon) needs INSERT access so anyone can submit. The dashboard (also anon) needs SELECT to read all submissions, and UPDATE to mark status.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because this data is intentionally shared/public (the operator views all submissions).
- DELETE is NOT granted to anon — only SELECT, INSERT, and UPDATE.

3. Notes
- The public form at /sugerencias allows anyone to submit a complaint or suggestion.
- The dashboard displays all submissions and allows the operator to mark them as read or resolved.
- No personal auth is required — the form is public-facing.
*/

CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  type text NOT NULL CHECK (type IN ('complaint', 'suggestion')),
  subject text NOT NULL,
  message text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all suggestions (dashboard view)
DROP POLICY IF EXISTS "anon_select_suggestions" ON suggestions;
CREATE POLICY "anon_select_suggestions"
ON suggestions FOR SELECT
TO anon, authenticated USING (true);

-- Allow anyone to insert suggestions (public form)
DROP POLICY IF EXISTS "anon_insert_suggestions" ON suggestions;
CREATE POLICY "anon_insert_suggestions"
ON suggestions FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Allow anyone to update suggestion status (dashboard management)
DROP POLICY IF EXISTS "anon_update_suggestions" ON suggestions;
CREATE POLICY "anon_update_suggestions"
ON suggestions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- Create index for sorting by created_at
CREATE INDEX IF NOT EXISTS suggestions_created_at_idx ON suggestions (created_at DESC);
CREATE INDEX IF NOT EXISTS suggestions_status_idx ON suggestions (status);
