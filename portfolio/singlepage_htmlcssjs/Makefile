# Portfolio SPA — common developer targets
#
# Usage: make [target]
# Default: make help

.DEFAULT_GOAL := help

PORT ?= 4173
NPM  ?= npm

.PHONY: help install serve test test-watch test-e2e test-e2e-playwright test-all \
	playwright-install clean exit

help: ## Show this help message
	@echo "Portfolio SPA — available targets"
	@echo ""
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z0-9_-]+:.*## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Variables: PORT=$(PORT)  NPM=$(NPM)"

install: ## Install npm dependencies
	$(NPM) install

playwright-install: install ## Install Playwright Chromium browser (optional e2e)
	npx playwright install chromium

serve: install ## Serve the static site on PORT (default 4173)
	npx --yes serve . -l $(PORT)

test: install ## Run Vitest unit + DOM integration tests
	$(NPM) test

test-watch: install ## Run Vitest in watch mode
	$(NPM) run test:watch

test-e2e: install ## Run DOM integration e2e suite (jsdom, no browser binaries)
	$(NPM) run test:e2e

test-e2e-playwright: install ## Run Playwright browser smoke tests
	$(NPM) run test:e2e:playwright

test-all: install ## Run Vitest then Playwright e2e
	$(NPM) run test:all

clean: ## Remove caches, reports, logs, and temp files (keeps node_modules)
	@echo "Cleaning caches, reports, and temp files…"
	rm -rf \
		test-results \
		playwright-report \
		blob-report \
		.playwright \
		coverage \
		.nyc_output \
		.vitest \
		.turbo \
		.cache \
		.tmp \
		tmp \
		dist \
		build \
		node_modules/.cache \
		node_modules/.vite \
		node_modules/.vitest
	rm -f \
		*.log \
		npm-debug.log* \
		yarn-debug.log* \
		yarn-error.log* \
		.DS_Store
	find . -type f \( -name '.DS_Store' -o -name '*.log' -o -name '*~' -o -name '*.tmp' \) \
		! -path './.agents/*' \
		! -path './.git/*' \
		-delete 2>/dev/null || true
	@echo "Clean complete (node_modules preserved)."

exit: clean ## Full teardown — clean + remove installations (node_modules)
	@echo "Removing installations…"
	rm -rf node_modules
	@echo "Exit complete. Run 'make install' to restore dependencies."
