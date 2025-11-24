package web

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

// ProfileHandler handles the profile page (Gin style)
func ProfileHandler(c *gin.Context) {
	log.Printf("[ProfileHandler] called: %s %s from %s", c.Request.Method, c.Request.URL.Path, c.Request.RemoteAddr)
	web.EnsureTemplates()

	pageProps := map[string]interface{}{}

	pageProps = web.MergeAuthProps(c, pageProps)

	web.RenderPage(c.Writer, c.Request, pageProps)
}
