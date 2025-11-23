package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-pkgz/auth/token"
	"github.com/gsanta/Personal-Finance-Tracker/internal/auth"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	pubsubinit "github.com/gsanta/Personal-Finance-Tracker/internal/pubsub"
	"github.com/gsanta/Personal-Finance-Tracker/internal/storage"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	handlers "github.com/gsanta/Personal-Finance-Tracker/internal/web/handlers"
	api "github.com/gsanta/Personal-Finance-Tracker/internal/web/handlers/api"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("dev.env")
	if err != nil {
		log.Println("No .env file found or error loading .env")
	}
	db.Init()

	bucketName := os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		bucketName = "personal-finance-uploads"
	}

	gcsService, err := storage.NewGCSService(context.Background(), bucketName)
	if err != nil {
		log.Fatalf("Failed to create GCS service: %v", err)
	}
	defer gcsService.Close()

	// pubsub (increase timeout for emulator readiness)
	startCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	cfg := pubsubinit.LoadConfig()
	log.Printf("[pubsub-init] PROJECT_ID=%s topic=%s sub=%s emulator_host=%s", os.Getenv("PROJECT_ID"), cfg.TopicID, cfg.SubscriptionID, os.Getenv("PUBSUB_EMULATOR_HOST"))
	resources, err := pubsubinit.EnsurePubSub(startCtx, cfg)

	uploadSubscriber := pubsubinit.NewMediaUploadedSubscriber(db.DB, resources)

	if err != nil {
		log.Fatalf("pubsub init failed: %v", err)
	}
	log.Printf("[pubsub-init] client ready, starting subscriber")
	defer resources.Client.Close()
	cancelSub := uploadSubscriber.StartSubscriber(context.Background())
	defer cancelSub()

	// router (gin)
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default() // includes Logger and Recovery

	// Setup authentication
	service, auth_err := auth.Setup(r, db.DB)
	if auth_err != nil {
		log.Fatalf("Failed to setup authentication: %v", auth_err)
	}

	// setup auth routes - convert Chi handlers to Gin
	authHandler, _ := service.Auth.Handlers()

	registrationHandler := api.NewRegistrationHandler(db.DB)
	r.POST("/api/auth/register", registrationHandler.Register)
	authGroup := r.Group("/auth")
	authGroup.GET("/*path", gin.WrapH(authHandler))
	authGroup.POST("/*path", gin.WrapH(authHandler))

	// withAuth := func(handler gin.HandlerFunc) gin.HandlerFunc {
	// 	return gin.HandlerFunc(func(c *gin.Context) {
	// 		// Check for authentication cookie/token
	// 		tokenCookie, err := c.Request.Cookie("JWT")
	// 		if err != nil || tokenCookie.Value == "" {
	// 			// Not authenticated, redirect to login
	// 			c.Redirect(http.StatusFound, "/home")
	// 			return
	// 		}

	// 		// You could add additional token validation here
	// 		// For now, just check if the cookie exists

	// 		// Call the actual handler
	// 		handler(c)
	// 	})
	// }

	authMiddleware := service.Auth.Middleware()

	withAuthRedirect := func(handler gin.HandlerFunc) gin.HandlerFunc {
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
			authMiddleware.Auth(testHandler).ServeHTTP(rec, c.Request)

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

	log.Printf("Auth middleware type: %T", authMiddleware)

	// static files
	r.Static("/static", "./internal/web/static")

	// routes
	// Redirect root to /home
	r.GET("/", func(c *gin.Context) { c.Redirect(http.StatusFound, "/home") })

	r.GET("/products", gin.WrapF(handlers.ProductsHandler))
	r.GET("/summaries", gin.WrapF(web.SummariesHandler))
	r.GET("/bookings", gin.WrapF(handlers.BookingsHandler))

	//r.GET("/profile", func(c *gin.Context) {
	//	log.Printf("=== PROFILE ROUTE DEBUG ===")
	//
	//	// Check if JWT cookie exists
	//	jwtCookie, err := c.Request.Cookie("JWT")
	//	if err != nil {
	//		log.Printf("No JWT cookie found: %v", err)
	//	} else {
	//		log.Printf("JWT cookie found, length: %d", len(jwtCookie.Value))
	//		log.Printf("JWT cookie value (first 50 chars): %s", jwtCookie.Value[:min(50, len(jwtCookie.Value))])
	//	}
	//
	//	// Create a wrapper to see if auth middleware passes or fails
	//	authResult := "FAILED"
	//	protectedHandler := authMiddleware.Auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	//		authResult = "PASSED"
	//		log.Printf("=== AUTH MIDDLEWARE PASSED ===")
	//		handlers.ProfileHandler(w, r)
	//	}))
	//
	//	// Try the auth middleware
	//	protectedHandler.ServeHTTP(c.Writer, c.Request)
	//
	//	log.Printf("Auth result: %s", authResult)
	//})

	// protectedProfileHandler := authMiddleware.Auth(http.HandlerFunc(handlers.ProfileHandler))
	r.GET("/profile", withAuthRedirect(handlers.ProfileHandler))

	//r.GET("/profile", gin.WrapF(handlers.ProfileHandler))
	r.GET("/home", gin.WrapF(handlers.HomeHandler))
	r.GET("/api/products", gin.WrapF(api.ProductsHandler)) // JSON
	// 404 route (HTML/JSON)
	r.GET("/not_found", gin.WrapF(handlers.NotFoundHandler))

	mediaHandler := api.NewMediaHandler(db.DB, bucketName, gcsService)

	// param route
	r.GET("/api/media/:id", func(c *gin.Context) {
		mediaHandler.ServeGetMediaAssetByID(c.Writer, c.Request, c.Param("id"))
	})

	r.POST("/api/media/upload-url", gin.WrapF(mediaHandler.GenerateUploadURL))
	r.POST("/api/media/upload-finalize", gin.WrapF(mediaHandler.FinalizeUploadMediaAsset))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3012"
	}

	log.Printf("listening on %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
