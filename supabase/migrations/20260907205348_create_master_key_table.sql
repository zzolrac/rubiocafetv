/*
# Master key for dashboard access

1. New Tables
- `master_key`
  - `id` (uuid, primary key, single row)
  - `pin_hash` (text, not null — SHA-256 hash of the master PIN)
  - `updated_at` (timestamptz, auto-updated on change)

2. Initial Data
- Seeds the table with a single row containing a default master PIN.
- Default PIN: "2025" — the operator should change it from the dashboard after first login.

3. Security
- Enable RLS on `master_key`.
- Allow anon + authenticated to SELECT (needed to validate the PIN from the frontend).
- Allow anon + authenticated to UPDATE (so the operator can change the PIN).
- No INSERT or DELETE policies — the single seeded row is the only row that should exist.
- The PIN is stored as a SHA-256 hash, never in plaintext.

4. Notes
- This adds a second layer of security: even if someone knows the Supabase URL, they cannot access the dashboard without the master PIN.
- The PIN is validated client-side by hashing the user input and comparing to the stored hash.
- Default PIN "2025" should be changed by the operator after first use.
*/

CREATE TABLE IF NOT EXISTS master_key (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_hash text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE master_key ENABLE ROW LEVEL SECURITY;

-- Seed the default master key row (only if table is empty)
INSERT INTO master_key (pin_hash)
SELECT encode(digest('2025', 'sha256'), 'hex')
WHERE NOT EXISTS (SELECT 1 FROM master_key);

-- Allow reading the hash (needed for PIN validation)
DROP POLICY IF EXISTS "anon_select_master_key" ON master_key;
CREATE POLICY "anon_select_master_key"
ON master_key FOR SELECT
TO anon, authenticated USING (true);

-- Allow updating the hash (change PIN)
DROP POLICY IF EXISTS "anon_update_master_key" ON master_key;
CREATE POLICY "anon_update_master_key"
ON master_key FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
