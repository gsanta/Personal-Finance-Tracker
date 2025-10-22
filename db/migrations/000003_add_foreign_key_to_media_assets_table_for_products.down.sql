DROP INDEX IF EXISTS idx_media_assets_product_id;

ALTER TABLE media_assets
DROP CONSTRAINT IF EXISTS fk_media_assets_product;

ALTER TABLE media_assets
DROP COLUMN IF EXISTS product_id;