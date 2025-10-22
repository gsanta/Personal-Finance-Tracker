package web

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gsanta/Personal-Finance-Tracker/internal/tests"
)

var testDB *sql.DB

// TestMain orchestrates test environment setup.
func TestMain(m *testing.M) {
	tests.LoadTestEnv()
	testDB = tests.ConnectTestDB()
	tests.ApplyMigrations(testDB)
	if err := tests.Seed(testDB); err != nil {
		log.Fatalf("seeding failed: %v", err)
	}
	code := m.Run()
	testDB.Close()
	os.Exit(code)
}

func TestProductsHandler(t *testing.T) {
	// Create a request to pass to our handler. We don't have any query parameters for now, so "/" is fine.
	req, err := http.NewRequest("GET", "/products", nil)
	if err != nil {
		t.Fatal(err)
	}

	// We create a ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(ProductsHandler)

	// Our handlers satisfy http.Handler, so we can call their ServeHTTP method
	// directly and pass in our Request and ResponseRecorder.
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	//// Check the response body is what we expect.
	//// In this case, we're checking if the rendered HTML contains our test product's name.
	//body := rr.Body.String()
	//if !strings.Contains(body, product.Name) {
	//	t.Errorf("handler returned unexpected body: got %v does not contain %v",
	//		body, product.Name)
	//}
}
