.DEFAULT_GOAL := help
DC ?= docker compose
SCENARIO ?= scenarios/vote.yml

.PHONY: help install up down dev logs ps restart clean test seed mobile mobile-android apk loadtest check-secrets

help: ## Show available targets
	@awk 'BEGIN { FS = ":.*## " } /^[a-z-]+:.*## / { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

install: ## Create missing local env files and install available packages
	@set -e; for env in .env mobile/.env; do \
		if [ -f "$$env" ]; then :; \
		elif [ -f "$$env.example" ]; then cp -n "$$env.example" "$$env"; fi; \
	done; \
	for dir in backend mobile loadtest; do \
		if [ -f "$$dir/package.json" ]; then \
			if [ -f "$$dir/package-lock.json" ]; then (cd "$$dir" && npm ci); \
			else (cd "$$dir" && npm install); fi; \
		else printf 'skip %s: not scaffolded yet\n' "$$dir"; fi; \
	done

up: ## Build and start services in the background
	@if [ -f docker-compose.yml ]; then $(DC) up -d --build; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

down: ## Stop services
	@if [ -f docker-compose.yml ]; then $(DC) down; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

dev: ## Build and start services in the foreground
	@if [ -f docker-compose.yml ]; then $(DC) up --build; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

logs: ## Show service logs
	@if [ -f docker-compose.yml ]; then $(DC) logs; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

ps: ## List services
	@if [ -f docker-compose.yml ]; then $(DC) ps; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

restart: ## Restart services
	@if [ -f docker-compose.yml ]; then $(DC) restart; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

clean: ## Remove services, volumes, and orphan containers
	@if [ -f docker-compose.yml ]; then $(DC) down -v --remove-orphans; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

test: ## Run backend and mobile tests when scaffolded
	@set -e; for dir in backend mobile; do \
		if [ -f "$$dir/package.json" ]; then (cd "$$dir" && npm test); \
		else printf 'skip %s: not scaffolded yet\n' "$$dir"; fi; \
	done

seed: ## Seed the backend database
	@if [ -f docker-compose.yml ]; then $(DC) exec backend npm run seed; else echo 'docker-compose.yml not present yet (MCH-79)'; fi

mobile: ## Start the app in the browser (Expo web on :8081; teammates use http://<this-machine-ip>:8081)
	@if [ -f mobile/package.json ]; then cd mobile && npx expo start --web; else echo 'skip mobile: not scaffolded yet'; exit 1; fi

mobile-android: ## Start the Expo dev server for the Android development client
	@if [ -f mobile/package.json ]; then cd mobile && npx expo start --dev-client; else echo 'skip mobile: not scaffolded yet'; exit 1; fi

apk: ## Generate Android sources and build a release APK
	@if [ -f mobile/package.json ]; then \
		cd mobile && npx expo prebuild --platform android --clean && \
		cd android && ./gradlew assembleRelease && \
		echo 'APK output (relative to mobile/): android/app/build/outputs/apk/release/'; \
	else echo 'skip mobile: not scaffolded yet'; exit 1; fi

loadtest: ## Run Artillery (override SCENARIO to select a scenario)
	@if [ -f loadtest/package.json ]; then cd loadtest && npx artillery run $(SCENARIO); else echo 'skip loadtest: not scaffolded yet'; exit 1; fi

check-secrets: ## Reject tracked env files except .env.example
	@if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then \
		files=$$(git -c core.quotePath=false ls-files | awk -F/ '$$NF == ".env" || ($$NF ~ /^\.env\./ && $$NF != ".env.example")'); \
		if [ -n "$$files" ]; then printf 'Tracked env files found:\n%s\n' "$$files"; exit 1; \
		else echo 'OK: no tracked secret env files'; fi; \
	else echo 'Not in a git repo; skipping check-secrets'; fi
