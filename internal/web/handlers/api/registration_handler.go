package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	dbpkg "github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"golang.org/x/crypto/bcrypt"
)

type RegistrationHandler struct {
	DB *sql.DB
}

func NewRegistrationHandler(db *sql.DB) *RegistrationHandler {
	return &RegistrationHandler{DB: db}
}

func (h *RegistrationHandler) Register(c *gin.Context) {
	var req struct {
		Email           string `json:"email" binding:"required,email"`
		Password        string `json:"password" binding:"required"`
		ConfirmPassword string `json:"confirm_password" binding:"required"`
	}

	// Gin's built-in JSON binding with validation
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": gin.H{"request": []string{"Invalid JSON format or missing required fields"}},
			"status": "failure",
		})
		return
	}

	// Validate password confirmation
	if req.Password != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors":   gin.H{"password_confirm": []string{"Does not match password"}},
			"status":   "failure",
			"preserve": gin.H{"email": req.Email},
		})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": gin.H{"server": []string{"Internal server error"}},
			"status": "failure",
		})
		return
	}

	asset := &dbpkg.User{
		Email:    req.Email,
		Password: string(hash),
	}

	if err := dbpkg.InsertUser(h.DB, asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": gin.H{"email": []string{"Email already registered"}},
			"status": "failure",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account successfully created",
		"status":  "success",
	})
}
