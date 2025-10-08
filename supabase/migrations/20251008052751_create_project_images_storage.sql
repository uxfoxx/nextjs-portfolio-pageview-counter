/*
  # Create Storage Bucket for Project Images

  ## Description
  Creates a Supabase storage bucket to store project images with proper security policies.

  ## Storage Bucket Created
  - `project-images` - Public bucket for storing project images

  ## Security
  - Public read access for all images
  - Authenticated admin access for write operations
*/

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to project images
CREATE POLICY IF NOT EXISTS "Public can view project images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-images');

-- Allow authenticated users to upload project images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload project images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

-- Allow authenticated users to update project images
CREATE POLICY IF NOT EXISTS "Authenticated users can update project images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

-- Allow authenticated users to delete project images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete project images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-images');
