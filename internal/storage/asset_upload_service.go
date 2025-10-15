package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

type GCSService struct {
	client     *storage.Client
	bucketName string
}

func NewGCSService(ctx context.Context, bucketName string) (*GCSService, error) {
	var client *storage.Client
	var err error

	emulatorHost := os.Getenv("STORAGE_EMULATOR_HOST")
	if emulatorHost != "" {
		emulatorHost = normalizeEmulatorHost(emulatorHost)
		log.Printf("[gcs] emulator detected host=%s bucket=%s", emulatorHost, bucketName)
		client, err = storage.NewClient(ctx, option.WithEndpoint(emulatorHost), option.WithoutAuthentication())
	} else {
		log.Printf("[gcs] using real GCS bucket=%s", bucketName)
		client, err = storage.NewClient(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create storage client: %w", err)
	}

	svc := &GCSService{client: client, bucketName: bucketName}
	if emulatorHost != "" {
		if err := svc.ensureBucket(ctx); err != nil {
			log.Printf("[gcs] warn: ensureBucket failed (continuing) bucket=%s err=%v", bucketName, err)
		}
	}
	return svc, nil
}

func normalizeEmulatorHost(h string) string {
	h = strings.TrimRight(h, "/")
	if !strings.HasPrefix(h, "http://") && !strings.HasPrefix(h, "https://") {
		h = "http://" + h
	}
	return h
}

func (s *GCSService) ensureBucket(ctx context.Context) error {
	bkt := s.client.Bucket(s.bucketName)
	_, err := bkt.Attrs(ctx)
	if err == nil {
		log.Printf("[gcs] bucket exists bucket=%s", s.bucketName)
		return nil
	}
	log.Printf("[gcs] bucket attrs error bucket=%s err=%v (attempt create)", s.bucketName, err)
	if cerr := bkt.Create(ctx, "fake-project-id", nil); cerr != nil {
		low := strings.ToLower(cerr.Error())
		if strings.Contains(low, "already") {
			log.Printf("[gcs] bucket already exists after create attempt bucket=%s", s.bucketName)
			return nil
		}
		log.Printf("[gcs] create failed bucket=%s err=%v (attempt dummy object)", s.bucketName, cerr)
		// attempt dummy object write which some emulators materialize bucket on
		w := bkt.Object(".bucket-init").NewWriter(ctx)
		if _, werr := w.Write([]byte{}); werr != nil {
			_ = w.Close()
			log.Printf("[gcs] dummy object write failed bucket=%s err=%v", s.bucketName, werr)
			return cerr // return original create error
		}
		if werr := w.Close(); werr != nil {
			log.Printf("[gcs] dummy object close failed bucket=%s err=%v", s.bucketName, werr)
			return cerr
		}
		log.Printf("[gcs] dummy object wrote bucket=%s -> proceeding", s.bucketName)
		return nil
	}
	log.Printf("[gcs] bucket created bucket=%s", s.bucketName)
	return nil
}

// GenerateSignedUploadURL returns the HTTP method and URL a client should use to upload an object.
// Emulator: uses JSON media upload endpoint (POST) because direct PUT object path returns invalid uploadType.
// Production: returns a V4 signed URL with PUT method.
func (s *GCSService) GenerateSignedUploadURL(ctx context.Context, objectName string, contentType string) (string, string, error) {
	if emulatorHost := os.Getenv("STORAGE_EMULATOR_HOST"); emulatorHost != "" {
		base := strings.TrimRight(emulatorHost, "/")
		if !strings.HasPrefix(base, "http://") && !strings.HasPrefix(base, "https://") {
			base = "http://" + base
		}

		escapedName := url.QueryEscape(objectName)
		uploadURL := fmt.Sprintf("%s/upload/storage/v1/b/%s/o?uploadType=media&name=%s", base, s.bucketName, escapedName)
		log.Printf("[gcs] generate emulator upload url method=POST bucket=%s object=%s url=%s", s.bucketName, objectName, uploadURL)
		return "POST", uploadURL, nil
	}

	// Production: signed PUT URL
	opts := &storage.SignedURLOptions{
		Scheme:      storage.SigningSchemeV4,
		Method:      "PUT",
		Headers:     []string{"Content-Type:" + contentType},
		Expires:     time.Now().Add(15 * time.Minute),
		ContentType: contentType,
	}

	signedURL, err := s.client.Bucket(s.bucketName).SignedURL(objectName, opts)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate signed URL bucket=%s object=%s: %w", s.bucketName, objectName, err)
	}
	log.Printf("[gcs] generate production signed url method=PUT bucket=%s object=%s", s.bucketName, objectName)
	return "PUT", signedURL, nil
}

// Upload uploads a file directly (alternative approach)
func (s *GCSService) Upload(ctx context.Context, objectName string, contentType string, data io.Reader) error {
	wc := s.client.Bucket(s.bucketName).Object(objectName).NewWriter(ctx)
	wc.ContentType = contentType

	if _, err := io.Copy(wc, data); err != nil {
		return fmt.Errorf("failed to write to GCS: %w", err)
	}

	if err := wc.Close(); err != nil {
		return fmt.Errorf("failed to close GCS writer: %w", err)
	}

	return nil
}

// GetPublicURL returns the public URL for an object
func (s *GCSService) GetPublicURL(objectName string) string {
	if emulatorHost := os.Getenv("STORAGE_EMULATOR_HOST"); emulatorHost != "" {
		base := strings.TrimRight(emulatorHost, "/")
		if !strings.HasPrefix(base, "http://") && !strings.HasPrefix(base, "https://") {
			base = "http://" + base
		}
		return fmt.Sprintf("%s/%s/%s", base, s.bucketName, objectName)
	}
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, objectName)
}

func (s *GCSService) Close() error {
	return s.client.Close()
}
