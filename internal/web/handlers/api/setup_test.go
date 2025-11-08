package api

import (
	"database/sql"
	"log"
	"os"
	"testing"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/tests"
)

var testDB *sql.DB

// TestMain orchestrates test environment setup for all tests in the api package.
func TestMain(m *testing.M) {
	if err := os.Chdir(tests.FindProjectRoot()); err != nil {
		log.Fatalf("failed to chdir to project root: %v", err)
	}

	tests.LoadTestEnv()
	testDB = tests.ConnectTestDB()

	// Assign to global db.DB so handlers can use it
	db.DB = testDB

	tests.ApplyMigrations(testDB)
	code := m.Run()
	testDB.Close()
	os.Exit(code)
}

// seedDB is a helper function that seeds the database before each test.
// Call this at the beginning of each test that needs seeded data.
func seedDB(t *testing.T) {
	t.Helper()

	// Clean up existing data
	if _, err := testDB.Exec("TRUNCATE TABLE media_assets, products RESTART IDENTITY CASCADE"); err != nil {
		t.Fatalf("failed to truncate tables: %v", err)
	}

	// Seed fresh data
	if err := tests.Seed(testDB); err != nil {
		t.Fatalf("seeding failed: %v", err)
	}
}
