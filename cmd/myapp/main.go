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

	// auth (optional)
	aboss, err := auth.Setup(r, db.DB)
	if err != nil {
		log.Fatalf("auth setup failed: %v", err)
	}
	// If auth is enabled, load client-state for all routes so handlers can read session
	if aboss != nil {
		r.Use(auth.GinLoadClientState(aboss))
	}

	// static files
	r.Static("/static", "./internal/web/static")

	// routes
	r.GET("/products", gin.WrapF(handlers.ProductsHandler))
	r.GET("/summaries", gin.WrapF(web.SummariesHandler))
	r.GET("/bookings", gin.WrapF(handlers.BookingsHandler))
	r.GET("/profile", gin.WrapH(auth.RequireAuth(aboss, http.HandlerFunc(handlers.ProfileHandler))))
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
