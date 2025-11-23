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

	user, isLoggedIn := web.GetCurrentUser(c)

	pageProps := map[string]interface{}{
		"isLoggedIn": isLoggedIn,
		"user": map[string]interface{}{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"picture": user.Picture,
		},
	}

	web.RenderPage(c.Writer, c.Request, pageProps)
}
