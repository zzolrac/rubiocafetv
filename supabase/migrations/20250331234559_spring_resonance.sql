/*
  # Fix RLS Policies for Content Table

  1. Security Changes
    - Enable RLS for content table
    - Add policies for authenticated users to manage content
    - Add policies for public access to read content

  2. Changes
    - Add content table policies for CRUD operations
    - Add public read access for content
*/

-- Enable RLS for content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert content
CREATE POLICY "Allow authenticated users to insert content"
ON content
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their content
CREATE POLICY "Allow authenticated users to update content"
ON content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete their content
CREATE POLICY "Allow authenticated users to delete content"
ON content
FOR DELETE
TO authenticated
USING (true);

-- Allow public read access to content
CREATE POLICY "Allow public read access to content"
ON content
FOR SELECT
TO public
USING (true);