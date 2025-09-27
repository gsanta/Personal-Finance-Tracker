package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
)

func main() {
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
	r.Get("/payments", web.PaymentsHandler)
	r.Get("/summaries", web.SummariesHandler)
	r.Get("/api/status", web.StatusHandler)   // JSON
	r.Post("/api/do_async", web.AsyncHandler) // JSON API

	addr := ":" + getEnv("PORT", "8080")
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}

func getEnv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
