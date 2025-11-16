package web

import (
	"log"
	"net/http"

	"github.com/gsanta/Personal-Finance-Tracker/internal/auth"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[HomeHandler] called: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	web.EnsureTemplates()

	user, err := auth.CurrentUser(r)

	if err != nil {
		// handle error (e.g., log or return HTTP 500)
		return
	}

	pageProps := map[string]interface{}{
		"isLoggedIn": auth.IsLoggedIn(r),
		"user":       user,
	}

	web.RenderPage(w, r, pageProps)
}
