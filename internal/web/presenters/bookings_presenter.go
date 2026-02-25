package presenters

import "github.com/gsanta/Personal-Finance-Tracker/internal/db"

// BookingPresenter represents a Booking for the UI/API layer
// It mirrors the fields exposed so far and adds IsCurrentUser to indicate
// whether the booking belongs to the currently logged-in user.
type BookingPresenter struct {
	ID            string `json:"id"`
	EndDate       string `json:"endDate"`
	StartDate     string `json:"startDate"`
	RoomId        string `json:"roomId"`
	UserId        string `json:"userId"`
	IsCurrentUser bool   `json:"isCurrentUser"`
	Cancelable    bool   `json:"cancelable"`
}

// NewBookingPresenter converts a db.Booking to a BookingPresenter and
// sets IsCurrentUser flag. If the booking is not made by the current user,
// the UserId will be redacted (empty string), matching previous behavior.
func NewBookingPresenter(b db.Booking, currentUserID string) BookingPresenter {
	isCurrent := b.UserId == currentUserID
	userID := b.UserId
	if !isCurrent {
		userID = ""
	}
	return BookingPresenter{
		ID:            b.ID,
		EndDate:       b.EndDate,
		IsCurrentUser: isCurrent,
		StartDate:     b.StartDate,
		RoomId:        b.RoomId,
		UserId:        userID,
		Cancelable:    false,
	}
}

// PresentBookings converts a slice of db.Booking into presenters.
func PresentBookings(bookings []db.Booking, currentUserID string) []BookingPresenter {
	out := make([]BookingPresenter, 0, len(bookings))
	for _, b := range bookings {
		out = append(out, NewBookingPresenter(b, currentUserID))
	}
	return out
}
