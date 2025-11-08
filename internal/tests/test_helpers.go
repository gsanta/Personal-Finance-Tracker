package tests

import (
	"encoding/json"
	"regexp"
	"testing"
)

// ExtractPageProps parses window.pageProps from rendered HTML and returns it as a map.
func ExtractPageProps(t *testing.T, htmlBody string) map[string]interface{} {
	t.Helper()

	// Regex to extract the JSON object after "window.pageProps = "
	re := regexp.MustCompile(`window\.pageProps\s*=\s*(\{[^;]+\});`)
	matches := re.FindStringSubmatch(htmlBody)

	if len(matches) < 2 {
		t.Fatalf("could not find window.pageProps in response body")
	}

	pagePropsJSON := matches[1]

	// Unmarshal into a map or struct
	var pageProps map[string]interface{}
	if err := json.Unmarshal([]byte(pagePropsJSON), &pageProps); err != nil {
		t.Fatalf("failed to parse pageProps JSON: %v", err)
	}

	return pageProps
}

func ParseInt(t *testing.T, raw interface{}) int {
	t.Helper()

	var result int
	switch v := raw.(type) {
	case float64:
		result = int(v)
	case int:
		result = v
	default:
		t.Fatalf("unexpected type: %T (value: %v)", raw, raw)
	}

	return result
}
