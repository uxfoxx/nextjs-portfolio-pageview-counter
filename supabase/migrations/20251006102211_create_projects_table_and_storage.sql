/*
  # Create Projects Table and Storage Buckets

  1. New Tables
    - `projects`
      - `id` (uuid, primary key, auto-generated)
      - `slug` (text, unique, indexed) - URL-friendly identifier
      - `title` (text, required) - Project title
      - `description` (text, required) - Short description
      - `content` (text) - Rich HTML content from WYSIWYG editor
      - `cover_image_url` (text) - URL to cover/hero image
      - `published` (boolean, default false) - Visibility status
      - `date` (timestamptz) - Project date
      - `url` (text) - Link to live project
      - `repository` (text) - Link to repository
      - `created_at` (timestamptz, auto-generated)
      - `updated_at` (timestamptz, auto-updated)

  2. Storage Buckets
    - `project-covers` - For project cover images
    - `project-images` - For content images used in projects

  3. Security
    - Enable RLS on `projects` table
    - Public read access for published projects
    - No authenticated user policies needed (admin uses API routes with PIN)
    
  4. Indexes
    - Index on `slug` for fast lookups
    - Index on `published` for filtering
    - Index on `date` for sorting
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content text DEFAULT '',
  cover_image_url text,
  published boolean DEFAULT false,
  date timestamptz DEFAULT now(),
  url text,
  repository text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date DESC);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published projects only
CREATE POLICY "Public can view published projects"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-covers', 'project-covers', true),
  ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project covers
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Public can view project covers" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload project covers" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete project covers" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload project images" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete project images" ON storage.objects;
END $$;

-- Allow public read access to storage buckets
CREATE POLICY "Public can view project covers"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project-covers');

CREATE POLICY "Public can view project images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project-images');

-- Allow public insert access to storage buckets (will be protected by API routes)
CREATE POLICY "Anyone can upload project covers"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'project-covers');

CREATE POLICY "Anyone can upload project images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'project-images');

-- Allow public delete access to storage buckets (will be protected by API routes)
CREATE POLICY "Anyone can delete project covers"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'project-covers');

CREATE POLICY "Anyone can delete project images"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'project-images');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
