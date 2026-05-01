# Rust CLI Template

A modern Rust CLI template using Cargo, clap, clippy, and rustfmt. This template provides a well-structured starting point for Rust CLI applications with proper testing, linting, and project organization.

## Features

- **Fast Compilation**: Rust's incremental compilation keeps iteration fast
- **Argument Parsing**: Built with [clap](https://docs.rs/clap) (derive API) for excellent UX and auto-generated help
- **Comprehensive Testing**: Unit tests inline in `lib.rs`, integration tests via [assert_cmd](https://docs.rs/assert_cmd)
- **Code Quality**: Linting with `clippy` and formatting with `rustfmt`
- **Convenient Commands**: Makefile with all common development tasks

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain, 1.70+)

### Installation

```bash
# Build the project
make build

# Or with cargo directly
cargo build
```

### Usage

```bash
# Run hello world command
make run-main

# Or directly
cargo run -- hello

# With a name
cargo run -- hello --name "Alice"

# Process text
cargo run -- process "Hello there"

# With uppercase flag
cargo run -- process "Hello there" --uppercase

# Check version
cargo run -- version
```

After `cargo install --path .` you can also call `rust-cli` directly.

## Available Commands

### `hello`
Say hello to the world or to a specific person.

```bash
rust-cli hello [--name TEXT]
```

Options:
- `--name`, `-n`: Name to include in the greeting

### `process`
Process input text and return a formatted response.

```bash
rust-cli process [TEXT] [--uppercase]
```

Arguments:
- `TEXT`: Input text to process (optional)

Options:
- `--uppercase`, `-u`: Convert output to uppercase

### `version`
Show version information.

```bash
rust-cli version
```

### `help`
Get help for commands.

```bash
rust-cli --help
rust-cli COMMAND --help
```

## Development

### Project Structure

```
rust-cli/
├── Cargo.toml              # Project configuration and dependencies
├── Cargo.lock              # Locked dependency versions
├── README.md               # This file
├── Makefile                # Development commands
├── .gitignore              # Git ignore patterns
├── src/
│   ├── main.rs             # clap CLI entry point and subcommand dispatch
│   └── lib.rs              # Business logic + inline unit tests
└── tests/
    └── integration_test.rs # CLI integration tests (assert_cmd)
```

### Available Make Commands

- `make help` - Show all available commands
- `make build` - Build the project
- `make run-main` - Run the main CLI command
- `make run-test` - Run unit tests
- `make run-integration-tests` - Run integration tests
- `make run-all-tests` - Run all tests
- `make run-lint` - Run clippy linter
- `make run-format` - Apply rustfmt formatting
- `make check` - Run lint and format checks (CI target)
- `make clean` - Clean build artifacts

### Testing

The template uses two levels of testing:

1. **Unit Tests** (inline in `src/lib.rs`): Test individual functions
2. **Integration Tests** (`tests/integration_test.rs`): Test CLI commands end-to-end via `assert_cmd`

```bash
# Run unit tests only
make run-test

# Run integration tests only
make run-integration-tests

# Run all tests
make run-all-tests
```

### Code Quality

```bash
# Lint with clippy (warnings are errors)
make run-lint

# Format code
make run-format

# Run both checks (CI target)
make check
```

## Dependencies

### Runtime Dependencies

- **clap** (v4, derive feature): Argument parsing with auto-generated help

### Dev Dependencies

- **assert_cmd** (v2): Spawn and assert on CLI processes in tests
- **predicates** (v3): Composable predicates for `assert_cmd` assertions

## License

This project is licensed under the MIT License.
