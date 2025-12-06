package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
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

	authMiddleware := service.Auth.Middleware()

	routeAuthInfo := web.RouteAuthInfo{AuthMiddleWare: &authMiddleware, DB: db.DB}

	log.Printf("Auth middleware type: %T", authMiddleware)

	// static files
	r.Static("/static", "./internal/web/static")

	// routes
	// Redirect root to /home
	r.GET("/", func(c *gin.Context) { c.Redirect(http.StatusFound, "/home") })

	r.GET("/products", routeAuthInfo.Public(handlers.ProductsHandlerGin))
	r.GET("/summaries", routeAuthInfo.Public(gin.WrapF(web.SummariesHandler)))
	r.GET("/bookings", routeAuthInfo.Public(handlers.BookingsHandler))
	r.GET("/rooms", routeAuthInfo.Public(handlers.RoomsHandler))

	r.GET("/profile", routeAuthInfo.Protected(handlers.ProfileHandler))

	r.GET("/home", routeAuthInfo.Public(handlers.HomeHandler))
	r.GET("/api/products", gin.WrapF(api.ProductsHandler)) // JSON
	// 404 route (HTML/JSON)
	r.GET("/not_found", gin.WrapF(handlers.NotFoundHandler))

	mediaHandler := api.NewMediaHandler(db.DB, bucketName, gcsService)
	bookingsHandler := api.NewBookingsHandler(db.DB)

	// param route
	r.GET("/api/media/:id", func(c *gin.Context) {
		mediaHandler.ServeGetMediaAssetByID(c.Writer, c.Request, c.Param("id"))
	})

	r.POST("/api/media/upload-url", gin.WrapF(mediaHandler.GenerateUploadURL))
	r.POST("/api/media/upload-finalize", gin.WrapF(mediaHandler.FinalizeUploadMediaAsset))
	r.POST("/api/bookings", routeAuthInfo.Protected(bookingsHandler.CreateBooking))

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
