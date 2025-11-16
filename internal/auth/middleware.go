package auth

import (
	"fmt"
	"log"
	"net/http"

	ab "github.com/aarondl/authboss/v3"
	"github.com/gin-gonic/gin"
)

// GinLoadClientState loads Authboss client-state (sessions/cookies) into the request context for Gin routes.
// It does NOT enforce authentication; it simply enriches c.Request so downstream handlers can read session values.
func GinLoadClientState(aboss *ab.Authboss) gin.HandlerFunc {
	return func(c *gin.Context) {
		var enrichedReq *http.Request
		loader := aboss.LoadClientStateMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			enrichedReq = r
		}))
		loader.ServeHTTP(c.Writer, c.Request)
		if enrichedReq != nil {
			c.Request = enrichedReq
		}
		c.Next()
	}
}

// IsLoggedIn reports whether the current request has an authenticated user session.
func IsLoggedIn(r *http.Request) bool {
	if r == nil {
		return false
	}
	if pid, ok := ab.GetSession(r, ab.SessionKey); ok && len(pid) != 0 {
		return true
	}
	return false
}

// CurrentUser loads and returns the current authenticated user using Authboss.
// Returns (*User, nil) when logged in, (nil, nil) when not logged in, or (nil, err) on error.
func CurrentUser(r *http.Request) (*User, error) {
	aboss := GetAuthboss()
	u, err := aboss.CurrentUser(r)
	if err != nil {
		if err == ab.ErrUserNotFound {
			return nil, nil
		}
		return nil, err
	}
	if u == nil {
		return nil, nil
	}
	cu, ok := u.(*User)
	if !ok {
		return nil, fmt.Errorf("unexpected user type %T", u)
	}
	return cu, nil
}

// RequireAuth wraps a net/http handler and ensures the user is logged in.
func RequireAuth(aboss *ab.Authboss, next http.Handler) http.Handler {
	// First ensure client-state is loaded for this request
	withState := aboss.LoadClientStateMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check authentication
		if pid, ok := ab.GetSession(r, ab.SessionKey); !ok || len(pid) == 0 {
			// Redirect to a dedicated 404 route for protected routes
			http.Redirect(w, r, "/not_found", http.StatusFound)
			return
		}
		log.Printf("AUTHENTICATION SUCCESSFUL")
		next.ServeHTTP(w, r)
	}))

	return withState
}
