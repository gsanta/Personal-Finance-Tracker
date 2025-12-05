package web

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func RoomsHandler(c *gin.Context) {
	web.EnsureTemplates()

	rooms, err := db.ListRooms(db.DB)

	if err != nil {
		web.WriteJSON(c.Writer, http.StatusInternalServerError, map[string]string{"error": "failed to load rooms"})
		return
	}

	bookings, err := db.ListBookings(db.DB, nil)

	if err != nil {
		web.WriteJSON(c.Writer, http.StatusInternalServerError, map[string]string{"error": "failed to load bookings"})
		return
	}

	pageProps := map[string]interface{}{
		"bookings": bookings,
		"rooms":    rooms,
	}

	pageProps = web.MergeAuthProps(c, pageProps)

	web.RenderPage(c.Writer, c.Request, pageProps)
}
