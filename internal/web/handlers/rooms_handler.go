package web

import (
	"net/http"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func RoomsHandler(w http.ResponseWriter, r *http.Request) {
	web.EnsureTemplates()

	rooms, err := db.ListRooms(db.DB)

	if err != nil {
		web.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load rooms"})
		return
	}

	bookings, err := db.ListBookings(db.DB, nil)

	if err != nil {
		web.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load bookings"})
		return
	}

	pageProps := map[string]interface{}{
		"bookings": bookings,
		"rooms":    rooms,
	}

	web.RenderPage(w, r, pageProps)
}
