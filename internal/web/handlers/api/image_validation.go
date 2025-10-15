package api

// isValidImageType returns true if the provided MIME type is an allowed image content type.
func isValidImageType(contentType string) bool {
	// map lookup keeps it O(1) and concise; extend here if you allow more.
	var validTypes = map[string]struct{}{
		"image/jpeg": {},
		"image/jpg":  {},
		"image/png":  {},
		"image/gif":  {},
		"image/webp": {},
	}
	_, ok := validTypes[contentType]
	return ok
}
