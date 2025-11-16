# Personal finance tracker

## How to run the application

This project uses Docker Compose to set up all required services (backend, frontend, and database).

1. Make sure Docker is installed and running on your machine.
2. In the project root directory, run:

   ```sh
   docker compose up
   ```

This will start all services defined in `docker-compose.yml`.

3. open the application on http://localhost:3012

- The backend (Spring Boot) will be available on port 3012.
- The frontend will be started on port 3013.
- The database (Postgres) will be started and seeded as defined. It uses 6501.

## Development

### Frontend (React)

1. In the `root` directory, install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

## Notes

- The application uses environment-specific configuration for service URLs and database connections.
- Seed data and migrations are managed via Flyway and SQL scripts.
- For more details, see the source code and configuration files.


# Go

## How to run the tests



## Database

Run migration

```sh
migrate -path db/migrations -database "postgres://test-user:test-pw@localhost:6501/cat_db?sslmode=disable" up
```

Run seed file

```sh
psql "postgres://test-user:test-pw@localhost:6501/cat_db?sslmode=disable" -f db/seed/data-dev.sql
```

## Fake GCS (Local Storage / Uploads)

This project uses `fsouza/fake-gcs-server` for local development of Google Cloud Storage interactions.

### Bucket auto-creation

On startup the Go service checks `STORAGE_EMULATOR_HOST` and automatically creates (idempotently) the bucket defined by `GCS_BUCKET_NAME`.

### Generating an upload URL (dual‑mode)

Call the backend:

```sh
curl -s -X POST http://localhost:3012/api/upload/generate-url \
   -H 'Content-Type: application/json' \
   -d '{"fileName":"cat.png","contentType":"image/png"}' | jq
```

Local emulator response example (note the extra `method` field and the different `uploadUrl` path):

```json
{
   "uploadUrl": "http://localhost:4443/upload/storage/v1/b/personal-finance-uploads/o?uploadType=media&name=uploads%2F<ts>%2F<uuid>.png",
   "objectKey": "uploads/<ts>/<uuid>.png",
   "publicUrl": "http://localhost:4443/personal-finance-uploads/uploads/<ts>/<uuid>.png",
   "method": "POST"
}
```

Production (real GCS) example (structure — actual signed URL will be long & signed):

```json
{
   "uploadUrl": "https://storage.googleapis.com/personal-finance-uploads/uploads/<ts>/<uuid>.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&...",
   "objectKey": "uploads/<ts>/<uuid>.png",
   "publicUrl": "https://storage.googleapis.com/personal-finance-uploads/uploads/<ts>/<uuid>.png",
   "method": "PUT"
}
```

### Performing the upload

Always use the returned `method` and `uploadUrl` exactly as provided:

Emulator (POST media upload):
```sh
curl -v -X POST <uploadUrl from JSON> \
   -H 'Content-Type: image/png' \
   --data-binary @test/assets/cat.png
```

Production (PUT signed URL):
```sh
curl -v -X PUT "<uploadUrl from JSON>" \
   -H 'Content-Type: image/png' \
   --data-binary @test/assets/cat.png
```

### Common issues

1. 404 on upload: Bucket not yet created (restart app or ensure env var set) or wrong host (use `localhost:4443` from host machine, not the container name).
2. 400 `invalid uploadType`: You are attempting a PUT to the emulator object path; regenerate an URL and use the provided POST media endpoint.
3. 403/AccessDenied (production): Bucket/object not publicly readable; configure IAM / uniform bucket-level access or serve via signed GET URLs.
4. Wrong `Content-Type`: Must match what you declared when generating the URL (production signed URL includes it in the signature).

### Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STORAGE_EMULATOR_HOST` | Emulator base URL for storage client & URL generation | `http://localhost:4443` |
| `GCS_BUCKET_NAME` | Bucket name used for uploads | `personal-finance-uploads` |

Emulator data (including object bytes) now persists under `./fake-gcs-data`.

# Personal Finance Tracker

## Email registration/login using Authboss (Gin + Postgres)

This project now supports email/password registration and login using Authboss.
It’s wired in behind a feature flag so your app remains unchanged until enabled.

### 1) Database migration
Create the users table (email unique, password hash stored):

- Run your normal migration process to apply: db/migrations/000004_create_users_table.up.sql

Table: Users
- id (TEXT, primary key)
- email (TEXT, unique)
- password (TEXT, bcrypt hash)
- created_at, updated_at timestamps

### 2) Enable Authboss
Set these environment variables (e.g., in dev.env):

- AUTH_ENABLE=true
- ROOT_URL=http://localhost:3012
- SESSION_STORE_KEY=some-long-random-string
- COOKIE_STORE_KEY=some-other-long-random-string
- SESSION_HASH_KEY (optional; falls back to SESSION_STORE_KEY)
- SESSION_BLOCK_KEY (optional; AES key must be 16/24/32 bytes, otherwise encryption is disabled)
- COOKIE_HASH_KEY (optional; falls back to COOKIE_STORE_KEY or SESSION_HASH_KEY)
- COOKIE_BLOCK_KEY (optional; AES key must be 16/24/32 bytes, otherwise encryption is disabled)

Notes:
- Hash keys (HMAC) can be any reasonably long random byte string (32–64 bytes recommended).
- Block keys are for AES encryption; valid sizes are exactly 16, 24, or 32 bytes. If invalid, the app logs a warning and proceeds without encryption instead of panicking.

Then start the app as usual. When AUTH_ENABLE=true, routes mount under /auth.

### 3) Routes
Authboss is mounted under /auth and exposes handlers for register/login/logout.

- POST /auth/register
  Body fields (application/x-www-form-urlencoded or JSON):
  - email (used as PID)
  - password

- POST /auth/login
  Body fields:
  - email
  - password

- POST /auth/logout

By default, Authboss expects form-encoded fields (email, password). You can send JSON and Gin will pass it through, but classic form encoding is recommended unless you add a custom responder.

### 4) Example curl
Register:

curl -i -X POST http://localhost:3012/auth/register \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'email=test@example.com&password=secret123'

Login:

curl -i -X POST http://localhost:3012/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'email=test@example.com&password=secret123'

Logout:

curl -i -X POST http://localhost:3012/auth/logout

Note: Authboss returns redirects and uses session cookies. For pure-JSON APIs, you can customize ab.Config.Core.Redirector/Responder and provide your own ViewRenderer with JSON responses.

### 5) Implementation details
- internal/auth/authboss_setup.go
  - Implements a minimal Postgres-backed storer (create/load/save) using the Users table; email is the PID.
  - Configures client state via authboss-clientstate (sessions + cookies).
  - Imports modules for side effects (auth, register, logout) and mounts Authboss under /auth in Gin.
  - Controlled via AUTH_ENABLE env variable.

- cmd/myapp/main.go
  - Calls auth.Setup(r, db.DB) which conditionally mounts /auth routes if AUTH_ENABLE=true.

### 6) Notes / next steps
- Email verification, password recovery, lockouts, etc., can be enabled by adding corresponding columns to Users and turning on modules.
- If you want HTML forms, provide templates and a renderer; otherwise the defaults perform redirects.
- Adjust bcrypt cost with ab.Config.Modules.BCryptCost if needed.
- Ensure SESSION_STORE_KEY and COOKIE_STORE_KEY are long, random, and kept secret in production.
