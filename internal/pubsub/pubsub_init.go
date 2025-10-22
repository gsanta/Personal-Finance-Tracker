package pubsubinit

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"os"
	"time"

	"cloud.google.com/go/pubsub"
	dbpkg "github.com/gsanta/Personal-Finance-Tracker/internal/db"
)

type PubSubResources struct {
	Client       *pubsub.Client
	Topic        *pubsub.Topic
	Subscription *pubsub.Subscription
}

type Config struct {
	ProjectID      string
	TopicID        string
	SubscriptionID string
	AckDeadline    time.Duration
}

func LoadConfig() Config {
	project := os.Getenv("PROJECT_ID")
	return Config{
		ProjectID:      project,
		TopicID:        os.Getenv("GCS_EVENTS_TOPIC"),
		SubscriptionID: os.Getenv("GCS_EVENTS_SUB"),
		AckDeadline:    10 * time.Second,
	}
}

type MediaUploadedSubscriber struct {
	DB       *sql.DB
	Resource *PubSubResources
}

func NewMediaUploadedSubscriber(db *sql.DB, resource *PubSubResources) *MediaUploadedSubscriber {
	return &MediaUploadedSubscriber{DB: db, Resource: resource}
}

func EnsurePubSub(ctx context.Context, cfg Config) (*PubSubResources, error) {
	if cfg.TopicID == "" || cfg.SubscriptionID == "" {
		return nil, errors.New("missing TopicID or SubscriptionID")
	}

	client, err := pubsub.NewClient(ctx, cfg.ProjectID)
	if err != nil {
		return nil, err
	}

	// Topic
	topic := client.Topic(cfg.TopicID)
	exists, err := topic.Exists(ctx)
	if err != nil {
		client.Close()
		return nil, err
	}
	if !exists {
		log.Printf("[pubsub] creating topic %s", cfg.TopicID)
		topic, err = client.CreateTopic(ctx, cfg.TopicID)
		if err != nil {
			client.Close()
			return nil, err
		}
	} else {
		log.Printf("[pubsub] topic %s already exists", cfg.TopicID)
	}

	// Subscription
	sub := client.Subscription(cfg.SubscriptionID)
	exists, err = sub.Exists(ctx)
	if err != nil {
		client.Close()
		return nil, err
	}
	if !exists {
		log.Printf("[pubsub] creating subscription %s", cfg.SubscriptionID)
		sub, err = client.CreateSubscription(ctx, cfg.SubscriptionID, pubsub.SubscriptionConfig{
			Topic:       topic,
			AckDeadline: cfg.AckDeadline,
		})
		if err != nil {
			client.Close()
			return nil, err
		}
	} else {
		log.Printf("[pubsub] subscription %s already exists", cfg.SubscriptionID)
	}

	return &PubSubResources{Client: client, Topic: topic, Subscription: sub}, nil
}

func (sub *MediaUploadedSubscriber) StartSubscriber(parentCtx context.Context) context.CancelFunc {
	ctx, cancel := context.WithCancel(parentCtx)
	go func() {
		log.Printf("[pubsub-sub] starting Receive loop topic=%s sub=%s", sub.Resource.Topic.ID(), sub.Resource.Subscription.ID())
		err := sub.Resource.Subscription.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
			eventType := m.Attributes["eventType"]
			bucketId := m.Attributes["bucketId"]
			objectId := m.Attributes["objectId"]
			log.Printf("[pubsub-sub] message id=%s eventType=%s bucket=%s object=%s size=%d attrs=%v", m.ID, eventType, bucketId, objectId, len(m.Data), m.Attributes)

			// Only process finalize events
			if eventType == "OBJECT_FINALIZE" {
				// Prepend uploads/ to match DB object_key convention
				dbObjectKey := "uploads/" + objectId
				asset, err := dbpkg.GetMediaAssetByObjectKey(sub.DB, dbObjectKey)
				if err != nil {
					if err == sql.ErrNoRows {
						log.Printf("[pubsub-sub] asset not found for objectKey=%s", dbObjectKey)
					} else {
						log.Printf("[pubsub-sub] lookup error objectKey=%s err=%v", dbObjectKey, err)
					}
					m.Ack()
					return
				}
				// Update status by asset ID
				if _, err := dbpkg.UpdateMediaAssetStatusAndReturn(sub.DB, asset.ID, "uploaded"); err != nil {
					log.Printf("[pubsub-sub] update status failed assetID=%s err=%v", asset.ID, err)
					m.Ack()
					return
				}
				log.Printf("[pubsub-sub] asset status updated assetID=%s objectKey=%s", asset.ID, asset.ObjectKey)
			}
			m.Ack()
		})
		if err != nil && ctx.Err() == nil { // only log if not due to context cancellation
			log.Printf("[pubsub-sub] stopped with error: %v", err)
		} else {
			log.Printf("[pubsub-sub] Receive loop ended")
		}
	}()
	return cancel
}
