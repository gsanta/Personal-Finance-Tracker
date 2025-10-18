package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"cloud.google.com/go/pubsub"
	"github.com/fsnotify/fsnotify"
)

func getenvDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	projectID := getenvDefault("PROJECT_ID", "demo-project")
	topicID := getenvDefault("MEDIA_ASSET_TOPIC", "media-asset-created")
	bucketName := getenvDefault("GCS_BUCKET_NAME", "dev-bucket")
	watchRoot := os.Getenv("WATCH_ROOT")
	if watchRoot == "" {
		log.Fatal("WATCH_ROOT env var is required")
	}

	// Ensure path exists
	if st, err := os.Stat(watchRoot); err != nil || !st.IsDir() {
		log.Fatalf("WATCH_ROOT '%s' not accessible or not a directory: %v", watchRoot, err)
	}

	pubSubClient, err := pubsub.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("failed to create pubsub client: %v", err)
	}
	defer pubSubClient.Close()

	topic := pubSubClient.Topic(topicID)
	exists, err := topic.Exists(ctx)
	if err != nil {
		log.Fatalf("topic existence check failed: %v", err)
	}
	if !exists {
		log.Printf("[pubsub] creating topic %s", topicID)
		if topic, err = pubSubClient.CreateTopic(ctx, topicID); err != nil {
			log.Fatalf("failed to create topic: %v", err)
		}
	}

	log.Printf("[watcher] starting for directory=%s topic=%s project=%s bucket=%s", watchRoot, topicID, projectID, bucketName)

	// Initial scan publishes existing files (optional; comment out if undesired)
	if err := initialScan(ctx, topic, watchRoot, bucketName); err != nil {
		log.Printf("initial scan error: %v", err)
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("failed to create watcher: %v", err)
	}
	defer watcher.Close()

	if err := watcher.Add(watchRoot); err != nil {
		log.Fatalf("failed to watch directory %s: %v", watchRoot, err)
	}

	for {
		select {
		case <-ctx.Done():
			log.Printf("[watcher] shutdown signal received")
			return
		case ev := <-watcher.Events:
			if ev.Op&fsnotify.Create == fsnotify.Create {
				publishIfRegular(ctx, topic, watchRoot, bucketName, ev.Name)
			} else if ev.Op&fsnotify.Write == fsnotify.Write {
				// Optionally handle writes if creation comes before file fully written.
				publishIfRegular(ctx, topic, watchRoot, bucketName, ev.Name)
			}
		case err := <-watcher.Errors:
			log.Printf("[watcher] error: %v", err)
		}
	}
}

func initialScan(ctx context.Context, topic *pubsub.Topic, root, bucket string) error {
	return filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Mode().IsRegular() {
			publishFile(ctx, topic, root, bucket, path)
		}
		return nil
	})
}

func publishIfRegular(ctx context.Context, topic *pubsub.Topic, root, bucket, path string) {
	info, err := os.Stat(path)
	if err != nil {
		return
	}
	if !info.Mode().IsRegular() {
		return
	}
	publishFile(ctx, topic, root, bucket, path)
}

func publishFile(ctx context.Context, topic *pubsub.Topic, root, bucket, fullPath string) {
	rel := strings.TrimPrefix(fullPath, root)
	rel = strings.TrimLeft(rel, string(os.PathSeparator))
	// Construct object ID analogous to original path relative to watch root
	objectID := rel
	msg := &pubsub.Message{
		Data: []byte(fmt.Sprintf(`{"bucket":"%s","name":"%s","timeCreated":"%s"}`, bucket, objectID, time.Now().UTC().Format(time.RFC3339Nano))),
		Attributes: map[string]string{
			"eventType": "OBJECT_FINALIZE",
			"bucketId":  bucket,
			"objectId":  objectID,
		},
	}
	res := topic.Publish(ctx, msg)
	id, err := res.Get(ctx)
	if err != nil {
		log.Printf("[pubsub] publish failed object=%s err=%v", objectID, err)
		return
	}
	log.Printf("[pubsub] published object=%s msgID=%s", objectID, id)
}
