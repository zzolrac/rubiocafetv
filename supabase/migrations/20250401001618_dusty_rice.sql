/*
  # Add Admin User

  1. Changes
    - Create admin user with email and password
    - Add user to authenticated role
    - Set up user identity

  2. Security
    - Password is hashed using bcrypt
    - Email is confirmed automatically
*/

-- Create the admin user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert the user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'kun@rubiocafe.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{}'
  )
  RETURNING id INTO new_user_id;

  -- Insert the identity
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
  );
END $$;