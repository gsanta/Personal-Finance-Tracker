package presenters

import (
	"os"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/storage"
)

type MediaAssetPresenter struct {
	ID               string `json:"id"`
	OriginalFilename string `json:"originalFilename"`
	PublicURL        string `json:"publicUrl"`
	CreatedAt        string `json:"createdAt"`
}

func NewMediaAssetPresenter(asset db.MediaAsset) MediaAssetPresenter {
	bucketName := os.Getenv("GCS_BUCKET_NAME")
	publicUrl := storage.GetPublicURL(bucketName, asset.ObjectKey)

	return MediaAssetPresenter{
		ID:               asset.ID,
		OriginalFilename: asset.OriginalFilename,
		CreatedAt:        asset.CreatedAt,
		PublicURL:        publicUrl,
	}
}
