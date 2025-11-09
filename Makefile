# Convenience Makefile

FAKE_GCS_SERVICE=fake-gcs
FAKE_GCS_BUCKET_DIR=fake-gcs-data/personal-finance-uploads

.PHONY: reset-fake-gcs-light
reset-fake-gcs-light:
	@echo "[reset] Stopping fake-gcs container"
	@docker compose stop $(FAKE_GCS_SERVICE) >/dev/null 2>&1 || true
	@docker compose rm -f $(FAKE_GCS_SERVICE) >/dev/null 2>&1 || true
	@echo "[reset] Removing uploaded objects (preserving .gitkeep if present)"
	@if [ -d $(FAKE_GCS_BUCKET_DIR) ]; then \
		find $(FAKE_GCS_BUCKET_DIR) -mindepth 1 -type f ! -name '.gitkeep' -delete; \
		find $(FAKE_GCS_BUCKET_DIR) -mindepth 1 -type d -empty -delete; \
	fi
	@echo "[reset] Restarting fake-gcs"
	@docker compose up -d $(FAKE_GCS_SERVICE)
	@echo "[reset] Done. Current object files:" 
	@find $(FAKE_GCS_BUCKET_DIR) -type f | sed 's/^/  /' || true

.PHONY: test-compose-up
# Start the test docker compose stack
start-test-env:
	docker compose -f docker-compose.test.yml up -d~

stop-test-env:
	docker compose -f docker-compose.test.yml down

.PHONY: seed-dev-data
seed-dev-data:
	@echo "[seed] Copying dev media assets into fake GCS bucket directory"
	@mkdir -p $(FAKE_GCS_BUCKET_DIR)/uploads
	@cp -R test/media_assets/* $(FAKE_GCS_BUCKET_DIR)/uploads/ 2>/dev/null || true
	@echo "[seed] Applying dev SQL seed to database"
	@psql "postgres://test-user:test-pw@localhost:6501/cat_db?sslmode=disable" -f db/seed/data-dev.sql
	@echo "[seed] Done. Current object files:"
	@find $(FAKE_GCS_BUCKET_DIR) -type f | sed 's/^/  /' || true
	