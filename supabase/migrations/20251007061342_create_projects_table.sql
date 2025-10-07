/*
  # Create Projects Table

  ## Description
  Creates the main projects table for storing portfolio project data that was previously managed through MDX files. This migration enables dynamic project management through an admin panel.

  ## Tables Created
  
  ### `projects`
  - `id` (uuid, primary key) - Unique identifier for each project
  - `title` (text, required) - Project title displayed on the site
  - `description` (text, required) - Short description for project cards
  - `content` (text, required) - Full project content (supports markdown)
  - `slug` (text, unique, required) - URL-friendly identifier for routing
  - `date` (date, required) - Project publication/completion date
  - `published` (boolean, default false) - Controls visibility on public site
  - `url` (text, optional) - Live project URL
  - `repository` (text, optional) - GitHub repository URL
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ## Security
  - Enable Row Level Security (RLS) on projects table
  - Public read access for published projects only
  - No public write access (admin uses service role)

  ## Indexes
  - Index on slug for fast lookups by URL
  - Index on published and date for filtering and sorting
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  slug text UNIQUE NOT NULL,
  date date NOT NULL,
  published boolean DEFAULT false,
  url text,
  repository text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published projects only
CREATE POLICY "Public can view published projects"
  ON projects
  FOR SELECT
  USING (published = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published_date ON projects(published, date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
