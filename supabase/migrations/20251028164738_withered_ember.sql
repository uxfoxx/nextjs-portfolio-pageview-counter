/*
  # Add cover image support to projects table

  ## Description
  Adds a cover_image_url column to the projects table to support cover images for portfolio projects.
  This enables the admin panel to store and display cover images for each project.

  ## Changes
  1. New Columns
    - `cover_image_url` (text, optional) - URL to the project's cover image stored in Supabase storage

  ## Notes
  - This column is optional to maintain compatibility with existing projects
  - Cover images are stored in the 'project-images' storage bucket
  - The column supports NULL values for projects without cover images
*/

-- Add cover_image_url column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE projects ADD COLUMN cover_image_url text;
  END IF;
END $$;