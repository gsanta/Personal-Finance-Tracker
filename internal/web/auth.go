package web

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"github.com/go-pkgz/auth/middleware"
	"github.com/go-pkgz/auth/token"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
)

type RouteAuthInfo struct {
	AuthMiddleWare *middleware.Authenticator
	DB             *sql.DB
}

func (info *RouteAuthInfo) createAuthHandler(authPassed *bool, authenticatedUser *db.User) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		*authPassed = true
		log.Printf("[createAuthHandler] Auth middleware passed")

		// Use go-pkgz/auth's built-in function to get user info
		if user, err := token.GetUserInfo(r); err == nil {
			log.Printf("[createAuthHandler] Token user: %s (%s)", user.Name, user.Email)

			dbUser, err := db.GetUserByEmail(info.DB, user.Name)
			if err == nil {
				*authenticatedUser = db.User{
					Email: user.Name,
					ID:    dbUser.ID,
				}
				log.Printf("[createAuthHandler] Database user found: ID=%s, Email=%s", dbUser.ID, dbUser.Email)
			} else {
				log.Printf("[createAuthHandler] Database lookup failed: %v", err)
			}
		} else {
			log.Printf("[createAuthHandler] Failed to get user info: %v", err)
		}
	})
}

func (info *RouteAuthInfo) Public(handler gin.HandlerFunc) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		rec := httptest.NewRecorder()

		authPassed := false
		var authenticatedUser db.User

		authSuccessHandler := info.createAuthHandler(&authPassed, &authenticatedUser)

		info.AuthMiddleWare.Auth(authSuccessHandler).ServeHTTP(rec, c.Request)

		if authPassed {
			log.Printf("[withUserInfo] Setting user in Gin context: %s", authenticatedUser.Email)
			c.Set("user", authenticatedUser)
		} else {
			log.Printf("[withUserInfo] No authenticated user found")
		}

		handler(c)
	})
}

func (info *RouteAuthInfo) Protected(handler gin.HandlerFunc) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		rec := httptest.NewRecorder()

		authPassed := false
		var authenticatedUser db.User

		authSuccessHandler := info.createAuthHandler(&authPassed, &authenticatedUser)

		info.AuthMiddleWare.Auth(authSuccessHandler).ServeHTTP(rec, c.Request)

		if authPassed {
			c.Set("user", authenticatedUser)
			handler(c)
			return
		}

		c.Redirect(http.StatusFound, "/home")
	})
}
