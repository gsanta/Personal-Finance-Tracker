package api

import (
    "os"
    "strings"
)

// buildPublicURL builds a public (or emulator) URL for an object key.
func buildPublicURL(bucket, objectKey string) string {
    if host := getenv("STORAGE_EMULATOR_HOST"); host != "" {
        host = strings.TrimRight(host, "/")
        if !strings.HasPrefix(host, "http://") && !strings.HasPrefix(host, "https://") { host = "http://" + host }
        return host + "/" + bucket + "/" + objectKey
    }
    return "https://storage.googleapis.com/" + bucket + "/" + objectKey
}

// getenv trims whitespace; returns empty string if unset.
func getenv(k string) string {
    v := os.Getenv(k)
    v = strings.TrimSpace(v)
    return v
}
