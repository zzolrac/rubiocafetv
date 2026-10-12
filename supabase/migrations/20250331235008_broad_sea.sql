/*
  # Update storage policies and bucket configuration

  1. Changes
    - Drop existing storage policies
    - Create new public access policies for storage
    - Create media bucket if it doesn't exist
    - Set bucket to public

  2. Security
    - Allows public access to storage operations
    - Maintains bucket_id validation
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to files" ON storage.objects;

-- Create media bucket if it doesn't exist and ensure it's public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new public policies for storage
CREATE POLICY "Allow public upload to media"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public update to media"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public delete from media"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'media');

CREATE POLICY "Allow public select from media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');