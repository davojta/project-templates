# Capability: Bun CLI Template

Minimal Bun CLI starter template with testing infrastructure, linting, and formatting.

## ADDED Requirements

### Requirement: Bun Runtime

The project SHALL use Bun as the runtime and package manager.

#### Scenario: Package installation
- **WHEN** running `bun install`
- **THEN** dependencies are installed
- **AND** `bun.lock` is created

### Requirement: CLI Entry Point

The CLI SHALL provide a hello world command using native Bun.argv parsing.

#### Scenario: Default greeting
- **WHEN** running `bun run src/cli.ts`
- **THEN** output is "Hello, World!"

#### Scenario: Custom name greeting
- **WHEN** running `bun run src/cli.ts --name Alice`
- **THEN** output is "Hello, Alice!"

#### Scenario: Help flag
- **WHEN** running `bun run src/cli.ts --help`
- **THEN** usage information is displayed
- **AND** available options are listed

### Requirement: Project Structure

The project SHALL follow a standard directory structure.

#### Scenario: Source organization
- **WHEN** inspecting the project
- **THEN** source code is in `src/`
- **AND** integration tests are in `integration-tests/`
- **AND** e2e tests are in `e2e-tests/`

### Requirement: Unit Testing

The project SHALL use bun:test for unit testing.

#### Scenario: Running unit tests
- **WHEN** running `bun test src/`
- **THEN** unit tests execute
- **AND** test results are reported

### Requirement: Integration Testing

The project SHALL include integration tests for CLI command parsing.

#### Scenario: Running integration tests
- **WHEN** running `bun test integration-tests/`
- **THEN** CLI parsing tests execute
- **AND** test results are reported

### Requirement: E2E Testing

The project SHALL include end-to-end tests using Bun.spawn.

#### Scenario: Running e2e tests
- **WHEN** running `bun test e2e-tests/`
- **THEN** CLI is executed via spawn
- **AND** output is verified

### Requirement: Code Quality

The project SHALL use Biome for linting and formatting.

#### Scenario: Running linter
- **WHEN** running `bun run lint`
- **THEN** Biome checks code quality
- **AND** issues are reported

#### Scenario: Running formatter
- **WHEN** running `bun run format`
- **THEN** Biome formats code
- **AND** consistent style is applied

### Requirement: Documentation

The project SHALL include a README with setup and usage instructions.

#### Scenario: README contents
- **WHEN** reading README.md
- **THEN** installation instructions are present
- **AND** usage examples are provided
- **AND** available scripts are documented
