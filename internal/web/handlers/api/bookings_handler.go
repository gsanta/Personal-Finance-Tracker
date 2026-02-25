package api

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/validation"
)

type BookingsHandler struct {
	DB *sql.DB
}

type BookingRequest struct {
	StartDate     string `json:"startDate" binding:"required,datetime=2006-01-02T15:04:05Z07:00"`
	EndDate       string `json:"endDate" binding:"required,datetime=2006-01-02T15:04:05Z07:00"`
	RoomId        string `json:"roomId" binding:"required"`
	FoodFromOwner bool   `json:"foodFromOwner"`
	Notes         string `json:"notes" binding:"max=500"`
	// Require at least one cat in the array, limit array to 10, and validate each name length 1..50
	Cats []string `json:"cats" binding:"min=1,max=10,dive,required,min=1,max=50"`
}

func NewBookingsHandler(db *sql.DB) *BookingsHandler {
	return &BookingsHandler{DB: db}
}

func (h *BookingsHandler) CreateBooking(c *gin.Context) {
	var req BookingRequest
	if ok := validation.BindAndValidateJSON(c, &req); !ok {
		return
	}

	// Parse the dates if needed
	startDate, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
		return
	}

	// Logical validation: end must be after start
	if !endDate.After(startDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "endDate must be after startDate"})
		return
	}

	user, _ := web.GetCurrentUser(c)

	booking := &db.NewBooking{
		EndDate:       endDate.Format(time.RFC3339),
		StartDate:     startDate.Format(time.RFC3339),
		RoomId:        req.RoomId,
		UserId:        user.ID,
		FoodFromOwner: req.FoodFromOwner,
		Notes:         req.Notes,
	}

	log.Printf("user: %v", user)

	bookingID, insertErr := db.InsertBooking(h.DB, booking)
	if insertErr != nil {
		log.Printf("Failed to insert booking: %v", insertErr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to book date"})
		return
	}

	// Insert cat names if provided
	if len(req.Cats) > 0 {
		catErr := db.InsertBookingCats(h.DB, bookingID, req.Cats)
		if catErr != nil {
			log.Printf("Failed to insert booking cats: %v", catErr)
			// Note: booking is already created, but cats failed
			c.JSON(http.StatusPartialContent, gin.H{"warning": "Booking created but failed to add cats"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "bookingId": bookingID})
}

// DeleteBooking deletes a booking owned by the current user if it's still cancelable (start date > 48h).
func (h *BookingsHandler) DeleteBooking(c *gin.Context) {
	user, ok := web.GetCurrentUser(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	bookingID := c.Param("id")
	if bookingID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing booking id"})
		return
	}

	// Fetch booking to verify ownership and cancelability window
	booking, err := db.GetBookingForUser(h.DB, bookingID, user.ID)
	if err != nil {
		log.Printf("failed to load booking for delete: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete booking"})
		return
	}
	if booking == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or not cancelable"})
		return
	}

	// Check cancelability: start date must be > 48 hours from now
	start, parseErr := time.Parse(time.RFC3339, booking.StartDate)
	if parseErr != nil {
		// Treat unparsable date as not cancelable to preserve behavior
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or not cancelable"})
		return
	}
	if !start.After(time.Now().Add(48 * time.Hour)) {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or not cancelable"})
		return
	}

	// Proceed to delete
	deleted, delErr := db.DeleteBooking(h.DB, bookingID, user.ID)
	if delErr != nil {
		log.Printf("failed to delete booking: %v", delErr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete booking"})
		return
	}
	if !deleted {
		// Rare race: booking disappeared between check and delete
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found or not cancelable"})
		return
	}

	c.Status(http.StatusNoContent)
}

// ListMyBookings returns the current user's bookings with pagination.
func (h *BookingsHandler) ListMyBookings(c *gin.Context) {
	user, ok := web.GetCurrentUser(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Parse query params
	limit := 10
	if l := c.Query("limit"); l != "" {
		if v, err := strconv.Atoi(l); err == nil && v > 0 {
			limit = v
		}
	}
	offset := 0
	if o := c.Query("offset"); o != "" {
		if v, err := strconv.Atoi(o); err == nil && v >= 0 {
			offset = v
		}
	}

	bookings, err := db.ListBookingsForUser(h.DB, user.ID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load bookings"})
		return
	}

	presented := presenters.PresentBookings(bookings, user.ID)
	c.JSON(http.StatusOK, gin.H{
		"items":  presented,
		"limit":  limit,
		"offset": offset,
	})
}
