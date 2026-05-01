# go-cli

Minimal Go CLI template using [Cobra](https://github.com/spf13/cobra) for argument parsing.

## Prerequisites

- [Go](https://go.dev/dl/) 1.22+
- [golangci-lint](https://golangci-lint.run/usage/install/) (for linting)

## Setup

```bash
go mod download
```

## Usage

```bash
# Run directly
go run . 
# Hello, World!

go run . --name Alice
# Hello, Alice!

go run . --help

# Build and run the binary
make build
./bin/go-cli --name Bob
```

## Development

```bash
make run-test                 # Unit tests with coverage
make run-integration-tests    # CLI flag-parsing tests
make run-e2e-tests            # Subprocess E2E tests
make run-all-tests            # All tests
make run-lint                 # Lint
make run-format               # Format
make check                    # CI check (lint + format)
```

## Project Structure

```
go-cli/
├── main.go                     # Entry point
├── cmd/root.go                 # Cobra root command
├── internal/greeting/          # Business logic
├── integration-tests/          # CLI integration tests
└── e2e-tests/                  # E2E subprocess tests
```

## License

MIT
