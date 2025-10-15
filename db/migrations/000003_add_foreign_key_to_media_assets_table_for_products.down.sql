-- Remove index
DROP INDEX IF EXISTS idx_media_assets_product_id;

-- Remove foreign key constraint
ALTER TABLE media_assets
DROP CONSTRAINT IF EXISTS fk_media_assets_product;

-- Remove product_id column
ALTER TABLE media_assets
DROP COLUMN IF EXISTS product_id;