# Project: python-cli

Python CLI template using uv, Typer, Pydantic, pytest, ruff, and pyright.

See [ARCHITECTURE.md](ARCHITECTURE.md) for module responsibilities and [REVIEW.md](REVIEW.md) for code review rules. Stack decisions are recorded in [docs/adr/](docs/adr/); follow [docs/AGENTS.md](docs/AGENTS.md) when writing docs.

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

## Code Principles

- **KISS.** Start with the simplest solution that works. No speculative design; a plain function beats a pattern with one implementation. Let code repeat 2–3 times before extracting a helper.
- **Minimal diff with `main`.** Change only what the task asks. No reformatting, import reordering, renames, or unrelated cleanups; split those into a separate change.
- **Functional style.** Prefer small pure functions with no mutation or I/O (like `main.py`). Compose them in a pipeline rather than nesting calls. Prefer comprehensions, `map`, and `filter` over loops that mutate. Use `functools.partial` for config-like arguments.
- **Clean functions.** Each function does one thing and takes as few arguments as possible (ideally 0–2). When arguments grow, group them into a Pydantic model instead of adding more parameters.

## Code Style & Refactoring

- **Errors:** handle them, print a message, or re-raise. Never swallow them silently.
- **Validate at the boundary:** check CLI input and file reads once in `cli.py`, then pass only validated data into `main.py`.
- **Prefer the standard library** and existing dependencies over custom code.
- **Moving files:** update every import, fixture path, and test reference, then run `make run-all-tests`.

## Validation

```bash
# After each non-trivial edit
make run-test && make run-lint && make run-typecheck

# Full validation
make run-all-tests

# Before committing
make check
```
