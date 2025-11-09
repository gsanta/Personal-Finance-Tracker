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

// Seed fixtures exposed for easy reuse in tests.
// These reflect the rows inserted by Seed().
// Use helpers like FirstProduct() or FirstMediaAsset() in tests.

type SeedProduct struct {
	ID       string
	Name     string
	Price    float64
	Quantity int
}

type SeedMediaAsset struct {
	ID               string
	ObjectKey        string
	OriginalFilename string
	ContentType      string
	SizeBytes        int64
	ProductID        string
	UploadStatus     string
}

var SeedProducts = []SeedProduct{
	{ID: "d4665bf0-cc0f-4488-99ae-82e32177a3bf", Name: "Sample Product A", Price: 12.34, Quantity: 5},
	{ID: "00772abc-ee2a-497c-b1a6-64a7f02f927c", Name: "Sample Product B", Price: 45.67, Quantity: 3},
}

var SeedMediaAssets = []SeedMediaAsset{
	{
		ID:               "b817883b-0ca1-40ba-898c-cf94065c1187",
		ObjectKey:        "uploads/1762722812/75014105-27ee-4eaf-8060-3315af8b64c2.jpg",
		OriginalFilename: "image.jpg",
		ContentType:      "image/jpeg",
		SizeBytes:        1024,
		ProductID:        "d4665bf0-cc0f-4488-99ae-82e32177a3bf",
		UploadStatus:     "completed",
	},
	{
		ID:               "b817883b-0ca1-40ba-898c-cf94065c1187",
		ObjectKey:        "uploads/1762722812/75014105-27ee-4eaf-8060-3315af8b64c2.jpg",
		OriginalFilename: "image.jpg",
		ContentType:      "image/jpeg",
		SizeBytes:        1024,
		ProductID:        "d4665bf0-cc0f-4488-99ae-82e32177a3bf",
		UploadStatus:     "completed",
	},
}

func FirstProduct() SeedProduct       { return SeedProducts[0] }
func SecondProduct() SeedProduct      { return SeedProducts[1] }
func FirstMediaAsset() SeedMediaAsset { return SeedMediaAssets[0] }

// FindProjectRoot walks up from the current directory until it finds go.mod (project root marker).
func FindProjectRoot() string {
	startDir, _ := os.Getwd()
	dir := startDir
	for {
		candidate := filepath.Join(dir, "go.mod")
		if st, err := os.Stat(candidate); err == nil && !st.IsDir() {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir { // reached filesystem root
			log.Fatalf("could not find project root (go.mod) walking up from %s", startDir)
		}
		dir = parent
	}
}

func LoadTestEnv() {
	startDir, _ := os.Getwd()
	dir := startDir
	for {
		candidate := filepath.Join(dir, "test.env")
		if st, err := os.Stat(candidate); err == nil && !st.IsDir() {
			if err := godotenv.Overload(candidate); err != nil {
				log.Printf("[test-setup] found but couldn't load %s: %v", candidate, err)
			} else {
				log.Printf("[test-setup] loaded env from %s", candidate)
			}
			return
		}
		parent := filepath.Dir(dir)
		if parent == dir { // reached filesystem root
			break
		}
		dir = parent
	}
	log.Printf("[test-setup] no test.env found walking up from %s; relying on existing environment", startDir)
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
	startDir, _ := os.Getwd()
	dir := startDir

	var migDir string

	for {
		candidate := filepath.Join(dir, "db", "migrations")
		if st, err := os.Stat(candidate); err == nil && st.IsDir() {
			migDir = candidate
			break
		}
		parent := filepath.Dir(dir)
		if parent == dir { // reached filesystem root
			break
		}
		dir = parent
	}

	entries, entriesErr := os.ReadDir(migDir)

	if entriesErr != nil {
		log.Fatalf("failed to read migrations dir: %v", entriesErr)
	}

	// First, check if migrations have already been applied by looking for products table
	var tableExists bool
	err := db.QueryRow(`SELECT EXISTS (
		SELECT FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_name = 'products'
	)`).Scan(&tableExists)

	if err == nil && tableExists {
		log.Printf("[test-setup] tables already exist, skipping migrations")
		return
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

// Seed inserts baseline test data consistent with the exported fixtures above.
func Seed(db *sql.DB) error {
	// seed products
	if _, err := db.Exec(
		`INSERT INTO products (id, name, price, quantity) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
		SeedProducts[0].ID, SeedProducts[0].Name, SeedProducts[0].Price, SeedProducts[0].Quantity,
		SeedProducts[1].ID, SeedProducts[1].Name, SeedProducts[1].Price, SeedProducts[1].Quantity,
	); err != nil {
		return err
	}

	// seed one media asset referencing first product
	if _, err := db.Exec(
		`INSERT INTO media_assets (id, object_key, original_filename, content_type, size_bytes, product_id, upload_status) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		SeedMediaAssets[0].ID,
		SeedMediaAssets[0].ObjectKey,
		SeedMediaAssets[0].OriginalFilename,
		SeedMediaAssets[0].ContentType,
		SeedMediaAssets[0].SizeBytes,
		SeedMediaAssets[0].ProductID,
		SeedMediaAssets[0].UploadStatus,
	); err != nil {
		return err
	}
	return nil
}
