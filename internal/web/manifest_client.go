package web

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
)

type ManifestClient struct {
	ManifestHost string
	manifest     map[string]interface{}
	mu           sync.Mutex
}

func NewManifestClient(manifestHost string) *ManifestClient {
	return &ManifestClient{ManifestHost: manifestHost}
}

func (mc *ManifestClient) fetchManifest() error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	// TODO: memoize manifest in production
	//if mc.manifest != nil {
	//    return nil
	//}

	url := fmt.Sprintf("%s/version-dev/manifest.json", mc.ManifestHost)
	resp, err := http.Get(url)
	if err != nil {
		mc.manifest = nil
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		mc.manifest = nil
		return err
	}

	var manifest map[string]interface{}
	if err := json.Unmarshal(body, &manifest); err != nil {
		mc.manifest = nil
		return err
	}
	mc.manifest = manifest
	return nil
}

func (mc *ManifestClient) JS(entry string) []string {
	mc.fetchManifest()
	entrypoints, ok := mc.manifest["entrypoints"].(map[string]interface{})
	if !ok {
		return []string{}
	}
	entryNode, ok := entrypoints[entry].(map[string]interface{})
	if !ok {
		return []string{}
	}
	assets, ok := entryNode["assets"].(map[string]interface{})
	if !ok {
		return []string{}
	}
	jsFiles, ok := assets["js"].([]interface{})
	if !ok {
		return []string{}
	}
	result := make([]string, 0, len(jsFiles))
	for _, v := range jsFiles {
		if s, ok := v.(string); ok {
			result = append(result, s)
		}
	}
	return result
}

func (mc *ManifestClient) CSS(entry string) []string {
	mc.fetchManifest()
	entrypoints, ok := mc.manifest["entrypoints"].(map[string]interface{})
	if !ok {
		return []string{}
	}
	entryNode, ok := entrypoints[entry].(map[string]interface{})
	if !ok {
		return []string{}
	}
	assets, ok := entryNode["assets"].(map[string]interface{})
	if !ok {
		return []string{}
	}
	cssFiles, ok := assets["css"].([]interface{})
	if !ok {
		return []string{}
	}
	result := make([]string, 0, len(cssFiles))
	for _, v := range cssFiles {
		if s, ok := v.(string); ok {
			result = append(result, s)
		}
	}
	return result
}
