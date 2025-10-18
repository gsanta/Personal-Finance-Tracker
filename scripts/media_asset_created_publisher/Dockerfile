# Multi-stage build for media_asset_created_publisher
FROM golang:1.25 AS build
WORKDIR /app
# Copy go.mod and go.sum first for better layer caching
COPY go.mod go.sum ./
RUN go mod download
# Copy source
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o media_asset_created_publisher .

# Final minimal image
FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=build /app/media_asset_created_publisher /app/media_asset_created_publisher
# Entrypoint expects one argument (the path containing 'apps'); override via docker-compose command
ENTRYPOINT ["/app/media_asset_created_publisher"]
