DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE t.tgname = 'rooms_set_updated_at' AND c.relname = 'rooms'
    ) THEN
        EXECUTE 'DROP TRIGGER IF EXISTS rooms_set_updated_at ON rooms';
    END IF;
EXCEPTION WHEN undefined_table THEN
    -- table "rooms" might not exist; ignore
END $$;

-- Drop table
DROP TABLE IF EXISTS rooms;

-- Drop helper function used by trigger
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
