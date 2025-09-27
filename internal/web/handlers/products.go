package web

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

var (
	tpl            *template.Template
	tplOnce        sync.Once
	manifestClient *web.ManifestClient
)

func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[ProductsHandler] %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	tplOnce.Do(web.LoadTemplates)
	if manifestClient == nil {
		manifestClient = web.NewManifestClient(os.Getenv("MANIFEST_HOST"))
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

	products, err := db.GetAllProducts(db.DB)
	if err != nil {
		// handle error (e.g., log or return HTTP 500)
		return
	}

	for _, p := range products {
		log.Printf("Product: %+v\n", p)
	}

	web.RenderPage(w, manifestClient, entry, pageProps)
}
