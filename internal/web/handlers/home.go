package web

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func HomeHandler(c *gin.Context) {
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
