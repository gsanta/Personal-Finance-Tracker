package web

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

var (
	tpl            *template.Template
	tplOnce        sync.Once
	manifestClient *ManifestClient
)

func loadTemplates() {
	tpl = template.Must(template.New("").Funcs(template.FuncMap{
		"toJson": func(v interface{}) template.JS {
			b, _ := json.Marshal(v)
			return template.JS(b)
		},
	}).ParseGlob(filepath.Join("internal", "web", "templates", "*.html")))
}

func PaymentsHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[PaymentsHandler] %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	tplOnce.Do(loadTemplates)
	if manifestClient == nil {
		manifestClient = NewManifestClient(os.Getenv("MANIFEST_HOST"))
	}
	pageProps := map[string]interface{}{
		"Title": "Home",
		"Now":   time.Now(),
		"User": map[string]interface{}{
			"name": "Alice",
			"id":   123,
		},
	}

	uri := r.RequestURI
	formattedUri := strings.ReplaceAll(uri, "-", "_")
	entry := "pages" + formattedUri + "/entry"

	jsFiles := manifestClient.JS(entry)
	cssFiles := manifestClient.CSS(entry)
	data := map[string]interface{}{
		"PageProps": pageProps,
		"JSFiles":   jsFiles,
		"CSSFiles":  cssFiles,
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tpl.ExecuteTemplate(w, "application.html", data); err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
	}
}

func SummariesHandler(w http.ResponseWriter, r *http.Request) {
	tplOnce.Do(loadTemplates)
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
		"PageProps": pageProps,
		"JSFiles":   jsFiles,
		"CSSFiles":  cssFiles,
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tpl.ExecuteTemplate(w, "application.html", data); err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
	}
}

func StatusHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{"status": "ok", "time": time.Now()})
}

func AsyncHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Task string `json:"task"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid payload"})
		return
	}
	// enqueue background work (simple fire-and-forget example)
	go processTask(req.Task)
	writeJSON(w, http.StatusAccepted, map[string]string{"status": "accepted"})
}

func processTask(task string) {
	// replace with real queue/worker in production
	time.Sleep(2 * time.Second)
	// log/store result
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
