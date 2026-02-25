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

// ListBookings returns bookings starting after fromDate (or last month by default)
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

// ListBookingsForUser returns bookings for a specific user with pagination support.
// Pagination is controlled via limit and offset. If limit <= 0, a default of 10 is used. Offset < 0 becomes 0.
func ListBookingsForUser(dbConn *sql.DB, userID string, limit, offset int) ([]Booking, error) {
	if limit <= 0 {
		limit = 10
	}
	if offset < 0 {
		offset = 0
	}

	query := `SELECT id, end_date, start_date, room_id, user_id FROM bookings
			  WHERE user_id = $1
			  ORDER BY start_date ASC
			  LIMIT $2 OFFSET $3`

	rows, err := dbConn.Query(query, userID, limit, offset)
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


// GetBookingForUser returns a booking by id for a specific user.
func GetBookingForUser(dbConn *sql.DB, bookingID string, userID string) (*Booking, error) {
	query := `SELECT id, end_date, start_date, room_id, user_id FROM bookings WHERE id = $1 AND user_id = $2`
	row := dbConn.QueryRow(query, bookingID, userID)
	var b Booking
	if err := row.Scan(&b.ID, &b.EndDate, &b.StartDate, &b.RoomId, &b.UserId); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &b, nil
}

// DeleteBooking deletes a booking by id for a specific user.
// Returns (deleted, error). If deleted is false and error is nil, nothing matched the conditions.
func DeleteBooking(dbConn *sql.DB, bookingID string, userID string) (bool, error) {
	query := `DELETE FROM bookings WHERE id = $1 AND user_id = $2`
	res, err := dbConn.Exec(query, bookingID, userID)
	if err != nil {
		return false, err
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
