package tests

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var TestDB *sql.DB

func LoadTestEnv() {
	cwd, _ := os.Getwd()
	paths := []string{
		filepath.Join(cwd, "test.env"),             // running from repo root
		filepath.Join(cwd, "..", "..", "test.env"), // running from subpackage
		"test.env",
	}
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			if err := godotenv.Overload(p); err != nil {
				log.Printf("[test-setup] found but couldn't load %s: %v", p, err)
			}
			log.Printf("[test-setup] loaded env from %s", p)
			return
		}
	}
	log.Printf("[test-setup] no test.env found; relying on existing environment")
}

func ConnectTestDB() *sql.DB {
	conn := os.Getenv("DATABASE_URL")
	if conn == "" {
		log.Fatalf("DATABASE_URL must be set for tests (e.g. in test.env)")
	}
	db, err := sql.Open("postgres", conn)
	if err != nil {
		log.Fatalf("failed to open test db: %v", err)
	}
	db.SetMaxOpenConns(5)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping test db: %v", err)
	}
	return db
}

// applyMigrations runs the SQL files in db/migrations in lexicographic order.
func ApplyMigrations(db *sql.DB) {
	migDir := filepath.Join("db", "migrations")
	entries, err := os.ReadDir(migDir)
	if err != nil {
		log.Fatalf("failed to read migrations dir: %v", err)
	}
	var files []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if !strings.HasSuffix(name, ".up.sql") {
			continue
		}
		files = append(files, name)
	}
	sort.Strings(files)
	for _, name := range files {
		path := filepath.Join(migDir, name)
		content, err := os.ReadFile(path)
		if err != nil {
			log.Fatalf("read migration %s: %v", path, err)
		}
		if _, err := db.Exec(string(content)); err != nil {
			log.Fatalf("exec migration %s: %v", path, err)
		}
		log.Printf("[test-setup] applied %s", name)
	}
}

// Seed inserts baseline test data.
func Seed(db *sql.DB) error {
	// simple cleanup to avoid duplication
	_, _ = db.Exec("DELETE FROM media_assets")
	_, _ = db.Exec("DELETE FROM products")
	// seed products
	_, err := db.Exec(`INSERT INTO products (name, price, quantity) VALUES 
		('Sample Product A', 12.34, 5),
		('Sample Product B', 45.67, 3)`)
	if err != nil {
		return err
	}
	return nil
}
