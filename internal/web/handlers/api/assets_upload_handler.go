package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/gsanta/Personal-Finance-Tracker/internal/storage"
)

type UploadHandler struct {
	storageService *storage.GCSService
}

func NewUploadHandler(storageService *storage.GCSService) *UploadHandler {
	return &UploadHandler{
		storageService: storageService,
	}
}

type GenerateUploadURLRequest struct {
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
}

type GenerateUploadURLResponse struct {
	UploadURL string `json:"uploadUrl"`
	ObjectKey string `json:"objectKey"`
	PublicURL string `json:"publicUrl"`
	Method    string `json:"method"`
}

// GenerateUploadURL handles POST /api/upload/generate-url
func (h *UploadHandler) GenerateUploadURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req GenerateUploadURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate content type
	if !isValidImageType(req.ContentType) {
		http.Error(w, "Invalid content type. Only images allowed", http.StatusBadRequest)
		return
	}

	// Generate unique object name
	ext := filepath.Ext(req.FileName)
	objectKey := fmt.Sprintf("uploads/%d/%s%s", time.Now().Unix(), uuid.New().String(), ext)

	// Generate signed URL
	method, uploadURL, err := h.storageService.GenerateSignedUploadURL(r.Context(), objectKey, req.ContentType)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to generate upload URL: %v", err), http.StatusInternalServerError)
		return
	}

	response := GenerateUploadURLResponse{
		UploadURL: uploadURL,
		ObjectKey: objectKey,
		PublicURL: h.storageService.GetPublicURL(objectKey),
		Method:    method,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func isValidImageType(contentType string) bool {
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	return validTypes[contentType]
}
