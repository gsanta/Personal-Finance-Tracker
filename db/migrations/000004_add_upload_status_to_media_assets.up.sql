-- Add upload_status column to media_assets table
ALTER TABLE media_assets
ADD COLUMN upload_status TEXT;
