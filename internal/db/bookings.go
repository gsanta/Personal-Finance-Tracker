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
	UserId    string
}

type NewBooking struct {
	EndDate   string
	StartDate string
	RoomId    string
	UserId    string
}

func ListBookings(db *sql.DB, fromDate *time.Time) ([]Booking, error) {
	var filterDate time.Time

	if fromDate != nil {
		filterDate = *fromDate
	} else {
		filterDate = time.Now().AddDate(0, -1, 0)
	}

	query := `SELECT id, end_date, start_date, room_id, user_id FROM bookings 
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
		if err := rows.Scan(&booking.ID, &booking.EndDate, &booking.StartDate, &booking.RoomId, &booking.UserId); err != nil {
			return nil, err
		}
		out = append(out, booking)
	}
	return out, rows.Err()
}

func InsertBooking(db *sql.DB, booking *NewBooking) error {
	query := `INSERT INTO bookings (user_id, room_id, start_date, end_date) 
			  VALUES ($1, $2, $3, $4)`

	_, err := db.Exec(query, booking.UserId, booking.RoomId, booking.StartDate, booking.EndDate)
	return err
}
