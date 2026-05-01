# Project: go-cli

Minimal CLI template using Go with Cobra for argument parsing.

## Tech Stack

- **Language**: Go 1.22+
- **CLI Framework**: Cobra
- **Testing**: stdlib `testing`
- **Lint**: golangci-lint
- **Format**: gofmt

## Commands

```bash
make run-main                 # Run the CLI (Hello, World!)
make build                    # Build binary to bin/go-cli
make run-test                 # Unit tests with coverage
make run-integration-tests    # Integration tests (Cobra command wiring)
make run-e2e-tests            # E2E tests (subprocess binary execution)
make run-all-tests            # All three test suites
make run-lint                 # Lint with golangci-lint
make run-format               # Format with gofmt
make check                    # Lint + format check (CI target)
```

Direct go commands:

```bash
go run . --name Alice
go run . --help
go build -o bin/go-cli .
./bin/go-cli --name Bob
```

## Project Structure

```
go-cli/
├── main.go                     # Program entry point
├── cmd/
│   └── root.go                 # Cobra root command + --name flag
├── internal/
│   └── greeting/
│       ├── greeting.go         # Greet() business logic
│       └── greeting_test.go    # Unit tests
├── integration-tests/
│   └── cli_test.go             # Cobra command integration tests
├── e2e-tests/
│   └── cli_e2e_test.go         # Subprocess E2E tests
├── .golangci.yml
├── Makefile
└── go.mod
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
