package api

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	dbpkg "github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/tests"
)

type fakeSigner struct {
	method string
	url    string
	err    error
}

func (f *fakeSigner) GenerateSignedUploadURL(ctx context.Context, objectName string, contentType string) (string, string, error) {
	return f.method, f.url, f.err
}

func TestGetMediaAsset(t *testing.T) {
	seedDB(t)

	expectedID := tests.FirstMediaAsset().ID

	req, err := http.NewRequest("GET", "/api/media/"+expectedID, nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	mediaHandler := NewMediaHandler(testDB, "test-bucket", &fakeSigner{})
	handler := http.HandlerFunc(mediaHandler.GetMediaAsset)

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

	if id, ok := response["id"].(string); !ok || id != expectedID {
		t.Errorf("expected id = %s, got %v", expectedID, response["id"])
	}

	if _, ok := response["originalFilename"].(string); !ok {
		t.Errorf("missing originalFilename field")
	}

	if _, ok := response["publicUrl"].(string); !ok {
		t.Errorf("missing publicUrl field")
	}

	if _, ok := response["uploadStatus"].(string); !ok {
		t.Errorf("missing uploadStatus field")
	}
}

func TestGenerateUploadURL(t *testing.T) {
	seedDB(t)

	body := GenerateUploadURLRequest{
		FileName:    "photo.jpg",
		ContentType: "image/jpeg",
		ProductId:   tests.FirstProduct().ID,
		SizeBytes:   2048,
	}
	b, _ := json.Marshal(body)
	req, err := http.NewRequest("POST", "/api/media/upload-url", bytes.NewReader(b))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	fake := &fakeSigner{method: "PUT", url: "http://example.com/signed"}
	mediaHandler := NewMediaHandler(testDB, "test-bucket", fake)
	handler := http.HandlerFunc(mediaHandler.GenerateUploadURL)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Fatalf("unexpected status: %d body=%s", status, rr.Body.String())
	}

	var resp GenerateUploadURLResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if resp.AssetID == "" {
		t.Fatalf("expected asset id")
	}
	if resp.Method != "PUT" || resp.UploadURL != "http://example.com/signed" {
		t.Fatalf("unexpected method/url: %+v", resp)
	}
	if resp.ObjectKey == "" {
		t.Fatalf("expected objectKey")
	}
	if resp.PublicURL == "" {
		t.Fatalf("expected publicUrl")
	}

	// verify DB inserted with status uploading
	asset, err := dbpkg.GetMediaAsset(testDB, resp.AssetID)
	if err != nil {
		t.Fatalf("db get asset: %v", err)
	}
	if asset.UploadStatus != "uploading" {
		t.Fatalf("expected status uploading, got %s", asset.UploadStatus)
	}
}
