/*
  # Add Storage RLS Policies

  1. Security Changes
    - Enable RLS for storage.objects table
    - Add policies for authenticated users to manage files in the media bucket
    - Add policies for public access to read files

  2. Changes
    - Add storage bucket policies for file management
    - Add public read access for media files
*/

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
);

-- Allow authenticated users to update their files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Allow public read access to all files
CREATE POLICY "Allow public read access to files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;