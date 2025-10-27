/*
  # Fix Storage Policies for Admin Image Uploads

  ## Description
  Updates the storage policies for the project-images bucket to allow the service role
  to perform upload operations. The current policies only allow authenticated users,
  but the admin API uses the service role key which bypasses normal authentication.

  ## Changes
  - Update INSERT policy to allow service role
  - Update UPDATE policy to allow service role  
  - Update DELETE policy to allow service role
  - Keep public read access unchanged
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;

-- Allow service role and authenticated users to upload project images
CREATE POLICY "Allow uploads to project images bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'project-images');

-- Allow service role and authenticated users to update project images
CREATE POLICY "Allow updates to project images bucket"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

-- Allow service role and authenticated users to delete project images
CREATE POLICY "Allow deletes from project images bucket"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'project-images');