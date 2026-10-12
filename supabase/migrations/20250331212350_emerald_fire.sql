/*
  # Initial Schema Setup for Digital Signage System

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `created_at` (timestamp)
    
    - `screens`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `content`
      - `id` (uuid, primary key)
      - `type` (text)
      - `url` (text)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `created_at` (timestamp)
    
    - `content_schedule`
      - `id` (uuid, primary key)
      - `screen_id` (uuid, foreign key)
      - `content_id` (uuid, foreign key)
      - `start_time` (time)
      - `end_time` (time)
      - `days_of_week` (integer[])
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create screens table
CREATE TABLE IF NOT EXISTS screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('image', 'video', 'promotion')),
  url text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('breakfast', 'main', 'drinks', 'promotion')),
  created_at timestamptz DEFAULT now()
);

-- Create content_schedule table
CREATE TABLE IF NOT EXISTS content_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid REFERENCES screens(id) ON DELETE CASCADE,
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  days_of_week integer[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read screens"
  ON screens
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert screens"
  ON screens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read content"
  ON content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert content"
  ON content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read content_schedule"
  ON content_schedule
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert content_schedule"
  ON content_schedule
  FOR INSERT
  TO authenticated
  WITH CHECK (true);