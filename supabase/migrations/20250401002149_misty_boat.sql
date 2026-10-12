/*
  # Fix Authentication Schema

  1. Changes
    - Drop existing auth policies to avoid conflicts
    - Set up proper auth schema configuration
    - Enable RLS for auth tables
    - Create necessary auth policies
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for users" ON auth.users;
  DROP POLICY IF EXISTS "Enable update for users" ON auth.users;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS for auth tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create auth policies
CREATE POLICY "Enable read access for users"
ON auth.users FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "Enable update for users"
ON auth.users FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- Create auth schema configuration
ALTER TABLE auth.users
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN encrypted_password SET NOT NULL,
ALTER COLUMN raw_app_meta_data SET DEFAULT '{"provider": "email", "providers": ["email"]}',
ALTER COLUMN raw_user_meta_data SET DEFAULT '{}',
ALTER COLUMN is_super_admin SET DEFAULT false,
ALTER COLUMN is_sso_user SET DEFAULT false,
ALTER COLUMN instance_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add unique constraint on email if it doesn't exist
DO $$ BEGIN
  ALTER TABLE auth.users
  ADD CONSTRAINT users_email_key UNIQUE (email);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Add unique constraint on identities if it doesn't exist
DO $$ BEGIN
  ALTER TABLE auth.identities
  ADD CONSTRAINT identities_provider_provider_id_key UNIQUE (provider, provider_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Create default admin user if not exists
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_current,
  email_change_token_new,
  is_super_admin,
  is_sso_user
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'kun@rubiocafe.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex'),
  false,
  false
)
ON CONFLICT (email) DO NOTHING;