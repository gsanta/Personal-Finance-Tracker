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
	EndDate       string
	StartDate     string
	RoomId        string
	UserId        string
	FoodFromOwner bool
	Notes         string
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

func InsertBooking(db *sql.DB, booking *NewBooking) (string, error) {
	query := `INSERT INTO bookings (user_id, room_id, start_date, end_date, food_from_owner, notes) 
			  VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`

	var bookingID string
	err := db.QueryRow(query, booking.UserId, booking.RoomId, booking.StartDate, booking.EndDate, booking.FoodFromOwner, booking.Notes).Scan(&bookingID)
	return bookingID, err
}

func InsertBookingCats(db *sql.DB, bookingID string, catNames []string) error {
	if len(catNames) == 0 {
		return nil
	}

	query := `INSERT INTO booking_cats (booking_id, guest_cat_name) VALUES ($1, $2)`

	for _, catName := range catNames {
		if catName != "" {
			_, err := db.Exec(query, bookingID, catName)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
