/*
  # Initial Schema Setup

  1. Tables
    - content: Stores media content with type, URL, title, description, category, and price
    - locations: Stores business locations
    - screens: Stores digital signage screens
    - content_schedule: Manages content display schedules

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated and public access
    - Storage bucket configuration for media files
*/

-- Drop existing tables and dependencies
DROP TABLE IF EXISTS content_schedule CASCADE;
DROP TABLE IF EXISTS screens CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS content CASCADE;

-- Create content table
CREATE TABLE content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('image', 'video', 'promotion')),
  url text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('breakfast', 'main', 'drinks', 'promotion')),
  price decimal(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create screens table
CREATE TABLE screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  layout_type text NOT NULL DEFAULT 'split' CHECK (layout_type IN ('full_text', 'full_image', 'split')),
  created_at timestamptz DEFAULT now()
);

-- Create content_schedule table
CREATE TABLE content_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid REFERENCES screens(id) ON DELETE CASCADE,
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  days_of_week integer[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable RLS on all tables
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;

-- Content policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON content;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON content;
  DROP POLICY IF EXISTS "Enable update for authenticated users only" ON content;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON content;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Enable read access for all users"
ON content FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON content FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON content FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON content FOR DELETE
TO authenticated
USING (true);

-- Location policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users on locations" ON locations;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only on locations" ON locations;
  DROP POLICY IF EXISTS "Enable update for authenticated users only on locations" ON locations;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only on locations" ON locations;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Enable read access for all users on locations"
ON locations FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only on locations"
ON locations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only on locations"
ON locations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only on locations"
ON locations FOR DELETE
TO authenticated
USING (true);

-- Screen policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users on screens" ON screens;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only on screens" ON screens;
  DROP POLICY IF EXISTS "Enable update for authenticated users only on screens" ON screens;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only on screens" ON screens;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Enable read access for all users on screens"
ON screens FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only on screens"
ON screens FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only on screens"
ON screens FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only on screens"
ON screens FOR DELETE
TO authenticated
USING (true);

-- Content schedule policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users on content_schedule" ON content_schedule;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only on content_schedule" ON content_schedule;
  DROP POLICY IF EXISTS "Enable update for authenticated users only on content_schedule" ON content_schedule;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only on content_schedule" ON content_schedule;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Enable read access for all users on content_schedule"
ON content_schedule FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only on content_schedule"
ON content_schedule FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only on content_schedule"
ON content_schedule FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only on content_schedule"
ON content_schedule FOR DELETE
TO authenticated
USING (true);

-- Configure storage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users on storage" ON storage.objects;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only on storage" ON storage.objects;
  DROP POLICY IF EXISTS "Enable update for authenticated users only on storage" ON storage.objects;
  DROP POLICY IF EXISTS "Enable delete for authenticated users only on storage" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Ensure media bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

-- Storage policies
CREATE POLICY "Enable read access for all users on storage"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Enable insert for authenticated users only on storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable update for authenticated users only on storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable delete for authenticated users only on storage"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');