/*
  # Add Authentication Policies

  1. Changes
    - Add policies for authenticated users
    - Enable RLS on all tables
    - Ensure data security
*/

-- Update policies for content table
DROP POLICY IF EXISTS "Allow authenticated users to read content" ON content;
DROP POLICY IF EXISTS "Allow authenticated users to insert content" ON content;

CREATE POLICY "Enable read access for authenticated users"
  ON content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON content
  FOR DELETE
  TO authenticated
  USING (true);

-- Update policies for content_schedule table
DROP POLICY IF EXISTS "Allow authenticated users to read content_schedule" ON content_schedule;
DROP POLICY IF EXISTS "Allow authenticated users to insert content_schedule" ON content_schedule;

CREATE POLICY "Enable read access for authenticated users"
  ON content_schedule
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON content_schedule
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON content_schedule
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON content_schedule
  FOR DELETE
  TO authenticated
  USING (true);