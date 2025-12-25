# Proposal: Add Bun CLI Template

## Why

Need a minimal Bun CLI starter template following the same patterns as the existing Python CLI and Node.js TypeScript CLI templates. Bun provides fast startup times and a modern all-in-one runtime.

## What Changes

- Add new `bun-cli/` directory with:
  - Hello world CLI using native `Bun.argv` parsing (zero dependencies)
  - Unit tests with `bun:test`
  - Integration tests for CLI command parsing
  - E2E tests for full CLI execution
  - Biome for linting and formatting
  - TypeScript configuration
  - README with setup and usage instructions

## Impact

- **New Spec**: `bun-cli-template`
- **New Directory**: `bun-cli/`
- **No breaking changes**
