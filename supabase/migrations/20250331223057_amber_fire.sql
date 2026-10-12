/*
  # Remove Authentication System

  1. Changes
    - Drop user_roles table
    - Remove all auth-related policies
    - Remove auth-related triggers and functions
*/

-- Drop user_roles table and related objects
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove RLS policies from content tables
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE screens DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule DISABLE ROW LEVEL SECURITY;