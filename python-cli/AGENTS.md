# Project: python-cli

Python CLI template using uv, Typer, Pydantic, pytest, ruff, and pyright.

See [ARCHITECTURE.md](ARCHITECTURE.md) for module responsibilities and [REVIEW.md](REVIEW.md) for code review rules. Stack decisions are recorded in [docs/adr/](docs/adr/).

## Tech Stack

- **Runtime**: Python 3.14+
- **Package Manager**: uv
- **CLI Framework**: Typer
- **Validation**: Pydantic
- **Testing**: pytest (unit + e2e)
- **Lint/Format**: ruff
- **Type Checking**: pyright (strict)

## Commands

```bash
make install                  # Install dependencies (uv sync)
make run-main                 # Run CLI hello command
make run-test                 # Unit tests with coverage
make run-e2e-tests            # E2E tests
make run-all-tests            # All tests
make run-lint                 # Lint with ruff
make run-typecheck            # Type check with pyright (strict)
make run-format               # Format with ruff
make check                    # Lint + format + type check (CI target)
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
│       ├── cli.py         # Typer entry point
│       ├── main.py        # Business logic
│       └── models.py      # Pydantic models
├── tests/                 # Unit tests (import functions directly)
│   ├── conftest.py
│   └── test_main.py
├── e2e-tests/             # Run the CLI as a subprocess
├── pyproject.toml
└── Makefile
```

## Testing

Two levels only:

- **Unit** (`tests/`): call functions and models in `main.py` / `models.py` directly. No subprocesses.
- **E2E** (`e2e-tests/`): run `python -m python_cli.cli` as a subprocess and assert on exit code, stdout, and stderr. Every CLI command and option belongs here.

## Validation

```bash
# After each non-trivial edit
make run-test && make run-lint && make run-typecheck

# Full validation
make run-all-tests

# Before committing
make check
```
