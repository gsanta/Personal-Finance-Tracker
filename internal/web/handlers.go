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

	"github.com/gin-gonic/gin"
	"github.com/go-pkgz/auth/token"
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

func WriteJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func GetCurrentUser(c *gin.Context) (token.User, bool) {
	if user, exists := c.Get("user"); exists {
		if tokenUser, ok := user.(token.User); ok {
			return tokenUser, true
		}
	}
	return token.User{}, false
}

// MergeAuthProps merges authentication fields into pageProps.
// This adds isLoggedIn and user fields that are common across all authenticated pages.
func MergeAuthProps(c *gin.Context, pageProps map[string]interface{}) map[string]interface{} {
	if pageProps == nil {
		pageProps = make(map[string]interface{})
	}

	user, isLoggedIn := GetCurrentUser(c)

	pageProps["isLoggedIn"] = isLoggedIn

	if isLoggedIn {
		pageProps["user"] = map[string]interface{}{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"picture": user.Picture,
		}
	} else {
		pageProps["user"] = nil
	}

	return pageProps
}
