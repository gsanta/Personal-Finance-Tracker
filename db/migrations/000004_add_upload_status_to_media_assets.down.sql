-- Remove upload_status column from media_assets table
ALTER TABLE media_assets
DROP COLUMN IF EXISTS upload_status;
