API_DOCKER_CONTAINER ?= badsec-api

.PHONY: \
	integration-test \
	start-badsec-api \
	stop-badsec-api \
	unit-test

start-badsec-api: ## Starts the local BADSEC API server
	@docker inspect --format "{{.Id}}" $(API_DOCKER_CONTAINER) 2> /dev/null || \
	docker run --detach --rm -p 8888:8888 --name $(API_DOCKER_CONTAINER) adhocteam/noclist

stop-badsec-api: ## Stops the local BADSEC API server
	@docker stop $(API_DOCKER_CONTAINER) > /dev/null

integration-test: start-badsec-api ## Executes the challenge against the local server
	./challenge.js | scripts/check-json.js
	@echo "✅ Output is valid JSON"

unit-tests: node_modules ## Runs unit tests
	node_modules/.bin/jest

node_modules: package.json package-lock.json
	npm install && touch $@
