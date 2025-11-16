-- Down migration for users table and related objects
-- Reverts 000004_create_users_table.up.sql

-- Drop trigger first (if exists), then table, then function.
DO $$
BEGIN
    -- Drop trigger if it exists
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE t.tgname = 'users_set_updated_at' AND c.relname = 'users'
    ) THEN
        EXECUTE 'DROP TRIGGER IF EXISTS users_set_updated_at ON users';
    END IF;
EXCEPTION WHEN undefined_table THEN
    -- table "users" might not exist; ignore
END $$;

-- Drop index (safe even if table already dropped)
DROP INDEX IF EXISTS idx_users_email;

-- Drop table
DROP TABLE IF EXISTS users;

-- Drop helper function used by trigger
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
