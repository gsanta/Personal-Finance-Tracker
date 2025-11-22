package auth

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-pkgz/auth"
	"github.com/go-pkgz/auth/avatar"
	"github.com/go-pkgz/auth/provider"
	"github.com/go-pkgz/auth/token"
	"golang.org/x/crypto/bcrypt"
)

// Service wraps the go-pkgz/auth service
type Service struct {
	Auth *auth.Service
	DB   *sql.DB
}

// Setup initializes the go-pkgz/auth service
func Setup(r *gin.Engine, db *sql.DB) (*Service, error) {
	// JWT secret from environment or default
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-super-secret-jwt-key-change-in-production"
	}

	// Create auth options
	options := auth.Opts{
		SecretReader: token.SecretFunc(func(id string) (string, error) {
			return jwtSecret, nil
		}),
		TokenDuration:  time.Hour * 24 * 7, // 7 days
		CookieDuration: time.Hour * 24 * 7, // 7 days
		Issuer:         "personal-finance-tracker",
		URL:            os.Getenv("BASE_URL"),
		AvatarStore:    avatar.NewNoOp(),
		RedirectURL:    "/profile",
	}

	service := auth.NewService(options)

	// Create service instance
	serviceInstance := &Service{
		Auth: service,
		DB:   db,
	}

	// Add direct provider for email/password authentication
	service.AddDirectProvider("local", provider.CredCheckerFunc(func(user, password string) (ok bool, err error) {
		return serviceInstance.checkUserCredentials(user, password)
	}))

	service.AddProvider("google",
		os.Getenv("GOOGLE_CLIENT_ID"),
		os.Getenv("GOOGLE_CLIENT_SECRET"))

	return serviceInstance, nil
}

// checkUserCredentials validates user credentials against the database
func (s *Service) checkUserCredentials(email, password string) (bool, error) {
	var hashedPassword string

	log.Printf("[auth] checking credentials for user %s", email)
	log.Printf("[auth] password: %s", password)

	err := s.DB.QueryRow(`
		SELECT password 
		FROM users 
		WHERE email = $1
	`, email).Scan(&hashedPassword)

	if err != nil {
		return false, nil // User not found
	}

	// Check password using bcrypt
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil, nil
}
