# Python CLI Template

A modern Python CLI template using uv, pytest, ruff, and click. This template provides a well-structured starting point for Python CLI applications with proper testing, linting, and project organization.

## Features

- 🚀 **Fast Development**: Uses [uv](https://github.com/astral-sh/uv) for lightning-fast dependency management
- 🧪 **Comprehensive Testing**: Unit, integration, and E2E tests using [pytest](https://pytest.org/)
- ✨ **Type Safety**: Full type hints with [pydantic](https://pydantic-docs.helpmanual.io/) models
- 🎯 **CLI Framework**: Built with [click](https://click.palletsprojects.com/) for excellent UX
- 🔧 **Code Quality**: Linting and formatting with [ruff](https://github.com/astral-sh/ruff)
- 📋 **Convenient Commands**: Makefile with all common development tasks

## Quick Start

### Prerequisites

- [Python 3.10+](https://www.python.org/downloads/)
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

### Installation

1. Clone or download this template
2. Navigate to the project directory
3. Install dependencies:

```bash
# Using uv (recommended)
make install

# Or with uv directly
uv sync

# Or with pip (fallback)
pip install -e .
```

### Usage

Run the CLI with the `make run-main` command or directly:

```bash
# Run hello world command
make run-main

# Or directly
uv run python -m python_cli.cli hello

# With a name
uv run python -m python_cli.cli hello --name "Alice"

# Process text
uv run python -m python_cli.cli process "Hello there"

# With uppercase flag
uv run python -m python_cli.cli process "Hello there" --uppercase

# Check version
uv run python -m python_cli.cli version
```

## Available Commands

### `hello`
Say hello to the world or to a specific person.

```bash
python-cli hello [--name TEXT]
```

Options:
- `--name`, `-n`: Name to include in the greeting

### `process`
Process input text and return a formatted response.

```bash
python-cli process [TEXT] [--uppercase]
```

Arguments:
- `TEXT`: Input text to process (optional)

Options:
- `--uppercase`, `-u`: Convert output to uppercase

### `version`
Show version information.

```bash
python-cli version
```

### `help`
Get help for commands.

```bash
python-cli --help
python-cli COMMAND --help
```

## Development

### Project Structure

```
python-cli/
├── pyproject.toml          # Project configuration and dependencies
├── README.md              # This file
├── Makefile               # Development commands
├── .gitignore            # Git ignore patterns
├── .python-version       # Python version specification
├── src/                  # Source code directory
│   └── python_cli/       # Main package
│       ├── __init__.py   # Package initialization
│       ├── main.py       # Main business logic
│       ├── cli.py        # Click-based CLI entry point
│       └── models.py     # Pydantic models for type safety
├── tests/                # Unit tests
│   ├── __init__.py
│   ├── conftest.py       # pytest configuration
│   └── test_main.py      # Unit tests for main module
├── integration-tests/    # Integration tests
│   ├── __init__.py
│   └── test_cli.py       # CLI integration tests
└── e2e-tests/            # End-to-end tests
    ├── __init__.py
    └── test_cli_e2e.py   # Full CLI e2e tests
```

### Available Make Commands

- `make help` - Show all available commands
- `make install` - Install dependencies with uv
- `make run-main` - Run the main CLI command
- `make run-test` - Run unit tests with coverage
- `make run-integration-tests` - Run integration tests
- `make run-e2e-tests` - Run end-to-end tests
- `make run-all-tests` - Run all tests
- `make run-lint` - Run ruff linter
- `make run-format` - Apply ruff formatting
- `make check` - Run lint and format checks (CI target)
- `make clean` - Clean build artifacts

### Testing

The template includes three levels of testing:

1. **Unit Tests** (`tests/`): Test individual functions and classes
2. **Integration Tests** (`integration-tests/`): Test CLI commands
3. **E2E Tests** (`e2e-tests/`): Test full CLI execution in isolated environments

Run tests with:

```bash
# Run unit tests
make run-test

# Run integration tests
make run-integration-tests

# Run E2E tests
make run-e2e-tests

# Run all tests
make run-all-tests
```

### Code Quality

The template uses ruff for both linting and formatting:

```bash
# Check code quality
make run-lint

# Format code
make run-format

# Run both (useful for CI)
make check
```

### Configuration

#### pyproject.toml

The project configuration is defined in `pyproject.toml`:

- **Dependencies**: click, pydantic
- **Dev dependencies**: ruff, pytest, pytest-cov, pytest-mock
- **Tool configurations**: pytest, coverage, ruff

#### Python Version

The template targets Python 3.10+ for modern features while maintaining good compatibility. The version is specified in `.python-version` and `pyproject.toml`.

#### Ruff Configuration

Ruff is configured for:
- Python 3.10+ target version
- 100 character line length
- Comprehensive linting rules (pycodestyle, Pyflakes, pyupgrade, etc.)
- Consistent formatting

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `make run-all-tests`
5. Run code quality checks: `make check`
6. Commit your changes: `git commit`
7. Push to the branch: `git push origin feature-name`
8. Open a pull request

## Best Practices Used

- **Type Safety**: All functions have type hints, pydantic models for validation
- **Testing**: Three-level testing strategy with good coverage
- **Code Organization**: Clear separation of concerns (CLI, business logic, models)
- **Error Handling**: Proper exception handling with user-friendly messages
- **Documentation**: Comprehensive docstrings and README
- **Modern Python**: Uses modern Python features and best practices
- **Development Workflow**: Convenient commands for common tasks

## Dependencies

### Runtime Dependencies

- **click** (>=8.0.0): CLI framework with excellent UX
- **pydantic** (>=2.0.0): Data validation and settings management

### Development Dependencies

- **ruff** (>=0.1.0): Extremely fast Python linter and formatter
- **pytest** (>=7.0.0): Testing framework
- **pytest-cov** (>=4.0.0): Coverage reporting
- **pytest-mock** (>=3.10.0): Mocking utilities

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [uv](https://github.com/astral-sh/uv) for lightning-fast package management
- [click](https://click.palletsprojects.com/) for the excellent CLI framework
- [ruff](https://github.com/astral-sh/ruff) for fast linting and formatting
- [pydantic](https://pydantic-docs.helpmanual.io/) for data validation
- [pytest](https://pytest.org/) for the testing framework