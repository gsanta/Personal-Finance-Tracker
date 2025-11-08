package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gsanta/Personal-Finance-Tracker/internal/tests"
)

func TestProductsHandler(t *testing.T) {
	// Seed the database before this test
	seedDB(t)

	// Create a request to pass to our handler
	req, err := http.NewRequest("GET", "/api/products", nil)
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

	contentType := rr.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("expected Content-Type: application/json, got %v", contentType)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to parse JSON response: %v", err)
	}

	totalCount := tests.ParseInt(t, response["totalCount"])

	if totalCount != 2 {
		t.Errorf("expected totalCount = 2, got %v", totalCount)
	}

	items, ok := response["items"].([]interface{})
	if !ok {
		t.Fatalf("response.items is not an array")
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
