# Bun CLI Template

A minimal CLI application template using Bun runtime and native argument parsing.

## Prerequisites

- [Bun](https://bun.sh) >= 1.0.0

## Installation

Install dependencies:

```bash
bun install
```

## Usage

Run the CLI:

```bash
# Default greeting
bun run src/cli.ts
# Output: Hello, World!

# Custom name
bun run src/cli.ts --name Alice
# Output: Hello, Alice!

# Show help
bun run src/cli.ts --help
```

## Available Scripts

- `bun test` - Run all tests (unit, integration, e2e)
- `bun test src/` - Run unit tests only
- `bun test integration-tests/` - Run integration tests only
- `bun test e2e-tests/` - Run e2e tests only
- `bun run lint` - Check code quality with Biome
- `bun run format` - Format code with Biome

## Project Structure

```
bun-cli/
├── src/                    # Source code
│   ├── cli.ts             # CLI entry point
│   ├── main.ts            # Core logic
│   └── main.test.ts       # Unit tests
├── integration-tests/      # Integration tests
│   └── cli.test.ts
├── e2e-tests/             # End-to-end tests
│   └── cli.e2e.test.ts
├── package.json
├── tsconfig.json
├── biome.json
└── README.md
```

## Testing

The project includes three levels of testing:

1. **Unit tests** - Test individual functions in isolation
2. **Integration tests** - Test CLI argument parsing logic
3. **E2E tests** - Test full CLI execution via `Bun.spawn()`

All tests use the built-in `bun:test` framework.
