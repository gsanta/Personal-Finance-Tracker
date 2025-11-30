DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE t.tgname = 'bookings_set_updated_at' AND c.relname = 'bookings'
    ) THEN
        EXECUTE 'DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings';
    END IF;
EXCEPTION WHEN undefined_table THEN
    -- table "bookings" might not exist; ignore
END $$;

-- Drop table
DROP TABLE IF EXISTS bookings;

-- Drop helper function used by trigger
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
