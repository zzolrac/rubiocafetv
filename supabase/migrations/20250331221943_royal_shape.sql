/*
  # Add User Roles and Management

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on user_roles table
    - Add policies for superadmin access
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('superadmin', 'admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Superadmin can do everything"
  ON user_roles
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert initial superadmin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'cc94e5a2-c9b2-4a53-8941-f7f1c29f0d71',
  'authenticated',
  'authenticated',
  'super@rubiocafe.com',
  crypt('superadmin123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Insert initial admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'dd94e5a2-c9b2-4a53-8941-f7f1c29f0d72',
  'authenticated',
  'authenticated',
  'admin@rubiocafe.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Assign roles
INSERT INTO user_roles (user_id, role) VALUES
  ('cc94e5a2-c9b2-4a53-8941-f7f1c29f0d71', 'superadmin'),
  ('dd94e5a2-c9b2-4a53-8941-f7f1c29f0d72', 'admin');