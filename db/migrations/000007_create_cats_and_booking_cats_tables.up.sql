-- Create cats table for registered cats
CREATE TABLE IF NOT EXISTS cats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create booking_cats junction table to handle multiple cats per booking
CREATE TABLE IF NOT EXISTS booking_cats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    cat_id UUID REFERENCES cats(id) ON DELETE SET NULL,
    guest_cat_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure either cat_id OR guest_cat_name is provided, but not both
    CONSTRAINT check_cat_reference CHECK (
        (cat_id IS NOT NULL AND guest_cat_name IS NULL) OR
        (cat_id IS NULL AND guest_cat_name IS NOT NULL)
    ),
    
    -- Prevent duplicate cats in the same booking
    UNIQUE(booking_id, cat_id),
    UNIQUE(booking_id, guest_cat_name)
);

-- Add trigger for updated_at on cats table
CREATE TRIGGER cats_updated_at_trigger
    BEFORE UPDATE ON cats
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_cats_owner_user_id ON cats(owner_user_id);
CREATE INDEX idx_booking_cats_booking_id ON booking_cats(booking_id);
CREATE INDEX idx_booking_cats_cat_id ON booking_cats(cat_id);
