# Project: python-cli

Python CLI template using uv, Click, Pydantic, pytest, and ruff.

## Tech Stack

- **Runtime**: Python 3.10+
- **Package Manager**: uv
- **CLI Framework**: Click
- **Validation**: Pydantic
- **Testing**: pytest
- **Lint/Format**: ruff

## Commands

```bash
make install                  # Install dependencies (uv sync)
make run-main                 # Run CLI hello command
make run-test                 # Unit tests with coverage
make run-integration-tests    # Integration tests
make run-e2e-tests            # E2E tests
make run-all-tests            # All tests
make run-lint                 # Lint with ruff
make run-format               # Format with ruff
make check                    # Lint + format check (CI target)
```

Direct uv commands:

```bash
uv run python -m python_cli.cli hello
uv run python -m python_cli.cli hello --name "Alice"
uv run python -m python_cli.cli process "Hello there"
uv run python -m python_cli.cli version
```

## Project Structure

```
python-cli/
├── src/
│   └── python_cli/
│       ├── __init__.py
│       ├── cli.py         # Click entry point
│       ├── main.py        # Business logic
│       └── models.py      # Pydantic models
├── tests/                 # Unit tests
│   ├── conftest.py
│   └── test_main.py
├── integration-tests/     # CLI integration tests
├── e2e-tests/             # Full CLI e2e tests
├── pyproject.toml
└── Makefile
```

## Validation

```bash
# After each non-trivial edit
make run-test && make run-lint

# Full validation
make run-all-tests

# Before committing
make check
```
