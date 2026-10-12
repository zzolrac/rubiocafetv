/*
  # Update RLS Policies for Locations Table

  1. Changes
    - Update RLS policies for locations table to allow proper access
    - Add DELETE policy for locations
    - Add UPDATE policy for locations

  2. Security
    - Maintain RLS enabled
    - Allow authenticated users to perform CRUD operations
*/

-- Drop existing policies for locations table
DROP POLICY IF EXISTS "Allow authenticated users to read locations" ON locations;
DROP POLICY IF EXISTS "Allow authenticated users to insert locations" ON locations;

-- Create new policies for locations table
CREATE POLICY "Enable read access for authenticated users"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON locations
  FOR DELETE
  TO authenticated
  USING (true);