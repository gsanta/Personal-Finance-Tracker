package api

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

type BookingsHandler struct {
	DB *sql.DB
}

type BookingRequest struct {
	StartDate     string   `json:"startDate"`
	EndDate       string   `json:"endDate"`
	RoomId        string   `json:"roomId"`
	FoodFromOwner bool     `json:"foodFromOwner"`
	Notes         string   `json:"notes"`
	Cats          []string `json:"cats"`
}

func NewBookingsHandler(db *sql.DB) *BookingsHandler {
	return &BookingsHandler{DB: db}
}

func (h *BookingsHandler) CreateBooking(c *gin.Context) {
	var req BookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
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
