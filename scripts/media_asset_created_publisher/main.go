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

	projectID := getenvDefault("PROJECT_ID", "pubsub-dev-test")
	topicID := getenvDefault("GCS_EVENTS_TOPIC", "gcs-object-events")
	bucketName := getenvDefault("GCS_BUCKET_NAME", "personal-finance-uploads")
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

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("failed to create watcher: %v", err)
	}
	defer watcher.Close()

	if err := addWatchRecursive(watcher, watchRoot); err != nil {
		log.Fatalf("failed to add recursive `watches under %s: %v", watchRoot, err)
	}

	// Allowed image extensions (lowercase, with leading dot)
	allowedExt := map[string]struct{}{ ".jpeg": {}, ".jpg": {}, ".png": {}, ".gif": {}, ".webp": {} }
	isAllowedImage := func(path string) bool {
		ext := strings.ToLower(filepath.Ext(path))
		_, ok := allowedExt[ext]
		return ok
	}

	// simple in-memory dedup map: filename -> last published time
	published := make(map[string]time.Time)
	publishOnce := func(path string) {
		info, err := os.Stat(path)
		if err != nil || !info.Mode().IsRegular() {
			return
		}
		if !isAllowedImage(path) {
			return // ignore non-image files
		}
		rel := strings.TrimPrefix(path, watchRoot)
		rel = strings.TrimLeft(rel, string(os.PathSeparator))
		last, ok := published[rel]
		if ok && time.Since(last) < 2*time.Second {
			// skip duplicate within window
			return
		}
		publishFile(ctx, topic, watchRoot, bucketName, path)
		published[rel] = time.Now()
	}

	for {
		select {
		case <-ctx.Done():
			log.Printf("[watcher] shutdown signal received")
			return
		case ev := <-watcher.Events:
			// Directory created? add watch (and any nested existing structure)
			if ev.Op&fsnotify.Create == fsnotify.Create {
				// Attempt to stat to see if it's directory
				if info, err := os.Stat(ev.Name); err == nil && info.IsDir() {
					if err := addWatchRecursive(watcher, ev.Name); err != nil {
						log.Printf("[watcher] failed adding new dir watch %s: %v", ev.Name, err)
					}
					// No publish for directories themselves
					break
				}
			}
			if ev.Op&(fsnotify.Create|fsnotify.Write) != 0 {
				publishOnce(ev.Name)
			}
		case err := <-watcher.Errors:
			log.Printf("[watcher] error: %v", err)
		}
	}
}

// addWatchRecursive walks root and adds a watch for every directory encountered.
// fsnotify does not natively watch recursively, so we manually add each directory.
func addWatchRecursive(w *fsnotify.Watcher, root string) error {
	return filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			if err := w.Add(path); err != nil {
				return fmt.Errorf("add watch for %s: %w", path, err)
			}
			log.Printf("[watcher] watching dir: %s", path)
		}
		return nil
	})
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
