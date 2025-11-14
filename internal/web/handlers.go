package web

import (
	"encoding/json"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	tpl            *template.Template
	tplOnce        sync.Once
	manifestClient *ManifestClient
)

func LoadTemplates() {
	tpl = template.Must(template.New("").Funcs(template.FuncMap{
		"toJson": func(v interface{}) template.JS {
			b, _ := json.Marshal(v)
			return template.JS(b)
		},
	}).ParseGlob(filepath.Join("internal", "web", "templates", "*.html")))
}

// EnsureTemplates guarantees templates are parsed exactly once in a thread-safe way.
// Call this from any handler that needs templates before rendering.
func EnsureTemplates() {
	tplOnce.Do(LoadTemplates)
}

func RenderPage(w http.ResponseWriter, r *http.Request, pageProps interface{}) {
	if manifestClient == nil {
		manifestClient = NewManifestClient(os.Getenv("MANIFEST_HOST"))
	}

	uri := r.URL.Path
	formattedUri := strings.ReplaceAll(uri, "-", "_")
	entry := "pages" + formattedUri + "/entry"

	jsFiles := manifestClient.JS(entry)
	cssFiles := manifestClient.CSS(entry)
	data := map[string]interface{}{
		"PageProps": template.JS(mustJSON(pageProps)),
		"JSFiles":   jsFiles,
		"CSSFiles":  cssFiles,
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tpl.ExecuteTemplate(w, "application.html", data); err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
	}
}

func mustJSON(v interface{}) string {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return string(b)
}

func ParsePaginationParams(r *http.Request) (page, itemsPerPage int) {
	page = 1
	itemsPerPage = 10
	if p := r.URL.Query().Get("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			page = v
		}
	}
	if ipp := r.URL.Query().Get("items_per_page"); ipp != "" {
		if v, err := strconv.Atoi(ipp); err == nil && v > 0 {
			itemsPerPage = v
		}
	}
	return
}

func SummariesHandler(w http.ResponseWriter, r *http.Request) {
	tplOnce.Do(LoadTemplates)
	if manifestClient == nil {
		manifestClient = NewManifestClient(os.Getenv("MANIFEST_HOST"))
	}
	pageProps := map[string]interface{}{
		"Title": "Page",
		"Now":   time.Now(),
		"Extra": "This is a page-specific prop",
	}

	uri := r.RequestURI
	formattedUri := strings.ReplaceAll(uri, "-", "_")
	entry := "pages" + formattedUri + "/entry"

	jsFiles := manifestClient.JS(entry)
	cssFiles := manifestClient.CSS(entry)
	data := map[string]interface{}{
		"PageProps": template.JS(mustJSON(pageProps)),
		"JSFiles":   jsFiles,
		"CSSFiles":  cssFiles,
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tpl.ExecuteTemplate(w, "application.html", data); err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
	}
}

//func StatusHandler(w http.ResponseWriter, r *http.Request) {
//	writeJSON(w, http.StatusOK, map[string]interface{}{"status": "ok", "time": time.Now()})
//}
//
//func AsyncHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Task string `json:"task"`
//	}
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payload"})
//		return
//	}
//	// enqueue background work (simple fire-and-forget example)
//	go processTask(req.Task)
//	writeJSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
//}

func ProcessTask(task string) {
	// replace with real queue/worker in production
	time.Sleep(2 * time.Second)
	// log/store result
}

func WriteJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
