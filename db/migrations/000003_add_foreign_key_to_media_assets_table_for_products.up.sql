
-- Add product_id column to media_assets table
ALTER TABLE media_assets
    ADD COLUMN product_id UUID;

-- Add foreign key constraint to products table
ALTER TABLE media_assets
    ADD CONSTRAINT fk_media_assets_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_media_assets_product_id ON media_assets(product_id);