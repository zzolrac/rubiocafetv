/*
  # Update RLS policies for public access

  1. Changes
    - Update storage.objects policies to allow public access for all operations
    - Update content table policies to allow public access for all operations

  2. Security
    - Removes authentication requirements
    - Allows anyone to upload files and manage content
    - Maintains public read access
*/

-- Drop existing policies for storage.objects
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to files" ON storage.objects;

-- Create new public policies for storage.objects
CREATE POLICY "Allow public to upload files"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public to update files"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public to delete files"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'media');

CREATE POLICY "Allow public read access to files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Drop existing policies for content table
DROP POLICY IF EXISTS "Allow authenticated users to insert content" ON content;
DROP POLICY IF EXISTS "Allow authenticated users to update content" ON content;
DROP POLICY IF EXISTS "Allow authenticated users to delete content" ON content;
DROP POLICY IF EXISTS "Allow public read access to content" ON content;

-- Create new public policies for content table
CREATE POLICY "Allow public to insert content"
ON content
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public to update content"
ON content
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public to delete content"
ON content
FOR DELETE
TO public
USING (true);

CREATE POLICY "Allow public read access to content"
ON content
FOR SELECT
TO public
USING (true);