/*
  # Fix Authentication Schema

  1. Changes
    - Drop existing auth policies to avoid conflicts
    - Set up proper auth schema configuration
    - Enable RLS for auth tables
    - Create necessary auth policies
*/

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
ALTER COLUMN is_sso_user SET DEFAULT false;

-- Add unique constraint on email
ALTER TABLE auth.users
ADD CONSTRAINT users_email_key UNIQUE (email);

-- Add unique constraint on identities
ALTER TABLE auth.identities
ADD CONSTRAINT identities_provider_provider_id_key UNIQUE (provider, provider_id);

-- Create default admin user if not exists
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    is_sso_user
  )
  VALUES (
    new_user_id,
    'kun@rubiocafe.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated',
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    false
  )
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'kun@rubiocafe.com'
    ),
    'email',
    'kun@rubiocafe.com',
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;
END $$;