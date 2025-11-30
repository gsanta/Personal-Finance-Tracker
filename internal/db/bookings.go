package db

import (
	"database/sql"
	"time"
)

type Booking struct {
	EndDate   string
	ID        string
	StartDate string
	RoomId    string
}

func ListBookings(db *sql.DB, fromDate *time.Time) ([]Booking, error) {
	var filterDate time.Time

	if fromDate != nil {
		filterDate = *fromDate
	} else {
		filterDate = time.Now().AddDate(0, -1, 0)
	}

	query := `SELECT id, end_date, start_date, room_id FROM bookings 
			  WHERE start_date > $1 
			  ORDER BY start_date ASC`

	rows, err := db.Query(query, filterDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Booking
	for rows.Next() {
		var booking Booking
		if err := rows.Scan(&booking.ID, &booking.EndDate, &booking.StartDate, &booking.RoomId); err != nil {
			return nil, err
		}
		out = append(out, booking)
	}
	return out, rows.Err()
}
