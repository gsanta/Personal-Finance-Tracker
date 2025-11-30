package web

import (
	"net/http"

	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func BookingsHandler(w http.ResponseWriter, r *http.Request) {
	web.EnsureTemplates()
	
	pageProps := map[string]interface{}{}

	web.RenderPage(w, r, pageProps)
}
