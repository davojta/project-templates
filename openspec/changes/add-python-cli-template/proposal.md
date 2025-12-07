# Add Python CLI Template

## Summary
Proposing to add a new Python CLI template at `/python-cli` that mirrors the structure of the existing Node.js TypeScript CLI template while using modern Python tooling (uv, pytest, ruff, pydantic).

## Problem Statement
The project currently lacks a Python CLI template that demonstrates modern Python development practices. Users need a well-structured starting point for Python CLI applications that includes proper testing, linting, and project organization.

## Proposed Solution
Create a comprehensive Python CLI template with:
- uv for fast dependency management
- pytest for testing framework with unit/integration/e2e tests
- ruff for linting and formatting
- pydantic for data validation and type safety
- click-based CLI with a hello world example
- Makefile with convenient commands
- Comprehensive README with setup and usage instructions

## Key Features
1. **CLI Application**: Click-based CLI with hello world functionality
2. **Testing Suite**: Unit, integration, and E2E tests using pytest
3. **Code Quality**: ruff for linting and formatting
4. **Type Safety**: Python type hints and pydantic models
5. **Tooling**: Makefile with common development commands
6. **Documentation**: Comprehensive README with examples

## Dependencies
- uv (package manager)
- pytest (testing framework)
- ruff (linter/formatter)
- click (CLI framework)
- pydantic (data validation)
- Python 3.10+ (for modern features while maintaining good compatibility)

## Alternatives Considered
1. **Poetry instead of uv**: uv is significantly faster and more modern
2. **argparse instead of click**: click provides better UX and more features
3. **pytest only**: Keeping all three test levels matches the Node.js template structure

## Implementation Plan
See attached tasks.md for detailed implementation steps.

## Success Criteria
- Template can be installed and run with `make run-main`
- All tests pass with `make run-test`
- Code passes linting with `make run-lint`
- README provides clear setup instructions
- Structure matches Node.js template patterns