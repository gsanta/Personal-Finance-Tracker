package storage

import (
	"context"
	"fmt"
	"io"
	"os"
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

	// Check if using emulator
	if emulatorHost := os.Getenv("STORAGE_EMULATOR_HOST"); emulatorHost != "" {
		client, err = storage.NewClient(ctx, option.WithEndpoint(emulatorHost), option.WithoutAuthentication())
	} else {
		client, err = storage.NewClient(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to create storage client: %w", err)
	}

	return &GCSService{
		client:     client,
		bucketName: bucketName,
	}, nil
}

// GenerateSignedUploadURL creates a signed URL for uploading
func (s *GCSService) GenerateSignedUploadURL(ctx context.Context, objectName string, contentType string) (string, error) {
	// For emulator, return a direct upload URL
	if os.Getenv("STORAGE_EMULATOR_HOST") != "" {
		return fmt.Sprintf("http://%s/%s/%s", os.Getenv("STORAGE_EMULATOR_HOST"), s.bucketName, objectName), nil
	}

	// For production GCS, generate signed URL
	opts := &storage.SignedURLOptions{
		Scheme:      storage.SigningSchemeV4,
		Method:      "PUT",
		Headers:     []string{"Content-Type:" + contentType},
		Expires:     time.Now().Add(15 * time.Minute),
		ContentType: contentType,
	}

	url, err := s.client.Bucket(s.bucketName).SignedURL(objectName, opts)
	if err != nil {
		return "", fmt.Errorf("failed to generate signed URL: %w", err)
	}

	return url, nil
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
		return fmt.Sprintf("http://%s/%s/%s", emulatorHost, s.bucketName, objectName)
	}
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, objectName)
}

func (s *GCSService) Close() error {
	return s.client.Close()
}
