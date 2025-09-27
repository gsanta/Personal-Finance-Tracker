package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	handlers "github.com/gsanta/Personal-Finance-Tracker/internal/web/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or error loading .env")
	}
	db.Init()

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
	r.Get("/api/status", web.StatusHandler)   // JSON
	r.Post("/api/do_async", web.AsyncHandler) // JSON API

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
