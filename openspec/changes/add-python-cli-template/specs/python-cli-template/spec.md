# Python CLI Template Specification

## ADDED Requirements

### Requirement: CLI Application Framework
The template MUST provide a Click-based CLI application framework with a hello world command that demonstrates basic CLI functionality.

#### Scenario: User runs the main CLI command
Given the Python CLI template is properly installed and configured
When the user executes `make run-main` or directly runs the CLI
Then the application MUST output "hello world" to the console
And the exit code MUST be 0

### Requirement: Testing Infrastructure
The template MUST include comprehensive testing setup with unit, integration, and E2E tests using pytest.

#### Scenario: Developer runs unit tests
Given the unit tests are implemented in the tests/ directory
When the developer executes `make run-test`
Then all unit tests MUST pass
And test coverage MUST be reported

#### Scenario: Developer runs integration tests
Given the integration tests are implemented in the integration-tests/ directory
When the developer executes `make run-integration-tests`
Then all integration tests MUST pass
And CLI commands MUST be tested end-to-end

#### Scenario: Developer runs E2E tests
Given the E2E tests are implemented in the e2e-tests/ directory
When the developer executes `make run-e2e-tests`
Then all E2E tests MUST pass
And the CLI MUST be tested in isolated environments

### Requirement: Project Configuration with uv
The template MUST use uv for dependency management and package configuration defined in pyproject.toml.

#### Scenario: User sets up the project
Given a fresh checkout of the template
When the user runs `uv sync` or similar uv command
Then all dependencies MUST be installed
And the project MUST be ready for development

### Requirement: Code Quality with ruff
The template MUST use ruff for linting, formatting, and import sorting with appropriate configuration.

#### Scenario: Developer runs linting
Given the codebase is implemented
When the developer executes `make run-lint`
Then ruff MUST check for code quality issues
And any violations MUST be reported

#### Scenario: Developer formats code
Given the codebase needs formatting
When the developer executes `make run-format`
Then ruff MUST apply formatting rules
And the code MUST conform to style guidelines

### Requirement: Type Safety with pydantic
The template MUST include pydantic for data validation and demonstrate proper type hints throughout the codebase.

#### Scenario: CLI processes input data
Given the CLI accepts input parameters
When processing the data
Then pydantic models MUST validate the input
And type hints MUST be used throughout

### Requirement: Development Tooling
The template MUST include a Makefile with convenient commands for common development tasks.

#### Scenario: Developer needs to run common tasks
Given the Makefile is properly configured
When the developer runs any of the following commands:
- `make run-main` - Should execute the CLI
- `make run-test` - Should run unit tests
- `make run-integration-tests` - Should run integration tests
- `make run-e2e-tests` - Should run E2E tests
- `make run-lint` - Should run the linter
- `make run-format` - Should apply formatting
Then the corresponding task MUST execute successfully

### Requirement: Documentation
The template MUST include comprehensive documentation explaining how to set up, run, and develop the CLI application.

#### Scenario: New user wants to use the template
Given the README.md is comprehensive
When a new user reads it
Then they MUST understand:
- How to install dependencies using uv
- How to run the CLI application
- How to run tests
- How to contribute to the project
- The project structure and conventions