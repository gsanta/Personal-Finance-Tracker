package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	dbpkg "github.com/gsanta/Personal-Finance-Tracker/internal/db"

	"github.com/google/uuid"
	"github.com/gsanta/Personal-Finance-Tracker/internal/storage"
)

type UploadHandler struct {
	DB             *sql.DB
	storageService *storage.GCSService
}

func NewUploadHandler(db *sql.DB, storageService *storage.GCSService) *UploadHandler {
	return &UploadHandler{
		DB:             db,
		storageService: storageService,
	}
}

type GenerateUploadURLRequest struct {
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
	ProductId   string `json:"productId"`
	SizeBytes   int64  `json:"sizeBytes"`
}

type GenerateUploadURLResponse struct {
	AssetID   string `json:"assetId"`
	UploadURL string `json:"uploadUrl"`
	ObjectKey string `json:"objectKey"`
	PublicURL string `json:"publicUrl"`
	Method    string `json:"method"`
}

// GenerateUploadURL handles POST /api/media/upload-url
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

	asset := &dbpkg.MediaAsset{
		ObjectKey:        objectKey,
		OriginalFilename: req.FileName,
		ContentType:      req.ContentType,
		ProductId:        req.ProductId,
		SizeBytes:        req.SizeBytes,
	}

	if err := dbpkg.InsertMediaAsset(h.DB, asset); err != nil {
		http.Error(w, "failed to insert media asset: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := GenerateUploadURLResponse{
		AssetID:   asset.ID,
		UploadURL: uploadURL,
		ObjectKey: objectKey,
		PublicURL: storage.GetPublicURL(h.storageService.BucketName, objectKey),
		Method:    method,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// MediaFinalizeRequest payload from frontend after successful direct upload.
// sizeBytes can be 0 if not known; we still store record.
type MediaFinalizeRequest struct {
	ID string `json:"id"`
}

type MediaFinalizeResponse struct {
	ID        string `json:"id"`
	ObjectKey string `json:"objectKey"`
	PublicURL string `json:"publicUrl"`
}

type MediaHandler struct {
	DB     *sql.DB
	Bucket string
}

func NewMediaHandler(db *sql.DB, bucket string) *MediaHandler {
	return &MediaHandler{DB: db, Bucket: bucket}
}

// Finalize handles POST /api/media/finalize
// It updates the media asset status to 'uploaded' based on req.ID and returns its info.
func (h *MediaHandler) Finalize(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req MediaFinalizeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.ID == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	asset, err := dbpkg.UpdateMediaAssetStatusAndReturn(h.DB, req.ID, "uploaded")
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "asset not found", http.StatusNotFound)
		} else {
			http.Error(w, "failed to update asset status: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	publicURL := buildPublicURL(h.Bucket, asset.ObjectKey)
	resp := MediaFinalizeResponse{
		ID:        asset.ID,
		ObjectKey: asset.ObjectKey,
		PublicURL: publicURL,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
