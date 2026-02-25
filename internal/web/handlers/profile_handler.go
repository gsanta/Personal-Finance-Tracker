package web

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"
)

// ProfileHandler handles the profile page (Gin style)
func ProfileHandler(c *gin.Context) {
	log.Printf("[ProfileHandler] called: %s %s from %s", c.Request.Method, c.Request.URL.Path, c.Request.RemoteAddr)
	web.EnsureTemplates()

	user, _ := web.GetCurrentUser(c)

	rooms, err := db.ListRooms(db.DB)

	bookings, err := db.ListBookingsForUser(db.DB, user.ID, 10, 0)

	if err != nil {
		web.WriteJSON(c.Writer, http.StatusInternalServerError, map[string]string{"error": "Failed to load bookings."})
		return
	}

	presented := presenters.PresentBookings(bookings, user.ID)

	// Append Cancelable: true if StartDate is later than 2 days from now
	nowPlus48h := time.Now().Add(48 * time.Hour)
	for i := range presented {
		if start, err := time.Parse(time.RFC3339, presented[i].StartDate); err == nil {
			if start.After(nowPlus48h) {
				presented[i].Cancelable = true
			}
		}
	}

	pageProps := map[string]interface{}{
		"bookings": presented,
		"rooms":    rooms,
	}

	web.PutCurrentUserOnPagePropsAndReturnUser(c, pageProps)

	web.RenderPage(c.Writer, c.Request, pageProps)
}
