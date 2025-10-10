# Personal finance tracker

## How to run the application

This project uses Docker Compose to set up all required services (backend, frontend, and database).

1. Make sure Docker is installed and running on your machine.
2. In the project root directory, run:

   ```sh
   docker compose up
   ```

This will start all services defined in `docker-compose.yml`.
It might take a while for the fronted to start at the first time.

3. open the application on http://localhost:3012

- The backend (Spring Boot) will be available on port 3012.
- The frontend will be started on port 3013.
- The database (Postgres) will be started and seeded as defined. It uses 6501.

## Development

- Backend: Java 21, Spring Boot 3.5.5, Maven
- Frontend: React, Node.js, Webpack

## Running backend and frontend locally

### Backend (Spring Boot)

1. Make sure Postgres is running (docker compose up postgres).
2. In the project root, run:

   ```sh
   ./mvnw clean package -Dspring.profiles.active=test
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

### Frontend (React)

1. In the `root` directory, install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

## Running tests

To run backend tests:

> **Note:** The Postgres database must be running before you execute the tests. You can start it with Docker Compose:

```sh
docker compose up postgres
```

Then run:

```sh
./mvnw test
```

## Notes

- The application uses environment-specific configuration for service URLs and database connections.
- Seed data and migrations are managed via Flyway and SQL scripts.
- For more details, see the source code and configuration files.


# Go

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
   --data-binary @cat.png
```

Production (PUT signed URL):
```sh
curl -v -X PUT "<uploadUrl from JSON>" \
   -H 'Content-Type: image/png' \
   --data-binary @cat.png
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
