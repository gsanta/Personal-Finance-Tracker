package pubsubinit

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"cloud.google.com/go/pubsub"
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
