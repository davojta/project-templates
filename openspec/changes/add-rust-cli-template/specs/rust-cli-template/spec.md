## ADDED Requirements

### Requirement: Rust CLI Template
The project SHALL provide a `rust-cli/` template that gives developers a production-ready starting point for Rust CLI applications using idiomatic tooling.

#### Scenario: Developer sets up the template
- **WHEN** a developer runs `make install` (i.e., `cargo build`)
- **THEN** the project compiles without errors

#### Scenario: Hello command default
- **WHEN** the developer runs `cargo run -- hello`
- **THEN** the CLI prints `hello world from Rust CLI!`

#### Scenario: Hello command with name
- **WHEN** the developer runs `cargo run -- hello --name Alice`
- **THEN** the CLI prints `hello world from Rust CLI, Alice!`

#### Scenario: Process command with text
- **WHEN** the developer runs `cargo run -- process "Hello there"`
- **THEN** the CLI prints `Processed: Hello there`

#### Scenario: Process command uppercase flag
- **WHEN** the developer runs `cargo run -- process "Hello there" --uppercase`
- **THEN** the CLI prints `PROCESSED: HELLO THERE`

#### Scenario: Version command
- **WHEN** the developer runs `cargo run -- version`
- **THEN** the CLI prints `rust-cli version 0.1.0`

#### Scenario: All tests pass
- **WHEN** the developer runs `make run-all-tests`
- **THEN** all unit and integration tests pass with no failures

#### Scenario: Code quality checks pass
- **WHEN** the developer runs `make check`
- **THEN** `cargo clippy` and `cargo fmt --check` both pass without errors
