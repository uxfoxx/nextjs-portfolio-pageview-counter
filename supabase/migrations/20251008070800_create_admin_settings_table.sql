/*
  # Create admin settings table for storing admin PIN

  1. New Tables
    - `admin_settings`
      - `id` (uuid, primary key) - Unique identifier for the setting
      - `key` (text, unique) - Setting key name (e.g., 'admin_pin')
      - `value` (text) - Setting value
      - `created_at` (timestamptz) - When the setting was created
      - `updated_at` (timestamptz) - When the setting was last updated

  2. Security
    - Enable RLS on `admin_settings` table
    - No public access - this table should only be accessed from server-side code
    - Create a policy that blocks all public access (service role only)

  3. Initial Data
    - Insert the admin PIN (1234) as a default value

  4. Notes
    - This table stores sensitive admin settings
    - Access is restricted to service role key only
    - The PIN is stored as plain text
*/

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all public access to admin_settings"
  ON admin_settings
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

INSERT INTO admin_settings (key, value)
VALUES ('admin_pin', '1234')
ON CONFLICT (key) DO NOTHING;
