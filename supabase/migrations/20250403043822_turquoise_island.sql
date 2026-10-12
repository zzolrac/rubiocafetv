/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Drop existing RLS policies
    - Create new public access policies for all tables
    - Enable RLS on all tables
    - Allow public access for all operations

  2. Security
    - Note: This is a temporary solution for development
    - In production, proper authentication should be implemented
*/

-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON content;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON content;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON content;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON content;

DROP POLICY IF EXISTS "Enable read access for all users on locations" ON locations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only on locations" ON locations;
DROP POLICY IF EXISTS "Enable update for authenticated users only on locations" ON locations;
DROP POLICY IF EXISTS "Enable delete for authenticated users only on locations" ON locations;

DROP POLICY IF EXISTS "Enable read access for all users on screens" ON screens;
DROP POLICY IF EXISTS "Enable insert for authenticated users only on screens" ON screens;
DROP POLICY IF EXISTS "Enable update for authenticated users only on screens" ON screens;
DROP POLICY IF EXISTS "Enable delete for authenticated users only on screens" ON screens;

DROP POLICY IF EXISTS "Enable read access for all users on content_schedule" ON content_schedule;
DROP POLICY IF EXISTS "Enable insert for authenticated users only on content_schedule" ON content_schedule;
DROP POLICY IF EXISTS "Enable update for authenticated users only on content_schedule" ON content_schedule;
DROP POLICY IF EXISTS "Enable delete for authenticated users only on content_schedule" ON content_schedule;

-- Create new public policies for locations
CREATE POLICY "Enable public access for locations"
ON locations FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create new public policies for screens
CREATE POLICY "Enable public access for screens"
ON screens FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create new public policies for content
CREATE POLICY "Enable public access for content"
ON content FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create new public policies for content_schedule
CREATE POLICY "Enable public access for content_schedule"
ON content_schedule FOR ALL
TO public
USING (true)
WITH CHECK (true);