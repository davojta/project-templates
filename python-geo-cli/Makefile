.PHONY: help install run-main test run-lint run-format clean dev-setup

help:
	@echo "Available commands:"
	@echo "  install        Install dependencies with uv"
	@echo "  run-main       Run the CLI application"
	@echo "  test           Run tests"
	@echo "  run-lint       Run linting"
	@echo "  run-format     Format code"
	@echo "  clean          Clean up temporary files"
	@echo "  dev-setup      Set up development environment"

install:
	uv sync

dev-setup: install
	uv sync --group dev
	uv sync --group notebooks
	uv sync --group viz

run-main:
	uv run geo-cli --help

test:
	uv run pytest

test-coverage:
	uv run pytest --cov=src --cov-report=html --cov-report=term

run-lint:
	uv run ruff check src/

run-format:
	uv run ruff format src/

clean:
	find . -type d -name "__pycache__" -delete
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/
	rm -rf *.egg-info/

# Integration and E2E tests
run-integration-tests:
	uv run pytest integration-tests/

run-e2e-tests:
	uv run pytest e2e-tests/

all-checks: run-lint test run-integration-tests run-e2e-tests
	@echo "All checks passed!"