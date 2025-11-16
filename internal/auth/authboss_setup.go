package auth

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	clientstate "github.com/aarondl/authboss-clientstate"
	ab "github.com/aarondl/authboss/v3"
	_ "github.com/aarondl/authboss/v3/auth"
	"github.com/aarondl/authboss/v3/defaults"
	_ "github.com/aarondl/authboss/v3/logout"
	_ "github.com/aarondl/authboss/v3/register"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// abossInstance holds the initialized Authboss instance when auth is enabled.
var abossInstance *ab.Authboss

// GetAuthboss returns the initialized Authboss instance, or nil if auth is disabled.
func GetAuthboss() *ab.Authboss { return abossInstance }

// User represents an authboss user backed by the users table.
// PID for our setup is the email.
// Only minimal fields required for auth/register are implemented.
type User struct {
	ID       string
	Email    string
	Password string
}

// Implement authboss.User interface
func (u *User) GetPID() string              { return u.Email }
func (u *User) PutPID(pid string)           { u.Email = pid }
func (u *User) GetPassword() string         { return u.Password }
func (u *User) PutPassword(pw string)       { u.Password = pw }
func (u *User) GetEmail() string            { return u.Email }
func (u *User) PutEmail(email string)       { u.Email = email }
func (u *User) GetRecoverSelector() string  { return "" }
func (u *User) PutRecoverSelector(string)   {}
func (u *User) GetRecoverVerifier() string  { return "" }
func (u *User) PutRecoverVerifier(string)   {}
func (u *User) GetRecoverExpiry() time.Time { return time.Time{} }
func (u *User) PutRecoverExpiry(time.Time)  {}
func (u *User) GetConfirmSelector() string  { return "" }
func (u *User) PutConfirmSelector(string)   {}
func (u *User) GetConfirmVerifier() string  { return "" }
func (u *User) PutConfirmVerifier(string)   {}
func (u *User) GetLocked() time.Time        { return time.Time{} }
func (u *User) PutLocked(time.Time)         {}
func (u *User) GetAttemptCount() int        { return 0 }
func (u *User) PutAttemptCount(int)         {}
func (u *User) GetLastAttempt() time.Time   { return time.Time{} }
func (u *User) PutLastAttempt(time.Time)    {}
func (u *User) GetOAuth2UID() string        { return "" }
func (u *User) PutOAuth2UID(string)         {}
func (u *User) GetOAuth2Provider() string   { return "" }
func (u *User) PutOAuth2Provider(string)    {}
func (u *User) GetOAuth2Token() string      { return "" }
func (u *User) PutOAuth2Token(string)       {}
func (u *User) GetOAuth2Refresh() string    { return "" }
func (u *User) PutOAuth2Refresh(string)     {}
func (u *User) GetOAuth2Expiry() time.Time  { return time.Time{} }
func (u *User) PutOAuth2Expiry(time.Time)   {}

// Storer implements Authboss server storage against Postgres users table.
type Storer struct {
	DB *sql.DB
}

var _ ab.CreatingServerStorer = (*Storer)(nil)

func (s *Storer) New(ctx context.Context) ab.User {
	return &User{}
}

func (s *Storer) Create(ctx context.Context, u ab.User) error {
	user := u.(*User)
	if user.ID == "" {
		user.ID = uuid.New().String()
	}
	_, err := s.DB.ExecContext(ctx,
		"INSERT INTO users (id, email, password) VALUES ($1, $2, $3)",
		user.ID, user.Email, user.Password,
	)
	return err
}

func (s *Storer) Load(ctx context.Context, key string) (ab.User, error) {
	row := s.DB.QueryRowContext(ctx, "SELECT id, email, password FROM users WHERE email = $1", key)
	u := &User{}
	if err := row.Scan(&u.ID, &u.Email, &u.Password); err != nil {
		if err == sql.ErrNoRows {
			return nil, ab.ErrUserNotFound
		}
		return nil, err
	}
	return u, nil
}

func (s *Storer) Save(ctx context.Context, u ab.User) error {
	user := u.(*User)
	_, err := s.DB.ExecContext(ctx, "UPDATE users SET email = $1, password = $2, updated_at = NOW() WHERE id = $3", user.Email, user.Password, user.ID)
	return err
}

// Setup initializes Authboss and mounts routes to Gin under /auth if enabled by env AUTH_ENABLE=true.
func Setup(r *gin.Engine, db *sql.DB) (*ab.Authboss, error) {
	if os.Getenv("AUTH_ENABLE") != "true" {
		return nil, nil
	}

	aboss := ab.New()
	aboss.Config.Paths.Mount = "/auth"
	aboss.Config.Paths.RootURL = os.Getenv("ROOT_URL")
	abossInstance = aboss
	// Provide a basic JSON view renderer before setting core defaults.
	aboss.Config.Core.ViewRenderer = defaults.JSONRenderer{}
	// Initialize core defaults (Router, ErrorHandler, Responder, Redirector, BodyReader, etc.)
	// so modules can register routes safely before Init().
	// Enable JSON body parsing so application/json works for /auth endpoints.
	defaults.SetCore(&aboss.Config, true, false)

	// instead of 307 redirect, return 200
	redir, ok := aboss.Config.Core.Redirector.(*defaults.Redirector)
	if ok {
		redir.CorceRedirectTo200 = true // (note the typo in the field name in Authboss)
	}

	// Client state (sessions + cookies) using secure keys
	// Session keys (gorilla/sessions): prefer dedicated hash/block if provided, fallback to SESSION_STORE_KEY.
	sessionHashKey := []byte(os.Getenv("SESSION_HASH_KEY"))
	sessionBlockKey := []byte(os.Getenv("SESSION_BLOCK_KEY"))

	// Preferred separate keys for cookie auth (hash) and encryption (block)
	cookieHashKey := []byte(os.Getenv("COOKIE_HASH_KEY"))
	cookieBlockKey := []byte(os.Getenv("COOKIE_BLOCK_KEY"))

	log.Printf("cookie hash key: %s", cookieHashKey)
	log.Printf("cookie block key: %s", cookieBlockKey)

	// Configure session storer with key pairs (hash + optional block) so securecookie is satisfied.
	sessStore := clientstate.NewSessionStorer("ab_session", sessionHashKey, sessionBlockKey)
	// Configure cookie storer for additional cookies; provide hash key (and optional block).
	cookStore := clientstate.NewCookieStorer(cookieHashKey, cookieBlockKey)
	aboss.Config.Storage.SessionState = sessStore
	aboss.Config.Storage.CookieState = cookStore

	// Server storage
	aboss.Config.Storage.Server = &Storer{DB: db}

	// Modules are enabled by importing them for side-effects above (auth/register/logout).
	// For basic email+password, defaults are sufficient. BCrypt cost can be adjusted via Config.Modules.BCryptCost.

	// Use default in-memory view renderer returning 404 for HTML pages; for API-first we rely on JSON redirects/responses.
	// If you want HTML forms, add template files and a renderer and set aboss.Config.Core.ViewRenderer.

	if err := aboss.Init(); err != nil {
		return nil, err
	}

	// Mount the internal mux under /auth with JSON normalization and client-state middleware
	group := r.Group("/auth")
	handler := http.StripPrefix("/auth", aboss.LoadClientStateMiddleware(aboss.Config.Core.Router))
	group.Any("/*any", gin.WrapH(handler))

	log.Printf("[authboss] mounted under /auth (register/login/logout)")
	return aboss, nil
}
