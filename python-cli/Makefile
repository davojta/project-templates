.PHONY: help run-main run-test run-e2e-tests run-lint run-typecheck run-format install clean

# Default target
help:
	@echo "Python CLI Template - Available Commands:"
	@echo "  make run-main         - Run the main CLI command"
	@echo "  make run-test         - Run unit tests"
	@echo "  make run-e2e-tests    - Run end-to-end tests"
	@echo "  make run-lint         - Run ruff linter"
	@echo "  make run-typecheck    - Type check with pyright"
	@echo "  make run-format       - Apply ruff formatting"
	@echo "  make install          - Install dependencies with uv"
	@echo "  make clean            - Clean build artifacts"

# Install dependencies
install:
	uv sync

# Run main CLI command
run-main:
	uv run python -m python_cli.cli hello

# Run unit tests
run-test:
	uv run pytest tests/ -v --cov=src --cov-report=term-missing

# Run E2E tests
run-e2e-tests:
	uv run pytest e2e-tests/ -v

# Run all tests
run-all-tests: run-test run-e2e-tests

# Run linter
run-lint:
	uv run ruff check src/ tests/ e2e-tests/

# Run type checker
run-typecheck:
	uv run pyright

# Run formatter
run-format:
	uv run ruff format src/ tests/ e2e-tests/

# Check code quality without modifying files (CI target)
check:
	@echo "Running linting checks..."
	@uv run ruff check src/ tests/ e2e-tests/
	@echo "Checking formatting..."
	@uv run ruff format --check src/ tests/ e2e-tests/
	@echo "Type checking..."
	@uv run pyright
	@echo "All checks passed!"

# Clean build artifacts
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .coverage
	rm -rf htmlcov/
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete