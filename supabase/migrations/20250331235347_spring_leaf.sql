/*
  # Fix RLS Policies for Storage and Content

  1. Changes
    - Drop all existing storage policies
    - Create new public storage policies for the media bucket
    - Drop all existing content policies
    - Create new public content policies
    - Ensure media bucket exists and is public

  2. Security
    - Enable RLS on both tables
    - Allow public access for all operations
    - No authentication required
*/

-- First, ensure the media bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Allow public upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select from media" ON storage.objects;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new storage policies
CREATE POLICY "Enable public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Enable public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'media');

CREATE POLICY "Enable public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Drop all existing content policies
DROP POLICY IF EXISTS "Allow public to insert content" ON content;
DROP POLICY IF EXISTS "Allow public to update content" ON content;
DROP POLICY IF EXISTS "Allow public to delete content" ON content;
DROP POLICY IF EXISTS "Allow public read access to content" ON content;

-- Enable RLS on content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create new content policies
CREATE POLICY "Enable public insert"
ON content
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable public update"
ON content
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable public delete"
ON content
FOR DELETE
TO public
USING (true);

CREATE POLICY "Enable public read"
ON content
FOR SELECT
TO public
USING (true);