# Project: bun-cli

Minimal CLI template using Bun runtime with native argument parsing.

## Tech Stack

- **Runtime**: Bun >= 1.0.0
- **Language**: TypeScript
- **Testing**: bun:test (built-in)
- **Lint/Format**: Biome

## Commands

```bash
bun run src/cli.ts          # Run the CLI
bun run src/cli.ts --name Alice  # With arguments
bun test                    # Run all tests (unit + integration + e2e)
bun test src/               # Unit tests only
bun test integration-tests/ # Integration tests only
bun test e2e-tests/         # E2E tests only
bun run lint                # Check code with Biome
bun run format              # Format code with Biome
```

## Project Structure

```
bun-cli/
├── src/
│   ├── cli.ts             # CLI entry point (argument parsing)
│   ├── main.ts            # Core logic
│   └── main.test.ts       # Unit tests
├── integration-tests/
│   └── cli.test.ts        # CLI argument parsing tests
├── e2e-tests/
│   └── cli.e2e.test.ts    # Full CLI execution via Bun.spawn()
├── biome.json
├── tsconfig.json
└── package.json
```

## Validation

```bash
# After each non-trivial edit
bun test && bun run lint

# Before committing
bun run format
```
