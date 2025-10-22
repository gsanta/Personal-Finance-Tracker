
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_key TEXT NOT NULL UNIQUE,
    original_filename TEXT,
    content_type TEXT,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    upload_status TEXT
);