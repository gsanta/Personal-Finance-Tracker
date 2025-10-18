package storage

import (
	"fmt"
	"os"
	"strings"
)

// GetPublicURL returns the public URL for an object
func GetPublicURL(bucketName string, objectName string) string {
	if emulatorHost := os.Getenv("STORAGE_EMULATOR_HOST"); emulatorHost != "" {
		base := strings.TrimRight(emulatorHost, "/")
		if !strings.HasPrefix(base, "http://") && !strings.HasPrefix(base, "https://") {
			base = "http://" + base
		}
		return fmt.Sprintf("%s/%s/%s", base, bucketName, objectName)
	}
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName)
}
