package web

import (
	"log"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"github.com/go-pkgz/auth/middleware"
	"github.com/go-pkgz/auth/token"
)

type RouteAuthInfo struct {
	AuthMiddleWare *middleware.Authenticator
}

func (info *RouteAuthInfo) Public(handler gin.HandlerFunc) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Create a response recorder to capture what auth middleware does
		rec := httptest.NewRecorder()

		// Flag to track if auth passed and store user info
		authPassed := false
		var authenticatedUser token.User

		// Create test handler that will be called if auth succeeds
		testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authPassed = true
			log.Printf("[withUserInfo] Auth middleware passed")

			// Use go-pkgz/auth's built-in function to get user info
			if user, err := token.GetUserInfo(r); err == nil {
				authenticatedUser = user
				log.Printf("[withUserInfo] User extracted: %s (%s)", user.Name, user.Email)
			} else {
				log.Printf("[withUserInfo] Failed to get user info: %v", err)
			}
		})

		// Test the auth middleware (this processes JWT tokens and sets up context)
		info.AuthMiddleWare.Auth(testHandler).ServeHTTP(rec, c.Request)

		// If auth passed, set user in Gin context
		if authPassed {
			log.Printf("[withUserInfo] Setting user in Gin context: %s", authenticatedUser.Name)
			c.Set("user", authenticatedUser)
		} else {
			log.Printf("[withUserInfo] No authenticated user found")
		}

		// Always call the handler, whether user is authenticated or not
		handler(c)
	})
}

func (info *RouteAuthInfo) Protected(handler gin.HandlerFunc) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Create a response recorder to capture what auth middleware does
		rec := httptest.NewRecorder()

		// Flag to track if auth passed and store user info
		authPassed := false
		var authenticatedUser token.User // Use the proper token.User type

		// Create test handler that will be called if auth succeeds
		testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authPassed = true

			// Use go-pkgz/auth's built-in function to get user info
			if user, err := token.GetUserInfo(r); err == nil {
				authenticatedUser = user
			}
		})

		// Test the auth middleware
		info.AuthMiddleWare.Auth(testHandler).ServeHTTP(rec, c.Request)

		// If auth passed, set user in Gin context and call handler
		if authPassed {
			// Set the user in Gin's context for the handler to use
			c.Set("user", authenticatedUser)
			handler(c)
			return
		}

		// If auth failed, redirect to home instead of showing "unauthorized"
		c.Redirect(http.StatusFound, "/home")
	})
}
