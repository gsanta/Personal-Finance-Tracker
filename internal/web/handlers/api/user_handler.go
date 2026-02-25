package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/validation"
	"golang.org/x/crypto/bcrypt"
)

type PasswordHandler struct {
	DB *sql.DB
}

func NewUserdHandler(db *sql.DB) *PasswordHandler {
	return &PasswordHandler{
		DB: db,
	}
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

func (h *PasswordHandler) UpdatePassword(c *gin.Context) {
	user, ok := web.GetCurrentUser(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req UpdatePasswordRequest
	if ok := validation.BindAndValidateJSON(c, &req); !ok {
		return
	}

	// Validate password confirmation via shared validator
	if ok := validation.ValidatePasswordConfirmation(c, req.NewPassword, req.ConfirmPassword); !ok {
		return
	}
	// Validate password strength (at least one number and one uppercase)
	if ok := validation.ValidatePasswordStrength(c, req.NewPassword); !ok {
		return
	}

	// Get current password hash from database
	var currentHashedPassword string
	err := h.DB.QueryRow(`SELECT password FROM users WHERE id = $1`, user.ID).Scan(&currentHashedPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": gin.H{"server": []string{"Internal server error"}},
			"status": "failure",
		})
		return
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(currentHashedPassword), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"fields": gin.H{
				"currentPassword": gin.H{
					"code":    "ERR_PASSWORD_INCORRECT",
					"message": "Current password is incorrect.",
				},
			},
			"code": "ERR_VALIDATION",
		})
		return
	}

	// Hash new password
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": gin.H{"server": []string{"Internal server error"}},
			"status": "failure",
		})
		return
	}

	// Update password in database
	_, err = h.DB.Exec(`UPDATE users SET password = $1 WHERE id = $2`, string(newHashedPassword), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": gin.H{"server": []string{"Failed to update password"}},
			"status": "failure",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password successfully updated",
		"status":  "success",
	})
}
