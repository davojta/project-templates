## ADDED Requirements

### Requirement: Go Runtime and Module
The project SHALL use Go 1.22+ with a standard `go.mod` module definition.

#### Scenario: Module initialization
- **WHEN** inspecting `go.mod`
- **THEN** the module name is defined (e.g., `github.com/example/go-cli`)
- **AND** the Go version is 1.22 or higher

### Requirement: CLI Entry Point with Cobra
The template SHALL provide a Cobra-based CLI entry point with a `hello` command that greets the user.

#### Scenario: Default greeting
- **WHEN** running `go run ./cmd/main.go`
- **THEN** output is "Hello, World!"
- **AND** exit code is 0

#### Scenario: Custom name greeting
- **WHEN** running `go run ./cmd/main.go --name Alice`
- **THEN** output is "Hello, Alice!"
- **AND** exit code is 0

#### Scenario: Help flag
- **WHEN** running `go run ./cmd/main.go --help`
- **THEN** usage information is displayed
- **AND** available flags are listed

### Requirement: Project Structure
The project SHALL follow idiomatic Go directory layout separating CLI wiring from business logic.

#### Scenario: Source organization
- **WHEN** inspecting the project
- **THEN** CLI entry point is in `cmd/`
- **AND** business logic is in `internal/`
- **AND** integration tests are in `integration-tests/`
- **AND** E2E tests are in `e2e-tests/`

### Requirement: Unit Testing
The template SHALL use Go's standard `testing` package for unit tests co-located with the package under test.

#### Scenario: Running unit tests
- **WHEN** running `make run-test`
- **THEN** unit tests execute
- **AND** test results and coverage are reported

### Requirement: Integration Testing
The template SHALL include integration tests that exercise CLI flag parsing without spawning a subprocess.

#### Scenario: Running integration tests
- **WHEN** running `make run-integration-tests`
- **THEN** CLI argument parsing tests execute
- **AND** test results are reported

### Requirement: E2E Testing
The template SHALL include E2E tests that build and execute the binary as a subprocess.

#### Scenario: Running E2E tests
- **WHEN** running `make run-e2e-tests`
- **THEN** the CLI binary is compiled and executed
- **AND** stdout output is verified

### Requirement: Code Quality
The template SHALL use `golangci-lint` for linting and `gofmt` for formatting.

#### Scenario: Running linter
- **WHEN** running `make run-lint`
- **THEN** golangci-lint checks code quality
- **AND** any violations are reported

#### Scenario: Running formatter
- **WHEN** running `make run-format`
- **THEN** gofmt formats all Go source files
- **AND** consistent style is applied

### Requirement: Development Tooling
The template SHALL include a Makefile with commands for all common development tasks.

#### Scenario: Developer runs common tasks
- **WHEN** developer runs any of:
  - `make run-main`
  - `make run-test`
  - `make run-integration-tests`
  - `make run-e2e-tests`
  - `make run-all-tests`
  - `make run-lint`
  - `make run-format`
  - `make build`
- **THEN** the corresponding task executes successfully

### Requirement: Documentation
The template SHALL include a README with setup and usage instructions and a CLAUDE.md with stack-specific commands.

#### Scenario: New user reads README
- **WHEN** a new user reads `README.md`
- **THEN** they understand how to install Go dependencies, build, run, and test the CLI

#### Scenario: AI assistant reads CLAUDE.md
- **WHEN** an AI assistant reads `CLAUDE.md`
- **THEN** the tech stack, all make commands, and project structure are clearly documented
