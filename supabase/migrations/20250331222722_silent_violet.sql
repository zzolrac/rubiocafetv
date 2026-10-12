/*
  # Fix User Authentication Setup

  1. Changes
    - Drop and recreate user_roles table
    - Set up RLS policies
    - Create initial users with all required fields
    - Assign roles to users

  2. Security
    - Enable RLS
    - Set up proper policies for role-based access
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Recreate user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('superadmin', 'admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Superadmin can do everything"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create initial users if they don't exist
DO $$
DECLARE
  superadmin_id uuid := 'cc94e5a2-c9b2-4a53-8941-f7f1c29f0d71';
  admin_id uuid := 'dd94e5a2-c9b2-4a53-8941-f7f1c29f0d72';
BEGIN
  -- Create superadmin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = superadmin_id
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      superadmin_id,
      'authenticated',
      'authenticated',
      'super@rubiocafe.com',
      crypt('superadmin123', gen_salt('bf')),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      now(),
      now(),
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      false,
      null
    );
  END IF;

  -- Create admin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = admin_id
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'admin@rubiocafe.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      false,
      now(),
      now(),
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      null,
      false,
      null
    );
  END IF;
END $$;

-- Assign roles (will update if exists due to ON CONFLICT)
INSERT INTO public.user_roles (user_id, role) VALUES
  ('cc94e5a2-c9b2-4a53-8941-f7f1c29f0d71', 'superadmin'),
  ('dd94e5a2-c9b2-4a53-8941-f7f1c29f0d72', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;