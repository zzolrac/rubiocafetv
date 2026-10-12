/*
  # Update layout types for screens

  1. Changes
    - Update the check constraint for screens.layout_type to include 'video_fullscreen'
    - Remove old constraint and add new one with updated values

  2. Security
    - No changes to RLS policies needed
*/

-- Drop the existing check constraint
ALTER TABLE screens DROP CONSTRAINT IF EXISTS screens_layout_type_check;

-- Add the new check constraint with updated layout types
ALTER TABLE screens ADD CONSTRAINT screens_layout_type_check 
CHECK (layout_type = ANY (ARRAY['full_text'::text, 'full_image'::text, 'split'::text, 'video_fullscreen'::text]));