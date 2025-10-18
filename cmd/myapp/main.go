package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/pubsub"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/pubsub"
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

	// pubsub
	startCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cfg := pubsubinit.LoadConfig()
	resources, err := pubsubinit.EnsurePubSub(startCtx, cfg)
	if err != nil {
		log.Fatalf("pubsub init failed: %v", err)
	}
	defer resources.Client.Close()

	go func() {
		err := resources.Subscription.Receive(context.Background(), func(ctx context.Context, m *pubsub.Message) {
			log.Printf("eventType=%s bucket=%s object=%s", m.Attributes["eventType"], m.Attributes["bucketId"], m.Attributes["objectId"])
			// process m.Data (already decoded bytes)
			m.Ack()
		})
		if err != nil {
			log.Printf("subscriber stopped: %v", err)
		}
	}()

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
	r.Get("/api/products", api.ProductsHandler) // JSON
	//r.Post("/api/do_async", web.AsyncHandler)   // JSON API
	uploadHandler := api.NewUploadHandler(db.DB, gcsService)
	r.Post("/api/media/upload-url", uploadHandler.GenerateUploadURL)

	mediaHandler := api.NewMediaHandler(db.DB, bucketName)
	r.Post("/api/media/upload-finalize", mediaHandler.Finalize)

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
