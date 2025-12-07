# Python CLI Template Specification

## ADDED Requirements

### Requirement: CLI Application Framework
The template MUST provide a Click-based CLI application framework with a hello world command that demonstrates basic CLI functionality.

#### Scenario: User runs the main CLI command
- **WHEN** user executes `make run-main` or directly runs the CLI
- **THEN** the application outputs "hello world" to the console
- **AND** the exit code is 0

### Requirement: Testing Infrastructure
The template MUST include comprehensive testing setup with unit, integration, and E2E tests using pytest.

#### Scenario: Developer runs unit tests
- **WHEN** developer executes `make run-test`
- **THEN** all unit tests pass
- **AND** test coverage is reported

#### Scenario: Developer runs integration tests
- **WHEN** developer executes `make run-integration-tests`
- **THEN** all integration tests pass
- **AND** CLI commands are tested end-to-end

#### Scenario: Developer runs E2E tests
- **WHEN** developer executes `make run-e2e-tests`
- **THEN** all E2E tests pass
- **AND** the CLI is tested in isolated environments

### Requirement: Project Configuration with uv
The template MUST use uv for dependency management and package configuration defined in pyproject.toml.

#### Scenario: User sets up the project
- **WHEN** user runs `uv sync` or similar uv command
- **THEN** all dependencies are installed
- **AND** the project is ready for development

### Requirement: Code Quality with ruff
The template MUST use ruff for linting, formatting, and import sorting with appropriate configuration.

#### Scenario: Developer runs linting
- **WHEN** developer executes `make run-lint`
- **THEN** ruff checks for code quality issues
- **AND** any violations are reported

#### Scenario: Developer formats code
- **WHEN** developer executes `make run-format`
- **THEN** ruff applies formatting rules
- **AND** the code conforms to style guidelines

### Requirement: Type Safety with pydantic
The template MUST include pydantic for data validation and demonstrate proper type hints throughout the codebase.

#### Scenario: CLI processes input data
- **WHEN** CLI processes input parameters
- **THEN** pydantic models validate the input
- **AND** type hints are used throughout

### Requirement: Development Tooling
The template MUST include a Makefile with convenient commands for common development tasks.

#### Scenario: Developer needs to run common tasks
- **WHEN** developer runs any of the following commands:
  - `make run-main`
  - `make run-test`
  - `make run-integration-tests`
  - `make run-e2e-tests`
  - `make run-lint`
  - `make run-format`
- **THEN** the corresponding task executes successfully

### Requirement: Documentation
The template MUST include comprehensive documentation explaining how to set up, run, and develop the CLI application.

#### Scenario: New user wants to use the template
- **WHEN** a new user reads the README.md
- **THEN** they understand:
  - How to install dependencies using uv
  - How to run the CLI application
  - How to run tests
  - How to contribute to the project
  - The project structure and conventions