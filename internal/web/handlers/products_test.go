package web

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/tests"
)

var testDB *sql.DB

// TestMain orchestrates test environment setup.
func TestMain(m *testing.M) {
	// Change to project root so relative paths (templates, migrations) work
	if err := os.Chdir(tests.FindProjectRoot()); err != nil {
		log.Fatalf("failed to chdir to project root: %v", err)
	}

	tests.LoadTestEnv()
	testDB = tests.ConnectTestDB()

	// Assign to global db.DB so handlers can use it
	db.DB = testDB

	tests.ApplyMigrations(testDB)
	// Ensure a clean state before seeding to avoid cross-package duplicates
	if _, err := testDB.Exec("TRUNCATE TABLE media_assets, products RESTART IDENTITY CASCADE"); err != nil {
		log.Fatalf("failed to truncate tables: %v", err)
	}
	if err := tests.Seed(testDB); err != nil {
		log.Fatalf("seeding failed: %v", err)
	}
	code := m.Run()
	testDB.Close()
	os.Exit(code)
}

func TestProductsHandler(t *testing.T) {
	// Create a request to pass to our handler
	req, err := http.NewRequest("GET", "/products", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(ProductsHandler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	pageProps := tests.ExtractPageProps(t, rr.Body.String())

	products, ok := pageProps["products"].(map[string]interface{})
	if !ok {
		t.Fatalf("pageProps.products is not a map, got type: %T, value: %v", pageProps["products"], pageProps["products"])
	}

	totalCount := tests.ParseInt(t, products["totalCount"])

	if totalCount != 2 {
		t.Errorf("expected totalCount = 2, got %v", totalCount)
	}

	items, ok := products["items"].([]interface{})
	if !ok {
		t.Fatalf("products.Items is not an array")
	}

	if len(items) != 2 {
		t.Errorf("expected 2 items, got %d", len(items))
	}

	firstProduct := items[0].(map[string]interface{})
	if _, ok := firstProduct["id"]; !ok {
		t.Errorf("first product missing id field")
	}

	name, ok := firstProduct["name"]
	if !ok {
		t.Errorf("first product missing name field")
	}

	if name != "Sample Product A" {
		t.Errorf("expected first product name to be 'Sample Product A', got %v", name)
	}
}
