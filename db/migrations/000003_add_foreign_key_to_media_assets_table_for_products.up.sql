
ALTER TABLE media_assets
    ADD COLUMN product_id UUID;
ALTER TABLE media_assets
    ADD CONSTRAINT fk_media_assets_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
CREATE INDEX idx_media_assets_product_id ON media_assets(product_id);