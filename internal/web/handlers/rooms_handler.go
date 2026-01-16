package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"
)

func RoomsHandler(c *gin.Context) {
	web.EnsureTemplates()

	rooms, err := db.ListRooms(db.DB)

	if err != nil {
		web.WriteJSON(c.Writer, http.StatusInternalServerError, map[string]string{"error": "failed to load rooms"})
		return
	}

	pageProps := map[string]interface{}{}

	user := web.PutCurrentUserOnPagePropsAndReturnUser(c, pageProps)

	bookings, err := db.ListBookings(db.DB, nil)

	if err != nil {
		web.WriteJSON(c.Writer, http.StatusInternalServerError, map[string]string{"error": "failed to load bookings"})
		return
	}

	presented := presenters.PresentBookings(bookings, user.ID)

	pageProps["bookings"] = presented
	pageProps["rooms"] = rooms

	web.RenderPage(c.Writer, c.Request, pageProps)
}
