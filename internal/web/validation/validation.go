package validation

import (
	"errors"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type ErrorMsg struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}

func getErrorMsg(fe validator.FieldError) (string, string, string) {
	param := fe.Param()
	switch fe.Tag() {
	case "required":
		return "ERR_REQUIRED", "This field is required", ""
	case "lte":
		return "ERR_LTE", "Should be less than " + param, param
	case "gte":
		return "ERR_GTE", "Should be greater than " + param, param
	case "min":
		return "ERR_MIN", "Should be at least " + param, param
	case "max":
		return "ERR_MAX", "Should be at most " + param, param
	case "datetime":
		return "ERR_INVALID_DATE_FORMAT", "Invalid date format", ""
	default:
		return "ERR_UNKNOWN", "Unknown error", ""
	}
}

func BindAndValidateJSON(c *gin.Context, req any) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			// Build a map of field name -> { code, message }
			errs := make(map[string]map[string]string, len(ve))
			for _, fe := range ve {
				code, msg, _ := getErrorMsg(fe)
				field := strings.ToLower(fe.Field())
				errs[field] = map[string]string{"code": code, "message": msg}
			}
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"fields": errs, "code": "ERR_VALIDATION"})
			return false
		}
		// For non-validation errors, return a generic bad request
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return false
	}
	return true
}

// ValidatePasswordConfirmation checks if the new password matches the confirmation.
// If they don't match, it aborts the request with a standardized validation error
// payload and returns false. Returns true when they match.
func ValidatePasswordConfirmation(c *gin.Context, newPassword, confirmPassword string) bool {
	if newPassword == confirmPassword {
		return true
	}

	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
		"fields": gin.H{
			"confirmPassword": gin.H{
				"code":    "ERR_CONFIRMATION_DOES_NOT_MATCH",
				"message": "New password confirmation does not match",
			},
		},
		"code": "ERR_VALIDATION",
	})
	return false
}

// ValidatePasswordStrength ensures the password contains at least one digit and one uppercase letter.
// Aborts with a standardized validation error on failure and returns false. Returns true when valid.
func ValidatePasswordStrength(c *gin.Context, newPassword string) bool {
	// at least one digit
	hasDigit, _ := regexp.MatchString(`[0-9]`, newPassword)
	// at least one uppercase letter (A-Z)
	hasUpper, _ := regexp.MatchString(`[A-Z]`, newPassword)
	if hasDigit && hasUpper {
		return true
	}

	c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
		"fields": gin.H{
			"newPassword": gin.H{
				"code":    "ERR_PASSWORD_COMPLEXITY",
				"message": "New password must contain at least one number and one uppercase character",
			},
		},
		"code": "ERR_VALIDATION",
	})
	return false
}
