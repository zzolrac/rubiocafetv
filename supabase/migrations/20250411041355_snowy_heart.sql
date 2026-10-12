/*
  # Add Short URLs for Screens

  1. Changes
    - Add short_url column to screens table
    - Add unique constraint for short_url
    - Add function to generate random short URLs
    - Add trigger to automatically generate short URLs

  2. Notes
    - Short URLs are unique 6-character alphanumeric strings
    - Auto-generated if not provided
    - Can be manually set
*/

-- Add short_url column
ALTER TABLE screens
ADD COLUMN short_url text UNIQUE;

-- Create function to generate random short URL
CREATE OR REPLACE FUNCTION generate_short_url()
RETURNS text AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer := 0;
  success boolean := false;
BEGIN
  WHILE NOT success AND i < 10 LOOP
    result := '';
    FOR j IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if the generated URL is unique
    IF NOT EXISTS (SELECT 1 FROM screens WHERE short_url = result) THEN
      success := true;
    END IF;
    
    i := i + 1;
  END LOOP;
  
  IF NOT success THEN
    -- If we couldn't generate a unique URL after 10 tries, add a timestamp
    result := result || floor(extract(epoch from now()));
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to set short URL
CREATE OR REPLACE FUNCTION trigger_set_short_url()
RETURNS trigger AS $$
BEGIN
  IF NEW.short_url IS NULL THEN
    NEW.short_url := generate_short_url();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_short_url
BEFORE INSERT ON screens
FOR EACH ROW
EXECUTE FUNCTION trigger_set_short_url();

-- Update existing screens with short URLs
DO $$
DECLARE
  screen_record RECORD;
BEGIN
  FOR screen_record IN SELECT id FROM screens WHERE short_url IS NULL LOOP
    UPDATE screens
    SET short_url = (SELECT generate_short_url())
    WHERE id = screen_record.id;
  END LOOP;
END $$;