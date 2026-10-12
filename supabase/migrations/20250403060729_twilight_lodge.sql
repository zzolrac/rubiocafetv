/*
  # Add Drink Sizes Support

  1. Changes
    - Add sizes table for drink sizes
    - Add content_sizes table for price variations
    - Update content table constraints
    - Add foreign key relationships

  2. New Tables
    - sizes: Stores available drink sizes (16oz, 24oz)
    - content_sizes: Links content with sizes and prices
*/

-- Create sizes table
CREATE TABLE sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create content_sizes table
CREATE TABLE content_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  size_id uuid REFERENCES sizes(id) ON DELETE CASCADE,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, size_id)
);

-- Enable RLS
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sizes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable public access for sizes"
ON sizes FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable public access for content_sizes"
ON content_sizes FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Insert default sizes
INSERT INTO sizes (name, value) VALUES
  ('16 onzas', '16oz'),
  ('24 onzas', '24oz'),
  ('Estándar', 'standard');

-- Add has_sizes column to content
ALTER TABLE content ADD COLUMN has_sizes boolean DEFAULT false;

COMMENT ON COLUMN content.has_sizes IS 'Indicates if the content has different sizes (e.g., 16oz, 24oz for drinks)';

-- Update existing content
UPDATE content 
SET has_sizes = true 
WHERE category IN ('hot_drinks', 'cold_drinks', 'frappes');

-- Add standard size prices for existing content
INSERT INTO content_sizes (content_id, size_id, price)
SELECT 
  c.id as content_id,
  s.id as size_id,
  c.price
FROM content c
CROSS JOIN sizes s
WHERE s.value = 'standard'
AND c.has_sizes = false;

-- Add 16oz and 24oz prices for drinks
INSERT INTO content_sizes (content_id, size_id, price)
SELECT 
  c.id as content_id,
  s.id as size_id,
  CASE 
    WHEN s.value = '16oz' THEN c.price
    WHEN s.value = '24oz' THEN c.price * 1.25
  END as price
FROM content c
CROSS JOIN sizes s
WHERE c.has_sizes = true
AND s.value != 'standard';