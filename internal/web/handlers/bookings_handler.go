package web

import (
	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func BookingsHandler(c *gin.Context) {
	web.EnsureTemplates()

	pageProps := map[string]interface{}{}

	pageProps = web.MergeAuthProps(c, pageProps)

	web.RenderPage(c.Writer, c.Request, pageProps)
}
