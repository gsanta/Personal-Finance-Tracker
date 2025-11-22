package web

import (
	"log"
	"net/http"

	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[ProfileHandler] called: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	web.EnsureTemplates()

	// TODO: Implement proper authentication check with go-pkgz/auth
	// For now, assume user is not logged in
	pageProps := map[string]interface{}{
		"isLoggedIn": false,
		"user":       nil,
	}

	web.RenderPage(w, r, pageProps)
}
