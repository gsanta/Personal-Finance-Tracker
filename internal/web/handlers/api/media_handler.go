package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/go-chi/chi/v5"
	dbpkg "github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"

	"github.com/google/uuid"
	"github.com/gsanta/Personal-Finance-Tracker/internal/storage"
)

type StorageSigner interface {
	GenerateSignedUploadURL(ctx context.Context, objectName string, contentType string) (method string, url string, err error)
}

type MediaHandler struct {
	DB             *sql.DB
	Bucket         string
	storageService StorageSigner
}

func NewMediaHandler(db *sql.DB, bucket string, storageService StorageSigner) *MediaHandler {
	return &MediaHandler{DB: db, Bucket: bucket, storageService: storageService}
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
func (h *MediaHandler) GenerateUploadURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req GenerateUploadURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if !isValidImageType(req.ContentType) {
		http.Error(w, "Invalid content type. Only images allowed", http.StatusBadRequest)
		return
	}

	ext := filepath.Ext(req.FileName)
	objectKey := fmt.Sprintf("uploads/%d/%s%s", time.Now().Unix(), uuid.New().String(), ext)

	method, uploadURL, err := h.storageService.GenerateSignedUploadURL(r.Context(), objectKey, req.ContentType)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to generate upload URL: %v", err), http.StatusInternalServerError)
		return
	}

	asset := &dbpkg.MediaAsset{
		ObjectKey:        objectKey,
		OriginalFilename: req.FileName,
		ContentType:      req.ContentType,
		ProductId:        sql.NullString{String: req.ProductId, Valid: req.ProductId != ""},
		SizeBytes:        req.SizeBytes,
		UploadStatus:     "uploading",
	}

	if err := dbpkg.InsertMediaAsset(h.DB, asset); err != nil {
		http.Error(w, "failed to insert media asset: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := GenerateUploadURLResponse{
		AssetID:   asset.ID,
		UploadURL: uploadURL,
		ObjectKey: objectKey,
		PublicURL: storage.GetPublicURL(h.Bucket, objectKey),
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

type GetMediaAssetRequest struct {
	ID string `json:"id"`
}

func (h *MediaHandler) GetMediaAsset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	log.Printf("The id is: %s", id)

	asset, err := dbpkg.GetMediaAsset(h.DB, id)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "media asset not found", http.StatusNotFound)
		} else {
			http.Error(w, fmt.Sprintf("failed to fetch media asset: %v", err), http.StatusInternalServerError)
		}
		return
	}

	presenter := presenters.NewMediaAssetPresenter(*asset)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(presenter)
}

// FinalizeUploadMediaAsset handles POST /api/media/finalize
// It updates the media asset status to 'uploaded' based on req.ID and returns its info.
func (h *MediaHandler) FinalizeUploadMediaAsset(w http.ResponseWriter, r *http.Request) {
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
