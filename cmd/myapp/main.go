package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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

	// routes

	r := chi.NewRouter()

	// middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// static files
	fs := http.FileServer(http.Dir("./internal/web/static"))
	r.Handle("/static/*", http.StripPrefix("/static/", fs))

	// routes
	r.Get("/products", handlers.ProductsHandler)
	r.Get("/summaries", web.SummariesHandler)
	r.Get("/bookings", handlers.BookingsHandler)
	r.Get("/api/products", api.ProductsHandler) // JSON

	mediaHandler := api.NewMediaHandler(db.DB, bucketName, gcsService)

	r.Get("/api/media/{id}", mediaHandler.GetMediaAsset)

	r.Post("/api/media/upload-url", mediaHandler.GenerateUploadURL)

	r.Post("/api/media/upload-finalize", mediaHandler.FinalizeUploadMediaAsset)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3012"
	}

	log.Printf("listening on %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
