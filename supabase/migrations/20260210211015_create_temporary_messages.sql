/*
  # Create Temporary Messages Table for Birthday Announcements

  1. New Tables
    - `temporary_messages`
      - `id` (uuid, primary key) - Unique identifier
      - `message` (text) - The message content (e.g., "Feliz cumpleaños Juan")
      - `screen_ids` (uuid[]) - Array of screen IDs where message should display
      - `user_id` (uuid) - User who created the message
      - `created_at` (timestamptz) - When the message was created
      - `expires_at` (timestamptz) - When the message expires (auto-calculated)
      - `is_active` (boolean) - Whether the message is currently active

  2. Security
    - Enable RLS on `temporary_messages` table
    - Add policy for authenticated users to read all active messages
    - Add policy for authenticated users to create messages
    - Add policy for authenticated users to manage messages

  3. Indexes
    - Index on `screen_ids` for fast lookup
    - Index on `expires_at` for cleanup queries
    - Index on `is_active` for active message queries
*/

CREATE TABLE IF NOT EXISTS temporary_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  screen_ids uuid[] NOT NULL DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_temporary_messages_screen_ids ON temporary_messages USING gin(screen_ids);
CREATE INDEX IF NOT EXISTS idx_temporary_messages_expires_at ON temporary_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_temporary_messages_is_active ON temporary_messages(is_active);
CREATE INDEX IF NOT EXISTS idx_temporary_messages_user_id ON temporary_messages(user_id);

-- Enable RLS
ALTER TABLE temporary_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all active messages
CREATE POLICY "Authenticated users can view active messages"
  ON temporary_messages
  FOR SELECT
  TO authenticated
  USING (is_active = true AND expires_at > now());

-- Policy: Authenticated users can create messages
CREATE POLICY "Authenticated users can create messages"
  ON temporary_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update messages
CREATE POLICY "Authenticated users can update messages"
  ON temporary_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete messages
CREATE POLICY "Authenticated users can delete messages"
  ON temporary_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);