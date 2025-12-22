-- Create storage bucket for verification documents
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Allow authenticated users to upload verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-documents');

CREATE POLICY "Allow public read access to verification docs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-documents');

CREATE POLICY "Allow admins to delete verification docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'verification-documents'
    AND auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
);
