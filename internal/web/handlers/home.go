package web

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

// HomeHandlerGin handles the home page (Gin style)
func HomeHandlerGin(c *gin.Context) {
	log.Printf("[HomeHandlerGin] called: %s %s from %s", c.Request.Method, c.Request.URL.Path, c.Request.RemoteAddr)
	web.EnsureTemplates()

	// Start with handler-specific props
	pageProps := map[string]interface{}{
		// Add any home-specific fields here
	}

	// Merge in common authentication fields
	pageProps = web.MergeAuthProps(c, pageProps)

	web.RenderPage(c.Writer, c.Request, pageProps)
}

// Legacy HomeHandler for backwards compatibility
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[HomeHandler] called: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	web.EnsureTemplates()

	// TODO: Implement proper authentication check with go-pkgz/auth
	// For now, assume user is not logged in
	pageProps := map[string]interface{}{
		"isLoggedIn": false,
		"user":       nil,
	}

	web.RenderPage(w, r, pageProps)
}
